import api from './httpClient';

export const PointsService = {
  // ========== MÉTODOS DE ADMINISTRACIÓN ==========
  
  // Obtener estadísticas generales de puntos
  getOverview: async (days: number = 30) => {
    const response = await api.get(`/admin/points/overview?days=${days}`);
    return response.data;
  },

  // Obtener historial detallado de puntos
  getHistory: async (params: {
    page?: number;
    limit?: number;
    userId?: string;
    source?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/admin/points/history?${queryParams}`);
    return response.data;
  },

  // Obtener estadísticas de un usuario específico
  getUserStats: async (userId: string, days: number = 30) => {
    const response = await api.get(`/admin/points/user/${userId}?days=${days}`);
    return response.data;
  },

  // Exportar historial de puntos
  exportHistory: async (params: {
    userId?: string;
    source?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/admin/points/export?${queryParams}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ========== MÉTODOS LEGACY (para compatibilidad) ==========
  
  getBalance: async () => {
    const response = await api.get('/points/balance');
    return response.data;
  },
  
  getStats: async () => {
    // Usar el nuevo endpoint de overview
    const response = await api.get('/admin/points/overview');
    return response.data;
  },
  
  getConfig: async () => {
    const response = await api.get('/points/config');
    return response.data;
  },
  
  getDailyProgress: async () => {
    const response = await api.get('/points/daily-progress');
    return response.data;
  }
};


