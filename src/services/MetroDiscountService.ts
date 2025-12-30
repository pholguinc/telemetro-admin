import api from './httpClient';
import type { 
  MetroPricing, 
  DiscountOptions, 
  ExportFilters,
  MetroDiscountOption,
  CreateDiscountOptionData,
  UpdateDiscountOptionData,
  User,
  UserFilters,
  UsersResponse,
  SystemDiscountOptionsConfig
} from '../models/metro-discount';

export const MetroDiscountService = {
  // Estadísticas
  getStats: async () => {
    const response = await api.get('/metro-discount/admin/stats');
    return response.data;
  },

  // Obtener todos los descuentos con filtros
  getAll: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/metro-discount/admin/all?${queryParams}`);
    return response.data;
  },

  // Exportar descuentos a CSV
  exportDiscounts: async (filters: ExportFilters = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/metro-discount/admin/export?${queryParams}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Usar descuento (marcar como usado)
  useDiscount: async (code: string, data: { operatorId?: string; stationUsed?: string }) => {
    const response = await api.patch(`/metro-discount/use/${code}`, data);
    return response.data;
  },

  // ========== CONFIGURACIONES ==========

  // Obtener precios del metro
  getPricing: async () => {
    const response = await api.get('/metro-discount/admin/pricing');
    return response.data;
  },

  // Actualizar precios del metro
  updatePricing: async (pricing: MetroPricing) => {
    const response = await api.put('/metro-discount/admin/pricing', { pricing });
    return response.data;
  },

  // Obtener opciones de descuento
  getDiscountOptions: async () => {
    const response = await api.get('/metro-discount/admin/discount-options');
    return response.data;
  },

  // Actualizar opciones de descuento
  updateDiscountOptions: async (discountOptions: DiscountOptions) => {
    const response = await api.put('/metro-discount/admin/discount-options', { discountOptions });
    return response.data;
  },

  // Toggle Metro Premium para un usuario
  toggleUserPremium: async (userId: string, premium: boolean) => {
    const response = await api.post(`/metro-discount/admin/toggle-premium/${userId}`, { premium });
    return response.data;
  },

  // ========== GESTIÓN DE OPCIONES PERSONALIZADAS ==========

  // Crear nueva opción de descuento personalizada
  createDiscountOption: async (data: CreateDiscountOptionData) => {
    const response = await api.post('/metro-discount/admin/create', data);
    return response.data;
  },

  // Obtener todas las opciones personalizadas
  getCustomDiscountOptions: async (filters?: Record<string, unknown>) => {
    const cleanParams = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/metro-discount/admin/options?${queryParams}`);
    return response.data;
  },

  // Actualizar opción de descuento
  updateDiscountOption: async (id: string, data: Partial<CreateDiscountOptionData>) => {
    const response = await api.put(`/metro-discount/admin/options/${id}`, data);
    return response.data;
  },

  // Eliminar opción de descuento
  deleteDiscountOption: async (id: string) => {
    const response = await api.delete(`/metro-discount/admin/options/${id}`);
    return response.data;
  },

  // Toggle estado de opción de descuento
  toggleDiscountOption: async (id: string) => {
    const response = await api.patch(`/metro-discount/admin/options/${id}/toggle`);
    return response.data;
  },

  // ========== GESTIÓN DE USUARIOS PREMIUM ==========

  // Obtener lista de usuarios con filtros
  getUsers: async (filters: UserFilters = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/metro-discount/admin/users?${queryParams}`);
    return response.data;
  },

  // ========== CONFIGURACIÓN DE OPCIONES DEL SISTEMA ==========

  // Obtener configuración de opciones del sistema
  getSystemDiscountOptions: async () => {
    const response = await api.get('/metro-discount/admin/discount-options');
    return response.data;
  },

  // Actualizar configuración de opciones del sistema
  updateSystemDiscountOptions: async (discountOptions: Record<string, any>) => {
    const response = await api.put('/metro-discount/admin/discount-options', { discountOptions });
    return response.data;
  },
};





