import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: () => null
  },
  Tabs: {
    Screen: () => null
  }
}));

// Mock axios
jest.mock('axios');

// Silence warnings
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};
