import api from './httpClient';

export const StreamersService = {
  // Método principal para obtener streamers con filtros
  getAll: async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.isLive !== undefined) queryParams.append('isLive', params.isLive.toString());
    if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/admin/streamers/all${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener streamer por ID
  getById: async (streamerId: string) => {
    const response = await api.get(`/admin/streamers/${streamerId}`);
    return response.data;
  },

  // Crear nuevo streamer
  create: async (streamerData: any) => {
    const response = await api.post('/admin/streamers', streamerData);
    return response.data;
  },

  // Actualizar streamer
  update: async (streamerId: string, streamerData: any) => {
    const response = await api.put(`/admin/streamers/${streamerId}`, streamerData);
    return response.data;
  },

  // Eliminar streamer
  delete: async (streamerId: string) => {
    const response = await api.delete(`/admin/streamers/${streamerId}`);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get('/admin/streamers/stats');
    return response.data;
  },

  // Obtener sesiones de streaming
  getSessions: async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.streamerId) queryParams.append('streamerId', params.streamerId);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/admin/streamers/sessions${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Verificar streamer
  verify: async (streamerId: string) => {
    const response = await api.put(`/admin/streamers/${streamerId}/verify`);
    return response.data;
  },

  // Actualizar estado de streamer
  updateStatus: async (streamerId: string, isActive: boolean) => {
    const response = await api.put(`/admin/streamers/${streamerId}/status`, { 
      status: isActive ? 'approved' : 'pending',
      isActive 
    });
    return response.data;
  },

  // Métodos existentes que se mantienen
  getApplications: async () => {
    const response = await api.get('/admin/streamers/applications');
    return response.data;
  },

  getActiveStreams: async () => {
    const response = await api.get('/admin/streamers/active-streams');
    return response.data;
  },

  // Buscar usuarios para convertir en streamers
  searchUsers: async (search: string, limit: number = 10) => {
    const queryParams = new URLSearchParams();
    queryParams.append('search', search);
    queryParams.append('limit', limit.toString());
    
    const response = await api.get(`/admin/streamers/search-users?${queryParams.toString()}`);
    return response.data;
  },

  // Cambiar estado completo del streamer
  changeStatus: async (streamerId: string, status: string, reason?: string) => {
    const response = await api.put(`/admin/streamers/${streamerId}/change-status`, {
      status,
      reason
    });
    return response.data;
  },

  // Toggle verificación del streamer
  toggleVerification: async (streamerId: string, isVerified: boolean) => {
    const response = await api.put(`/admin/streamers/${streamerId}/toggle-verification`, {
      isVerified
    });
    return response.data;
  }
};


