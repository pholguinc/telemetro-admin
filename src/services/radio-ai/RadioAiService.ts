import api from '../httpClient';

export const RadioAiService = {
  // ========== MÉTODOS PÚBLICOS/USUARIO ==========

  /**
   * Generar música basada en emoción
   */
  generateMusic: async (emotion: string) => {
    const response = await api.post('/radio-ai/generate-music', { emotion });
    return response.data;
  },

  /**
   * Obtener música del usuario autenticado
   */
  getMusicByUser: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/radio-ai/get-music-by-user?${queryParams}`);
    return response.data;
  },

  /**
   * Obtener todas las músicas (público)
   */
  getAllMusic: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/radio-ai/get-all-music?${queryParams}`);
    return response.data;
  },

  /**
   * Obtener músicas por emoción específica
   */
  getMusicByEmotion: async (emotion: string, params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/radio-ai/get-music-by-emotion/${emotion}?${queryParams}`);
    return response.data;
  },

  /**
   * Obtener música por ID
   */
  getMusicById: async (id: string) => {
    const response = await api.get(`/radio-ai/get-music-by-id/${id}`);
    return response.data;
  },

  /**
   * Obtener estadísticas generales (público)
   */
  getStats: async () => {
    const response = await api.get('/radio-ai/stats');
    return response.data;
  },

  /**
   * Obtener métricas de cache
   */
  getCacheMetrics: async () => {
    const response = await api.get('/radio-ai/cache-metrics');
    return response.data;
  },

  /**
   * Obtener analíticas de uso
   */
  getUsageAnalytics: async () => {
    const response = await api.get('/radio-ai/usage-analytics');
    return response.data;
  },

  /**
   * Verificar salud del servicio
   */
  checkServiceHealth: async () => {
    const response = await api.get('/radio-ai/health');
    return response.data;
  },

  // ========== MÉTODOS ADMIN ==========

  /**
   * Obtener todas las músicas con filtros (admin)
   */
  getAll: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/radio-ai/admin/music?${queryParams}`);
    return response.data;
  },

  /**
   * Obtener una música específica (admin)
   */
  getById: async (id: string) => {
    const response = await api.get(`/radio-ai/admin/music/${id}`);
    return response.data;
  },

  /**
   * Actualizar metadata de música (admin)
   */
  update: async (id: string, musicData: Record<string, unknown>) => {
    const response = await api.put(`/radio-ai/admin/music/${id}`, musicData);
    return response.data.data;
  },

  /**
   * Cambiar estado de música (processing/completed/failed)
   */
  toggleStatus: async (id: string) => {
    const response = await api.patch(`/radio-ai/admin/music/${id}/toggle`);
    return response.data.data;
  },

  /**
   * Eliminar música (admin)
   */
  delete: async (id: string) => {
    const response = await api.delete(`/radio-ai/admin/music/${id}`);
    return response.data;
  },

  /**
   * Marcar como completada
   */
  markAsCompleted: async (id: string) => {
    const response = await api.patch(`/radio-ai/admin/music/${id}`, { status: 'completed' });
    return response.data.data;
  },

  /**
   * Marcar como fallida
   */
  markAsFailed: async (id: string, reason?: string) => {
    const response = await api.patch(`/radio-ai/admin/music/${id}`, { 
      status: 'failed',
      ...(reason && { failureReason: reason })
    });
    return response.data.data;
  },

  /**
   * Obtener estadísticas para admin
   */
  getAdminStats: async () => {
    const response = await api.get('/radio-ai/admin/music/stats');
    return response.data;
  },

  /**
   * Regenerar música (crear nueva solicitud con misma emoción)
   */
  regenerate: async (id: string) => {
    const response = await api.post(`/radio-ai/admin/music/${id}/regenerate`);
    return response.data.data;
  },

  /**
   * Actualizar URL de track manualmente
   */
  updateTrackUrl: async (id: string, trackUrl: string) => {
    const response = await api.patch(`/radio-ai/admin/music/${id}`, { trackUrl });
    return response.data.data;
  },

  /**
   * Actualizar imagen
   */
  updateImage: async (id: string, image_url: string) => {
    const response = await api.patch(`/radio-ai/admin/music/${id}`, { image_url });
    return response.data.data;
  },

  /**
   * Obtener músicas por usuario específico (admin)
   */
  getMusicByUserId: async (userId: string, params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/radio-ai/admin/music/user/${userId}?${queryParams}`);
    return response.data;
  },

  /**
   * Limpiar músicas expiradas
   */
  cleanExpired: async () => {
    const response = await api.post('/radio-ai/admin/music/clean-expired');
    return response.data;
  },

  /**
   * Obtener músicas pendientes (processing)
   */
  getPending: async () => {
    const response = await api.get('/radio-ai/admin/music?status=processing');
    return response.data;
  },

  /**
   * Obtener músicas fallidas
   */
  getFailed: async () => {
    const response = await api.get('/radio-ai/admin/music?status=failed');
    return response.data;
  },

  /**
   * Reintentar generación de música fallida
   */
  retry: async (id: string) => {
    const response = await api.post(`/radio-ai/admin/music/${id}/retry`);
    return response.data.data;
  },
};

export default RadioAiService;