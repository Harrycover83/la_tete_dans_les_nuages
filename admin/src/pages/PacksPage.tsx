import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;

interface Pack {
  id: string;
  name: string;
  priceEur: number;
  units: number;
  bonusUnits: number;
  isActive: boolean;
  sortOrder: number;
}

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pack | null>(null);
  const [form] = Form.useForm();

  async function fetchPacks() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/packs');
      setPacks(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPacks(); }, []);

  async function handleSave(values: Record<string, unknown>) {
    try {
      if (editing) {
        await api.put(`/api/admin/packs/${editing.id}`, values);
        message.success('Pack mis à jour');
      } else {
        await api.post('/api/admin/packs', values);
        message.success('Pack créé');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchPacks();
    } catch {
      message.error('Erreur lors de la sauvegarde');
    }
  }

  function openEdit(pack: Pack) {
    setEditing(pack);
    form.setFieldsValue(pack);
    setModalOpen(true);
  }

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'Prix (€)', dataIndex: 'priceEur', key: 'priceEur' },
    { title: 'Unités', dataIndex: 'units', key: 'units' },
    { title: 'Bonus', dataIndex: 'bonusUnits', key: 'bonusUnits' },
    { title: 'Actif', dataIndex: 'isActive', key: 'isActive', render: (v: boolean) => v ? '✅' : '❌' },
    { title: 'Ordre', dataIndex: 'sortOrder', key: 'sortOrder' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Pack) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Packs de recharge</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Nouveau pack
        </Button>
      </div>

      <Table dataSource={packs} columns={columns} loading={loading} rowKey="id" />

      <Modal
        title={editing ? 'Modifier le pack' : 'Nouveau pack'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="priceEur" label="Prix (€)" rules={[{ required: true }]}>
            <InputNumber min={0.01} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="units" label="Unités" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="bonusUnits" label="Unités bonus" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Ordre d'affichage" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Actif" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
