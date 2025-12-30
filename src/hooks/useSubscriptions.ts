import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionsService } from '../services';
import { toast } from 'react-toastify';

// Types for subscriptions
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface Subscription {
  id: string;
  user: User;
  type: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  autoRenew: boolean;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  cancelled: number;
  expired: number;
  pending: number;
}

interface SubscriptionRevenue {
  total: number;
}

interface CreateSubscriptionData extends Record<string, unknown> {
  userId: string;
  type: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  autoRenew: boolean;
  transactionId?: string;
}

interface UpdateSubscriptionData extends Partial<CreateSubscriptionData> {}

interface SubscriptionFilters extends Record<string, unknown> {
  status?: 'active' | 'cancelled' | 'expired' | 'pending';
  search?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener suscripciones
export const useSubscriptions = (params: SubscriptionFilters = {}) => {
  return useQuery<{ subscriptions: Subscription[]; pagination: any }>({
    queryKey: ['subscriptions', params],
    queryFn: async () => {
      const response = await SubscriptionsService.getAll(params);
      return response.data || { subscriptions: [], pagination: {} };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener suscripción específica
export const useSubscription = (subscriptionId: string) => {
  return useQuery<Subscription>({
    queryKey: ['subscriptions', subscriptionId],
    queryFn: async () => {
      const response = await SubscriptionsService.getById(subscriptionId);
      return response.data;
    },
    enabled: !!subscriptionId,
  });
};

// Hook para estadísticas de suscripciones
export const useSubscriptionStats = () => {
  return useQuery<SubscriptionStats>({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const response = await SubscriptionsService.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para ingresos de suscripciones
export const useSubscriptionRevenue = () => {
  return useQuery<SubscriptionRevenue>({
    queryKey: ['subscription-revenue'],
    queryFn: async () => {
      const response = await SubscriptionsService.getRevenue();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Mutations para gestión de suscripciones
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, CreateSubscriptionData>({
    mutationFn: (subscriptionData: CreateSubscriptionData) => SubscriptionsService.create(subscriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-revenue'] });
      // Refetch inmediatamente
      queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      toast.success('Suscripción creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear suscripción';
      toast.error(message);
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { subscriptionId: string; subscriptionData: UpdateSubscriptionData }>({
    mutationFn: ({ subscriptionId, subscriptionData }: { subscriptionId: string; subscriptionData: UpdateSubscriptionData }) => 
      SubscriptionsService.update(subscriptionId, subscriptionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-revenue'] });
      // Refetch inmediatamente
      queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      toast.success('Suscripción actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar suscripción';
      toast.error(message);
    },
  });
};

// Hook para cancelar suscripción
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, string>({
    mutationFn: (subscriptionId: string) => SubscriptionsService.cancel(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-revenue'] });
      // Refetch inmediatamente
      queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      toast.success('Suscripción cancelada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cancelar suscripción';
      toast.error(message);
    },
  });
};