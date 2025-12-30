import api from './httpClient';

export const AdsService = {
  // Gestión de anuncios
  getAll: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/ads?${queryParams}`);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/ads/${id}`);
    return response.data;
  },
  
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/ads', data);
    return response.data;
  },
  
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put(`/ads/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/ads/${id}`);
    return response.data;
  },
  
  toggleStatus: async (id: string, status: string) => {
    const response = await api.patch(`/ads/${id}/status`, { status });
    return response.data;
  },
  
  // Métricas y analytics
  getMetrics: async (id: string, params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/ads/${id}/metrics?${queryParams}`);
    return response.data;
  },
  
  recordInteraction: async (id: string, data: { type: string; userId?: string; metadata?: any }) => {
    const response = await api.post(`/ads/${id}/interaction`, data);
    return response.data;
  },
  
  recordView: async (id: string) => {
    const response = await api.post(`/ads/${id}/view`);
    return response.data;
  },
  
  recordClick: async (id: string) => {
    const response = await api.post(`/ads/${id}/click`);
    return response.data;
  },
  
  // Anuncios para la app
  getActiveAds: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/ads/active?${queryParams}`);
    return response.data;
  },
  
  // Estadísticas generales
  getStats: async () => {
    const response = await api.get('/ads/stats');
    return response.data;
  },

  // Upload de archivos
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/ads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export const adsService = AdsService;


