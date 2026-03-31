import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import { api } from '../services/api';

const { Title } = Typography;

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  user: { email: string; firstName: string; lastName: string };
  game?: { name: string };
}

const TYPE_COLORS: Record<string, string> = {
  RECHARGE: 'green',
  DEBIT: 'red',
  BONUS: 'gold',
  REFUND: 'blue',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  async function fetchTransactions(p = 1) {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/transactions', { params: { page: p, limit: 20 } });
      setTransactions(data.transactions);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTransactions(page); }, [page]);

  const columns = [
    {
      title: 'Utilisateur',
      key: 'user',
      render: (_: unknown, r: Transaction) => `${r.user.firstName} ${r.user.lastName} (${r.user.email})`,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={TYPE_COLORS[type] ?? 'default'}>{type}</Tag>,
    },
    { title: 'Montant (u)', dataIndex: 'amount', key: 'amount', render: (v: number) => v > 0 ? `+${v}` : `${v}` },
    { title: 'Solde après', dataIndex: 'balanceAfter', key: 'balanceAfter' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Jeu', key: 'game', render: (_: unknown, r: Transaction) => r.game?.name ?? '—' },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) =>
        new Date(v).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Transactions</Title>
      <Table
        dataSource={transactions}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{ total, pageSize: 20, current: page, onChange: (p) => setPage(p) }}
      />
    </div>
  );
}
