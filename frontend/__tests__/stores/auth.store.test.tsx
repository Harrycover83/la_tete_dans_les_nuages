import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../../stores/auth.store';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false
    });
    jest.clearAllMocks();
  });

  it('should initialize with unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should set user and tokens on setAuth', async () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: '1', email: 'test@test.com', firstName: 'Test' };
    const mockTokens = { accessToken: 'token123', refreshToken: 'refresh123' };

    await act(async () => {
      await result.current.setAuth(mockUser, mockTokens);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.accessToken).toBe('token123');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'token123');
  });

  it('should clear auth on logout', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    // Set initial auth
    await act(async () => {
      await result.current.setAuth(
        { id: '1', email: 'test@test.com', firstName: 'Test' },
        { accessToken: 'token123', refreshToken: 'refresh123' }
      );
    });

    // Logout
    await act(async () => {
      await result.current.clearAuth();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });
});
