import api from './httpClient';
import type {
  MetroYaCoupon,
  MetroYaCouponTemplate,
  MetroYaCouponGlobalStats,
  MetroYaCouponDetail,
  CreateMetroYaCouponRequest,
  UpdateMetroYaCouponRequest,
  MetroYaCouponFilters,
  MetroYaCouponListResponse
} from '../models/metro-ya-coupon';

export const MetroYaCouponsService = {
  // Plantillas
  getCouponTemplates: async (): Promise<MetroYaCouponTemplate[]> => {
    const response = await api.get('/admin/metro-ya-coupons/templates');
    return response.data.data.templates;  // ✅ Accede a data.data
  },

  // Estadísticas globales
  getGlobalStats: async (): Promise<MetroYaCouponGlobalStats> => {
    const response = await api.get('/admin/metro-ya-coupons/stats/global');
    return response.data.data;  // ✅ Accede a data.data
  },

  // Lista de cupones
  getAllCoupons: async (filters: MetroYaCouponFilters = {}): Promise<MetroYaCouponListResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/admin/metro-ya-coupons?${queryParams}`);
    return response.data.data;  // ✅ Accede a data.data
  },

  // Crear cupón
  createCoupon: async (data: CreateMetroYaCouponRequest): Promise<MetroYaCoupon> => {
    const response = await api.post('/admin/metro-ya-coupons', data);
    return response.data.data.coupon;  // ✅ Accede a data.data.coupon
  },

  // Detalle de cupón
  getCouponById: async (couponId: string): Promise<MetroYaCouponDetail> => {
    const response = await api.get(`/admin/metro-ya-coupons/${couponId}`);
    return response.data.data;  // ✅ Accede a data.data
  },

  // Actualizar cupón
  updateCoupon: async (couponId: string, data: UpdateMetroYaCouponRequest): Promise<MetroYaCoupon> => {
    const response = await api.put(`/admin/metro-ya-coupons/${couponId}`, data);
    return response.data.data.coupon;  // ✅ Accede a data.data.coupon
  },

  // Toggle status
  toggleCouponStatus: async (couponId: string): Promise<MetroYaCoupon> => {
    const response = await api.patch(`/admin/metro-ya-coupons/${couponId}/toggle`);
    return response.data.data.coupon;  // ✅ Accede a data.data.coupon
  },

  // Eliminar
  deleteCoupon: async (couponId: string): Promise<void> => {
    await api.delete(`/admin/metro-ya-coupons/${couponId}`);
  },
};
