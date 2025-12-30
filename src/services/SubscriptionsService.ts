import api from './httpClient';

export const SubscriptionsService = {
  // Obtener todas las suscripciones con filtros y paginación
  getAll: async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/admin/subscriptions${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener suscripción por ID
  getById: async (subscriptionId: string) => {
    const response = await api.get(`/admin/subscriptions/${subscriptionId}`);
    return response.data;
  },

  // Crear nueva suscripción
  create: async (subscriptionData: any) => {
    const response = await api.post('/admin/subscriptions', subscriptionData);
    return response.data;
  },

  // Actualizar suscripción
  update: async (subscriptionId: string, subscriptionData: any) => {
    const response = await api.put(`/admin/subscriptions/${subscriptionId}`, subscriptionData);
    return response.data;
  },

  // Cancelar suscripción
  cancel: async (subscriptionId: string) => {
    const response = await api.put(`/admin/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get('/admin/subscriptions/stats');
    return response.data;
  },

  // Obtener ingresos
  getRevenue: async () => {
    const response = await api.get('/admin/subscriptions/revenue');
    return response.data;
  }
};