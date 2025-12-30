import api from './httpClient';

export const DonationsService = {
  // Obtener resumen de donaciones
  getOverview: async (period: string = '30d') => {
    const response = await api.get(`/donations/admin/overview?period=${period}`);
    return response.data;
  },

  // Obtener donaciones con filtros y paginación
  getDonations: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/donations/admin?${queryParams}`);
    return response.data;
  },

  // Obtener analytics de streamers
  getStreamersAnalytics: async (period: string = '30d') => {
    const response = await api.get(`/donations/admin/streamers-analytics?period=${period}`);
    return response.data;
  },

  // Obtener configuración de comisiones
  getCommissionConfig: async () => {
    const response = await api.get('/donations/admin/commission-config');
    return response.data;
  },

  // Actualizar configuración de comisiones
  updateCommissionConfig: async (config: {
    streamerPercentage: number;
    platformPercentage: number;
    minDonation: number;
    maxDonation: number;
  }) => {
    const response = await api.put('/donations/admin/commission-config', config);
    return response.data;
  },

  // Exportar reporte de donaciones
  exportReport: async (params: {
    format?: 'json' | 'csv';
    period?: string;
  } = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await api.get(`/donations/admin/export?${queryParams}`, {
      responseType: params.format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  },

  // Obtener donación específica
  getDonation: async (donationId: string) => {
    const response = await api.get(`/donations/admin/${donationId}`);
    return response.data;
  },

  // Procesar reembolso
  processRefund: async (donationId: string, reason: string) => {
    const response = await api.post(`/donations/admin/${donationId}/refund`, { reason });
    return response.data;
  },

  // Obtener estadísticas detalladas
  getDetailedStats: async (period: string = '30d') => {
    const response = await api.get(`/donations/admin/stats?period=${period}`);
    return response.data;
  }
};
