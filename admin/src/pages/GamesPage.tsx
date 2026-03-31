import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

interface Game {
  id: string;
  name: string;
  description: string;
  type: string;
  venue: { name: string };
  createdAt: string;
}

interface Venue {
  id: string;
  name: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [form] = Form.useForm();

  async function fetchGames() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/games');
      setGames(data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVenues() {
    try {
      const { data } = await api.get('/api/admin/venues');
      setVenues(data);
    } catch (error) {
      message.error('Erreur lors du chargement des salles');
    }
  }

  useEffect(() => {
    fetchGames();
    fetchVenues();
  }, []);

  function openCreateModal() {
    setEditingGame(null);
    form.resetFields();
    setModalVisible(true);
  }

  function openEditModal(game: Game) {
    setEditingGame(game);
    form.setFieldsValue(game);
    setModalVisible(true);
  }

  async function handleSubmit(values: { name: string; description: string; type: string; venueId: string }) {
    try {
      if (editingGame) {
        await api.put(`/api/admin/games/${editingGame.id}`, values);
        message.success('Jeu mis à jour');
      } else {
        await api.post('/api/admin/games', values);
        message.success('Jeu créé');
      }
      setModalVisible(false);
      fetchGames();
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/admin/games/${id}`);
      message.success('Jeu supprimé');
      fetchGames();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  }

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Salle', key: 'venue', render: (_: unknown, r: Game) => r.venue.name },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Game) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Éditer
          </Button>
          <Popconfirm
            title="Supprimer ce jeu ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Supprimer
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Jeux</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Nouveau jeu
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={games}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editingGame ? 'Éditer le jeu' : 'Nouveau jeu'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'La description est requise' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Le type est requis' }]}
          >
            <Select>
              <Select.Option value="ARCADE">Arcade</Select.Option>
              <Select.Option value="VR">VR</Select.Option>
              <Select.Option value="SHOOTING">Shooting</Select.Option>
              <Select.Option value="RACING">Racing</Select.Option>
              <Select.Option value="OTHER">Autre</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="venueId"
            label="Salle"
            rules={[{ required: true, message: 'La salle est requise' }]}
          >
            <Select>
              {venues.map((v) => (
                <Select.Option key={v.id} value={v.id}>
                  {v.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
