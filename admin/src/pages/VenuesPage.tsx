import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  createdAt: string;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [form] = Form.useForm();

  async function fetchVenues() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/venues');
      setVenues(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  function openCreateModal() {
    setEditingVenue(null);
    form.resetFields();
    setModalVisible(true);
  }

  function openEditModal(venue: Venue) {
    setEditingVenue(venue);
    form.setFieldsValue(venue);
    setModalVisible(true);
  }

  async function handleSubmit(values: { name: string; address: string; city: string }) {
    try {
      if (editingVenue) {
        await api.put(`/api/admin/venues/${editingVenue.id}`, values);
        message.success('Salle mise à jour');
      } else {
        await api.post('/api/admin/venues', values);
        message.success('Salle créée');
      }
      setModalVisible(false);
      fetchVenues();
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/admin/venues/${id}`);
      message.success('Salle supprimée');
      fetchVenues();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  }

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'Adresse', dataIndex: 'address', key: 'address' },
    { title: 'Ville', dataIndex: 'city', key: 'city' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Venue) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Éditer
          </Button>
          <Popconfirm
            title="Supprimer cette salle ?"
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
        <Title level={2}>Salles</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Nouvelle salle
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={venues}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editingVenue ? 'Éditer la salle' : 'Nouvelle salle'}
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
            name="address"
            label="Adresse"
            rules={[{ required: true, message: "L'adresse est requise" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="Ville"
            rules={[{ required: true, message: 'La ville est requise' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
