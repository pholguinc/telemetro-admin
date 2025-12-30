import api from './httpClient';

export const RedemptionsService = {
  getAll: async () => {
    const response = await api.get('/admin/redemptions');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/redemptions/stats');
    return response.data;
  },
  confirmByCode: async (code: string) => {
    const response = await api.post('/admin/redemptions/confirm-by-code', { code });
    return response.data;
  },
  markDelivered: async (code: string) => {
    const response = await api.post('/admin/redemptions/mark-delivered-by-code', { code });
    return response.data;
  }
};


