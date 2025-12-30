import api from './httpClient';

export const SessionsService = {
  getAll: async () => {
    const response = await api.get('/admin/sessions');
    return response.data;
  },
  create: async (sessionData: Record<string, unknown>) => {
    const response = await api.post('/admin/sessions', sessionData);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/sessions/stats');
    return response.data;
  }
};


