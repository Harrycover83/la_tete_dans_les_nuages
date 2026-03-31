import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import { api } from '../services/api';

const { Title } = Typography;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  card?: { balance: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  async function fetchUsers(p = 1) {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users', { params: { page: p, limit: 20 } });
      setUsers(data.users);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(page); }, [page]);

  const columns = [
    { title: 'Nom', key: 'name', render: (_: unknown, r: User) => `${r.firstName} ${r.lastName}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>,
    },
    {
      title: 'Email vérifié',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? 'Oui' : 'Non'}</Tag>,
    },
    {
      title: 'Solde (unités)',
      key: 'balance',
      render: (_: unknown, r: User) => r.card?.balance ?? 0,
    },
    {
      title: 'Inscrit le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Utilisateurs</Title>
      <Table
        dataSource={users}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          total,
          pageSize: 20,
          current: page,
          onChange: (p) => setPage(p),
        }}
      />
    </div>
  );
}
