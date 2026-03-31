import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Title } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onFinish({ email, password }: { email: string; password: string }) {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'NOT_ADMIN') {
        setError('Accès réservé aux administrateurs.');
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          ☁️ Admin — Tête dans les Nuages
        </Title>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="admin@tdln.fr" />
          </Form.Item>
          <Form.Item label="Mot de passe" name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Se connecter
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
