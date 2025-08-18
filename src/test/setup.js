import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Set React 19 environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock Firebase config
vi.mock('../config/firebase', () => {
  return import('./mocks/firebase.js');
});

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', () => {
  return import('./mocks/firebase.js');
});

// Mock Netlify functions
global.fetch = vi.fn();

// Setup test environment variables for Firebase with valid PEM format
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nwxBjRb7VnPiGXgwwgHGjRoyz6nFe5PRiGe/WwddvVBrqZdjdxTxw0XpbBvr0rCs8\nkTrHlHs2wgTNiNqBUN9xhcxzK8YqbHAQvj2hSWxfEtRt6zx0Tnq0VeRi8CrRjKqI\nqVhcKr7ykAPaVYdiwt1fSyfa5IS2d+aLu/Zg4N2ewdXkRhCuFy5KvDei+X3Fpd4U\n+KQENF6cAa5MdVfwwjN0cRBcYGUzEQIDAQABAoIBAD4f4/c2HqBqGRD+g6CtqKqk\n-----END PRIVATE KEY-----';

// Setup other test environment variables
process.env.REACT_APP_CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.REACT_APP_CLOUDINARY_API_KEY = 'test-key';
process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET = 'test-preset';

// Mock console methods to reduce test noise
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};



