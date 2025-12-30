import api from './httpClient';

export const NotificationsService = {
  // ========== MÉTODOS DE USUARIO ==========
  
  // Obtener notificaciones del usuario
  getUserNotifications: async (params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/notifications/my-notifications?${queryParams}`);
    return response.data;
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId: string) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Eliminar notificación
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Obtener configuración de notificaciones del usuario
  getUserSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  // Actualizar configuración de notificaciones del usuario
  updateUserSettings: async (settings: Record<string, unknown>) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },

  // Registrar token FCM
  registerFCMToken: async (tokenData: {
    token: string;
    deviceId?: string;
    platform?: string;
  }) => {
    const response = await api.post('/notifications/fcm-token', tokenData);
    return response.data;
  },

  // Eliminar token FCM
  removeFCMToken: async (token: string) => {
    const response = await api.delete('/notifications/fcm-token', {
      data: { token }
    });
    return response.data;
  },

  // Enviar notificación de prueba
  sendTestNotification: async () => {
    const response = await api.post('/notifications/test');
    return response.data;
  },

  // ========== MÉTODOS DE ADMINISTRACIÓN ==========

  // Enviar notificación masiva (Admin)
  sendBroadcast: async (notificationData: {
    title: string;
    body: string;
    type?: string;
    imageUrl?: string;
    actionUrl?: string;
    priority?: string;
    category?: string;
    tags?: string[];
    targetAudience?: {
      hasMetroPremium?: boolean;
      pointsRange?: { min?: number; max?: number };
      regions?: string[];
      roles?: string[];
      userIds?: string[];
    };
  }) => {
    const response = await api.post('/notifications/broadcast', notificationData);
    return response.data;
  },

  // Crear template de notificación (Admin)
  createTemplate: async (templateData: {
    name: string;
    title: string;
    message: string;
    type: string;
    category?: string;
    variables?: string[];
    isActive?: boolean;
  }) => {
    const response = await api.post('/notifications/templates', templateData);
    return response.data;
  },

  // Obtener templates (Admin)
  getTemplates: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    active?: boolean;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/notifications/templates?${queryParams}`);
    return response.data;
  },

  // Actualizar template (Admin)
  updateTemplate: async (templateId: string, templateData: {
    name?: string;
    title?: string;
    message?: string;
    type?: string;
    category?: string;
    variables?: string[];
    isActive?: boolean;
  }) => {
    const response = await api.put(`/notifications/templates/${templateId}`, templateData);
    return response.data;
  },

  // Eliminar template (Admin)
  deleteTemplate: async (templateId: string) => {
    const response = await api.delete(`/notifications/templates/${templateId}`);
    return response.data;
  },

  // Obtener estadísticas de notificaciones (Admin)
  getStats: async () => {
    const response = await api.get('/notifications/admin/stats');
    return response.data;
  },

  // Obtener historial de notificaciones enviadas (Admin)
  getNotificationHistory: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    // Como no veo una ruta específica para historial, usaré my-notifications con filtros admin
    const response = await api.get(`/notifications/my-notifications?${queryParams}`);
    return response.data;
  }
};