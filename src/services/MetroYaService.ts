import api from './httpClient';

export const MetroYaService = {
  getOptions: async () => {
    const response = await api.get('/metro-discount/options');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/metro-discount/admin/stats');
    return response.data;
  },
  getUserDiscounts: async (params: Record<string, unknown> = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await api.get(`/metro-discount/my-discounts?${queryParams}`);
    return response.data;
  },
  validateCode: async (code: string) => {
    const response = await api.get(`/metro-discount/validate/${encodeURIComponent(code)}`);
    return response.data;
  },
  useCode: async (code: string, data: Record<string, unknown> = {}) => {
    const response = await api.patch(`/metro-discount/use/${encodeURIComponent(code)}`, data);
    return response.data;
  },
  togglePremium: async (userId: string, premium: boolean) => {
    const response = await api.post(`/metro-discounts/admin/toggle-premium/${userId}`, { premium });
    return response.data;
  }
};


