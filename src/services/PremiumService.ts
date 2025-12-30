import api from './httpClient';
import type { ActivatePremiumData } from '../models/premium';

export const PremiumService = {
  // Estadísticas de Premium
  getStats: async () => {
    const response = await api.get('/premium/admin/stats');
    return response.data;
  },

  // Obtener todas las suscripciones
  getAll: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/premium/admin/all?${queryParams}`);
    return response.data;
  },

  // Aprobar pago pendiente
  approvePayment: async (subscriptionId: string) => {
    const response = await api.post(`/premium/admin/approve/${subscriptionId}`);
    return response.data;
  },

  // Rechazar pago pendiente
  rejectPayment: async (subscriptionId: string, reason?: string) => {
    const response = await api.post(`/premium/admin/reject/${subscriptionId}`, { reason });
    return response.data;
  },

  // Activar Premium manualmente
  activatePremium: async (userId: string, data: ActivatePremiumData) => {
    const response = await api.post(`/premium/admin/activate/${userId}`, data);
    return response.data;
  },

  // Obtener configuración de pagos
  getPaymentConfig: async () => {
    const response = await api.get('/premium/admin/payment-config');
    return response.data;
  },

  // Actualizar configuración de pagos
  updatePaymentConfig: async (data: { yapeNumber: string; plinNumber: string }) => {
    const response = await api.put('/premium/admin/payment-config', data);
    return response.data;
  },

  // Obtener planes disponibles
  getPlans: async () => {
    const response = await api.get('/premium/plans');
    return response.data;
  },
};


