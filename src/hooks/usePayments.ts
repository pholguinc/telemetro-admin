import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/httpClient';

// Types for payments
interface Payment {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  method: 'yape' | 'plin' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  reference: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'yape' | 'plin' | 'card' | 'bank_transfer';
  isActive: boolean;
  config: Record<string, unknown>;
  fees: {
    percentage: number;
    fixed: number;
  };
  limits: {
    min: number;
    max: number;
    daily: number;
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successRate: number;
  averageAmount: number;
  methodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  dailyTrends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

interface PaymentFilters extends Record<string, unknown> {
  userId?: string;
  method?: 'yape' | 'plin' | 'card' | 'bank_transfer';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface CreatePaymentData extends Record<string, unknown> {
  userId: string;
  amount: number;
  currency: string;
  method: 'yape' | 'plin' | 'card' | 'bank_transfer';
  description: string;
  metadata?: Record<string, unknown>;
}

interface PaymentConfig {
  [key: string]: unknown;
}

// API helpers
const API_BASE_PATH = '/payments';

const sanitizeParams = (params?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!params) return undefined;
  const clean: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    clean[key] = value;
  });
  return Object.keys(clean).length ? clean : undefined;
};

const apiCall = async <T = any>(endpoint: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; params?: Record<string, unknown>; body?: any } = {}): Promise<T> => {
  const res = await api.request<T>({
    url: `${API_BASE_PATH}${endpoint}`,
    method: options.method || 'GET',
    params: sanitizeParams(options.params),
    data: options.body,
  });
  return res.data as T;
};

const mapUiStatusToApiStatus = (status?: unknown): string | undefined => {
  if (!status) return undefined;
  const s = String(status);
  switch (s) {
    case 'completed':
      return 'verified';
    case 'failed':
      return 'rejected';
    case 'cancelled':
      return 'expired';
    default:
      return s;
  }
};

// Hook para obtener pagos
export const usePayments = (params: PaymentFilters = {}) => {
  return useQuery<Payment[]>({
    queryKey: ['payments', params],
    queryFn: () => apiCall<Payment[]>('', { params }),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener un pago específico
export const usePayment = (paymentId: string) => {
  return useQuery<Payment>({
    queryKey: ['payments', paymentId],
    queryFn: () => apiCall<Payment>(`/${paymentId}`),
    enabled: !!paymentId,
  });
};

// Hook para estadísticas de pagos
export const usePaymentStats = () => {
  return useQuery<PaymentStats>({
    queryKey: ['payment-stats'],
    queryFn: () => apiCall<PaymentStats>('/stats'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para métodos de pago
export const usePaymentMethods = () => {
  return useQuery<PaymentMethod[]>({
    queryKey: ['payment-methods'],
    queryFn: () => apiCall<PaymentMethod[]>('/methods'),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para transacciones Yape/Plin
export const useYapePlinTransactions = (params: PaymentFilters = {}) => {
  return useQuery<Payment[]>({
    queryKey: ['yape-plin-transactions', params],
    queryFn: () => {
      const merged: Record<string, unknown> = { ...params };
      // Normalizar nombre del filtro del método
      if ((merged as any).paymentMethod && !(merged as any).method) {
        merged.method = (merged as any).paymentMethod;
        delete (merged as any).paymentMethod;
      }
      // Forzar Yape/Plin si no especificaron method
      if (!merged.method) {
        merged.method = 'yape,plin';
      }
      // Mapear estados del UI a estados del backend
      if (merged.status) {
        merged.status = mapUiStatusToApiStatus(merged.status) as unknown as string;
      }
      // Usar endpoint del backend para listados admin y mapear a shape del UI
      return apiCall<{ payments: any[]; pagination: any }>('/pending', { params: merged })
        .then((result) => {
          const items = Array.isArray(result?.payments) ? result.payments : [];
          return items.map((p: any): Payment => ({
            id: String(p.id || p._id),
            userId: String(p.user?.id || p.userId?._id || p.userId || ''),
            user: {
              id: String(p.user?.id || p.userId?._id || p.userId || ''),
              name: String(p.user?.name || p.user?.displayName || ''),
              email: String(p.user?.email || ''),
              phone: p.user?.phone,
            },
            amount: Number(p.amount || 0),
            currency: String(p.currency || 'PEN'),
            method: String(p.paymentMethod || p.method || 'yape') as any,
            status: ((): any => {
              const s = String(p.status || 'pending');
              if (s === 'verified') return 'completed';
              if (s === 'rejected') return 'failed';
              if (s === 'expired') return 'cancelled';
              return s as any;
            })(),
            reference: String(p.paymentCode || p.reference || ''),
            description: p.subscription?.plan ? `Suscripción ${p.subscription.plan}` : (p.description || ''),
            metadata: p.metadata,
            createdAt: String(p.createdAt || new Date().toISOString()),
            completedAt: p.paidAt ? String(p.paidAt) : undefined,
          }));
        });
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Mutations para gestión de pagos
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Payment, Error, CreatePaymentData>({
    mutationFn: (paymentData: CreatePaymentData) =>
      apiCall<Payment>('', {
        method: 'POST',
        body: paymentData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success('Pago creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear pago');
    },
  });
};

// Hook para confirmar pago
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Payment, Error, { paymentId: string; reference?: string }>({
    mutationFn: ({ paymentId, reference }: { paymentId: string; reference?: string }) => 
      apiCall<Payment>(`/${paymentId}/verify`, {
        method: 'POST',
        body: { reference, isVerified: true },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['yape-plin-transactions'] });
      toast.success('Pago confirmado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al confirmar pago');
    },
  });
};

// Hook para rechazar pago
export const useRejectPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Payment, Error, { paymentId: string; reason: string }>({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) => 
      apiCall<Payment>(`/${paymentId}/reject`, {
        method: 'POST',
        body: { reason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success('Pago rechazado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al rechazar pago');
    },
  });
};

// Hook para procesar reembolso
export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Payment, Error, { paymentId: string; amount?: number; reason: string }>({
    mutationFn: ({ paymentId, amount, reason }: { paymentId: string; amount?: number; reason: string }) => 
      apiCall<Payment>(`/${paymentId}/refund`, {
        method: 'POST',
        body: { amount, reason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success('Reembolso procesado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar reembolso');
    },
  });
};

// Hook para actualizar método de pago
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PaymentMethod, Error, { methodId: string; methodData: Partial<PaymentMethod> }>({
    mutationFn: ({ methodId, methodData }: { methodId: string; methodData: Partial<PaymentMethod> }) => 
      apiCall<PaymentMethod>(`/methods/${methodId}`, {
        method: 'PUT',
        body: methodData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Método de pago actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar método de pago');
    },
  });
};

// Alias para compatibilidad con Yape/Plin
export const useYapePlinPayments = (params: PaymentFilters = {}) => {
  return useYapePlinTransactions(params);
};

// Hook para verificar pago
export const useVerifyPayment = () => {
  return useConfirmPayment();
};

// Hook para configuración de pagos (config general)
export const usePaymentConfig = () => {
  return useQuery<PaymentConfig>({
    queryKey: ['payment-config'],
    queryFn: () => apiCall<PaymentConfig>('/config'),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para actualizar configuración de pagos (config general)
export const useUpdatePaymentConfig = () => {
  const queryClient = useQueryClient();
  return useMutation<PaymentConfig, Error, Partial<PaymentConfig>>({
    mutationFn: (config: Partial<PaymentConfig>) =>
      apiCall<PaymentConfig>('/config', {
        method: 'PUT',
        body: config,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-config'] });
      toast.success('Configuración de pagos actualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar configuración de pagos');
    },
  });
};
