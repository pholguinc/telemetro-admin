import api from './httpClient';
import type { MarketplaceList } from '../models';

export const MarketplaceService = {
  getAllProducts: async (params: Record<string, unknown> = {}): Promise<any> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/marketplace/admin/products?${queryParams}`);
    return response.data.data || [];
  },
  getProduct: async (productId: string) => {
    const response = await api.get(`/marketplace/admin/products/${productId}`);
    return response.data;
  },
  createProduct: async (productData: Record<string, unknown>) => {
    const response = await api.post('/marketplace/admin/products', productData);
    return response.data.data;
  },
  updateProduct: async (productId: string, productData: Record<string, unknown>) => {
    const response = await api.put(`/marketplace/admin/products/${productId}`, productData);
    return response.data.data;
  },
  deleteProduct: async (productId: string) => {
    const response = await api.delete(`/marketplace/admin/products/${productId}`);
    return response.data;
  },
  getAllRedemptions: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/marketplace/admin/redemptions?${queryParams}`);
    return response.data;
  },
  getRedemption: async (redemptionId: string) => {
    const response = await api.get(`/marketplace/admin/redemptions/${redemptionId}`);
    return response.data;
  },
  confirmRedemptionByCode: async (code: string) => {
    const response = await api.post('/marketplace/admin/redemptions/confirm-by-code', { code });
    return response.data;
  },
  markDeliveredByCode: async (code: string) => {
    const response = await api.post('/marketplace/admin/redemptions/mark-delivered-by-code', { code });
    return response.data;
  },
  getMarketplaceStats: async () => {
    const response = await api.get('/marketplace/admin/stats');
    return response.data;
  },
  getAllOffers: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/marketplace/admin/offers?${queryParams}`);
    return response.data;
  },
  createOffer: async (offerData: Record<string, unknown>) => {
    const response = await api.post('/marketplace/admin/offers', offerData);
    return response.data;
  },
  updateOffer: async (offerId: string, offerData: Record<string, unknown>) => {
    const response = await api.put(`/marketplace/admin/offers/${offerId}`, offerData);
    return response.data;
  },
  toggleOfferStatus: async (offerId: string) => {
    const response = await api.patch(`/marketplace/admin/offers/${offerId}/toggle`);
    return response.data.data;
  },
  deleteOffer: async (offerId: string) => {
    const response = await api.delete(`/marketplace/admin/offers/${offerId}`);
    return response.data;
  },
  
  // Upload de archivos para productos
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

  // Upload de archivos para ofertas
  uploadOfferFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/marketplace/admin/offers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};


