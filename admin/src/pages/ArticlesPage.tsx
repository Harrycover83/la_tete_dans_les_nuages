import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Switch, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

interface Article {
  id: string;
  title: string;
  category: string;
  isPinned: boolean;
  publishedAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form] = Form.useForm();

  async function fetchArticles() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/articles');
      setArticles(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchArticles(); }, []);

  async function handleSave(values: Record<string, unknown>) {
    try {
      if (editing) {
        await api.put(`/api/admin/articles/${editing.id}`, values);
        message.success('Article mis à jour');
      } else {
        await api.post('/api/admin/articles', values);
        message.success('Article créé');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchArticles();
    } catch {
      message.error('Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id: string) {
    Modal.confirm({
      title: 'Supprimer cet article ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await api.delete(`/api/admin/articles/${id}`);
        message.success('Article supprimé');
        fetchArticles();
      },
    });
  }

  function openEdit(article: Article) {
    setEditing(article);
    form.setFieldsValue(article);
    setModalOpen(true);
  }

  const columns = [
    { title: 'Titre', dataIndex: 'title', key: 'title' },
    { title: 'Catégorie', dataIndex: 'category', key: 'category' },
    { title: 'Épinglé', dataIndex: 'isPinned', key: 'isPinned', render: (v: boolean) => v ? '📌 Oui' : 'Non' },
    { title: 'Publié le', dataIndex: 'publishedAt', key: 'publishedAt', render: (v: string) => new Date(v).toLocaleDateString('fr-FR') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Article) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Articles (Gazette)</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Nouvel article
        </Button>
      </div>

      <Table dataSource={articles} columns={columns} loading={loading} rowKey="id" />

      <Modal
        title={editing ? 'Modifier l\'article' : 'Nouvel article'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={form.submit}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="title" label="Titre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Catégorie" rules={[{ required: true }]}>
            <Select options={[{ value: 'NEWS', label: 'Actualité' }, { value: 'PROMOTION', label: 'Promotion' }, { value: 'EVENT', label: 'Événement' }]} />
          </Form.Item>
          <Form.Item name="coverImage" label="URL image de couverture">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="body" label="Contenu (Markdown)" rules={[{ required: true }]}>
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item name="isPinned" label="Épingler" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="expiresAt" label="Date d'expiration (optionnel)">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
