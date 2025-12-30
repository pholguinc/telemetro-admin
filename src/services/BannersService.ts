import api from './httpClient';
import type { BannersResponse } from '../models';

export const BannersService = {
  getAll: async (): Promise<BannersResponse['data']> => {
    try {
      const response = await api.get('/banners/admin/all');
     
      // Intentar diferentes estructuras de respuesta
      if (response.data?.data) {
        console.log('🔍 Using response.data.data:', response.data.data);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('🔍 Using response.data (is array):', response.data);
        return response.data;
      } else {
        console.log('🔍 Using response.data as fallback:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error in BannersService.getAll:', error);
      throw error;
    }
  },
  create: async (bannerData: Record<string, unknown>) => {
    const response = await api.post('/banners/admin', bannerData);
    return response.data;
  },
  update: async (id: string, bannerData: Record<string, unknown>) => {
    const response = await api.put(`/banners/admin/${id}`, bannerData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/banners/admin/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/banners/admin/stats');
    return response.data;
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await api.post('/banners/admin/upload', formData);
    return response.data;
  }
};


