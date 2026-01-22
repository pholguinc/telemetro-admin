import api from './httpClient';

export const ClipsService = {
  // Obtener todos los clips con filtros
  getAll: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/clips/admin/all?${queryParams}`);
    return response.data;
  },

  // Obtener un clip específico
  getById: async (id: string) => {
    const response = await api.get(`/clips/admin/${id}`);
    return response.data;
  },

  // Crear nuevo clip
  create: async (clipData: Record<string, unknown>) => {
    const response = await api.post('/clips', clipData);
    return response.data.data;
  },

  // Actualizar clip
  update: async (id: string, clipData: Record<string, unknown>) => {
    const response = await api.put(`/clips/admin/${id}`, clipData);
    return response.data.data;
  },

  // Eliminar clip
  delete: async (id: string) => {
    const response = await api.delete(`/clips/admin/${id}`);
    return response.data;
  },

  // Moderar clip (aprobar/rechazar)
  moderate: async (id: string, moderationData: { isApproved?: boolean; status?: string; reason?: string }) => {
    const response = await api.patch(`/clips/admin/${id}/moderate`, moderationData);
    return response.data.data;
  },

  // Destacar clip
  feature: async (id: string) => {
    const response = await api.patch(`/clips/admin/${id}`, { isFeatured: true });
    return response.data.data;
  },

  // Quitar destacado
  unfeature: async (id: string) => {
    const response = await api.patch(`/clips/admin/${id}`, { isFeatured: false });
    return response.data.data;
  },

  // Aprobar clip
  approve: async (id: string) => {
    const response = await api.patch(`/clips/admin/${id}/moderate`, {
      isApproved: true,
      status: 'active'
    });
    return response.data.data;
  },

  // Rechazar clip
  reject: async (id: string, reason?: string) => {
    const response = await api.patch(`/clips/admin/${id}/moderate`, {
      isApproved: false,
      status: 'rejected',
      reason
    });
    return response.data.data;
  },

  // Obtener estadísticas de clips
  getStats: async () => {
    const response = await api.get('/clips/admin/stats');
    return response.data;
  }
};


