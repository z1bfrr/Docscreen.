import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2. For web/iOS, it's localhost.
// For Android emulator, localhost is 10.0.2.2. For physical device, use local IP.
const BASE_URL = 'http://10.25.240.190:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Auth Token interceptor
apiClient.interceptors.request.use(async (config) => {
  // TODO: Get token from async storage
  const token = null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API = {
  auth: {
    login: (data: any) => apiClient.post('/auth/login', data),
    register: (data: any) => apiClient.post('/auth/register', data),
    me: () => apiClient.get('/auth/me'),
  },
  tests: {
    getCategories: () => apiClient.get('/tests/categories'),
    getAll: () => apiClient.get('/tests'),
    getPopular: () => apiClient.get('/tests/popular'),
  },
  packages: {
    getAll: () => apiClient.get('/packages'),
  },
  labs: {
    getAll: () => apiClient.get('/labs'),
  },
  bookings: {
    create: (data: any) => apiClient.post('/bookings', data),
    getAll: () => apiClient.get('/bookings'),
  }
};
