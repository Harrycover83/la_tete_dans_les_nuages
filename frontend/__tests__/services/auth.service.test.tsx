import axios from 'axios';
import { authService } from '../../services/auth.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockData = {
        user: { id: '1', email: 'test@test.com', firstName: 'Test' },
        tokens: { accessToken: 'token123', refreshToken: 'refresh123' }
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await authService.register({
        email: 'test@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

      expect(result).toEqual(mockData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const mockData = {
        user: { id: '1', email: 'test@test.com' },
        tokens: { accessToken: 'token123', refreshToken: 'refresh123' }
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await authService.login('test@test.com', 'Password123!');

      expect(result).toEqual(mockData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'Password123!'
      });
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await authService.logout('refresh123');

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'refresh123'
      });
    });
  });
});
