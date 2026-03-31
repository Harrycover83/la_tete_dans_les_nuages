import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  TransactionOutlined,
  GiftOutlined,
  HomeOutlined,
  TrophyOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArticlesPage from './pages/ArticlesPage';
import UsersPage from './pages/UsersPage';
import TransactionsPage from './pages/TransactionsPage';
import PacksPage from './pages/PacksPage';
import VenuesPage from './pages/VenuesPage';
import GamesPage from './pages/GamesPage';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function ProtectedLayout() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: '/articles', icon: <FileTextOutlined />, label: <Link to="/articles">Gazette</Link> },
    { key: '/packs', icon: <GiftOutlined />, label: <Link to="/packs">Packs</Link> },
    { key: '/users', icon: <UserOutlined />, label: <Link to="/users">Utilisateurs</Link> },
    { key: '/transactions', icon: <TransactionOutlined />, label: <Link to="/transactions">Transactions</Link> },
    { key: '/venues', icon: <HomeOutlined />, label: <Link to="/venues">Salles</Link> },
    { key: '/games', icon: <TrophyOutlined />, label: <Link to="/games">Jeux</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" collapsible>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={5} style={{ color: 'white', margin: 0 }}>☁️ Admin TDLN</Title>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button icon={<LogoutOutlined />} onClick={logout} type="text" danger>
            Déconnexion
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/packs" element={<PacksPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/games" element={<GamesPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
