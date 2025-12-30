import api from './httpClient';
import type { UsersPage } from '../models';

export const UsersService = {
  getAll: async (page = 1, limit = 10, filters: Record<string, unknown> = {}): Promise<UsersPage> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v as any)])),
    });
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  create: async (userData: Record<string, unknown>) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  update: async (id: string, userData: Record<string, unknown>) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  }
};


