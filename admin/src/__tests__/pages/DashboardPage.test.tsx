import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';
import * as api from '../../services/api';

vi.mock('../../services/api');

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display dashboard stats', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({
      data: {
        totalUsers: 150,
        monthlyRevenue: 2500.75,
        totalTransactions: 320,
        totalBalance: 15000,
      },
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText(/2500\.75/)).toBeInTheDocument();
      expect(screen.getByText('320')).toBeInTheDocument();
      expect(screen.getByText('15000')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    vi.mocked(api.api.get).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });
});
