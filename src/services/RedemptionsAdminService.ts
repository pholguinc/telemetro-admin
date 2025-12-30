import api from './httpClient';
import type { 
  ConfirmRedemptionData, 
  DeliverRedemptionData,
  ExportRedemptionsFilters 
} from '../models/redemptions';

export const RedemptionsAdminService = {
  // Obtener estadísticas
  getStats: async (params: { stationCode?: string; limit?: number } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/admin/redemptions/stats?${queryParams}`);
    return response.data;
  },

  // Confirmar canje por código
  confirmByCode: async (data: ConfirmRedemptionData) => {
    const response = await api.post('/admin/redemptions/confirm-by-code', data);
    return response.data;
  },

  // Marcar como entregado por código
  markDeliveredByCode: async (data: DeliverRedemptionData) => {
    const response = await api.post('/admin/redemptions/mark-delivered-by-code', data);
    return response.data;
  },

  // Exportar a CSV
  exportCsv: async (filters: ExportRedemptionsFilters = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/admin/redemptions/export?${queryParams}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};


