import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsService } from '../services/NotificationsService';
import toast from 'react-hot-toast';

// Types for notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  status: 'sent' | 'pending' | 'failed';
  targetAudience?: {
    roles?: string[];
    userIds?: string[];
    location?: string[];
  };
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  variables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BroadcastNotificationData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  targetAudience?: {
    roles?: string[];
    userIds?: string[];
    location?: string[];
  };
  scheduledAt?: string;
  templateId?: string;
  variables?: Record<string, string>;
}

interface CreateTemplateData {
  name: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  category?: string;
  variables?: string[];
  isActive?: boolean;
}

interface UpdateTemplateData extends Partial<CreateTemplateData> {}

interface NotificationFilters {
  type?: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  status?: 'sent' | 'pending' | 'failed';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener notificaciones (historial admin)
export const useNotifications = (params: NotificationFilters = {}) => {
  return useQuery<Notification[]>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await NotificationsService.getNotificationHistory(params);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener templates de notificaciones
export const useNotificationTemplates = () => {
  return useQuery<NotificationTemplate[]>({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const response = await NotificationsService.getTemplates();
      return response.data?.templates || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para enviar notificación broadcast
export const useSendBroadcast = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Notification, Error, BroadcastNotificationData>({
    mutationFn: (payload: BroadcastNotificationData) => 
      NotificationsService.sendBroadcast({
        title: payload.title,
        body: payload.message,
        type: payload.type,
        targetAudience: payload.targetAudience
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación enviada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al enviar notificación';
      toast.error(message);
    },
  });
};

// Hook para crear template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<NotificationTemplate, Error, CreateTemplateData>({
    mutationFn: (data: CreateTemplateData) => NotificationsService.createTemplate({
      name: data.name,
      title: data.title,
      message: data.message,
      type: data.type,
      category: data.category,
      variables: data.variables,
      isActive: data.isActive
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear template';
      toast.error(message);
    },
  });
};

// Hook para actualizar template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<NotificationTemplate, Error, { id: string; data: UpdateTemplateData }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateData }) => 
      NotificationsService.updateTemplate(id, {
        name: data.name,
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        variables: data.variables,
        isActive: data.isActive
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar template';
      toast.error(message);
    },
  });
};

// Hook para eliminar template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => NotificationsService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar template';
      toast.error(message);
    },
  });
};

// Hook para obtener estadísticas de notificaciones
export const useNotificationStats = () => {
  return useQuery<{
    totalNotifications: number;
    sentNotifications: number;
    readNotifications: number;
    readRate: number;
    sendRate: number;
    notificationsByType: Array<{ _id: string; count: number }>;
    recentActivity: Array<{ _id: string; sent: number; read: number }>;
  }>({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const response = await NotificationsService.getStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para enviar notificación de prueba
export const useSendTestNotification = () => {
  return useMutation<any, Error, void>({
    mutationFn: () => NotificationsService.sendTestNotification(),
    onSuccess: () => {
      toast.success('Notificación de prueba enviada');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al enviar notificación de prueba';
      toast.error(message);
    },
  });
};
