import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PremiumService } from '../services/PremiumService';
import type { 
  PremiumSubscription, 
  PremiumStats, 
  PaymentConfig,
  ActivatePremiumData 
} from '../models/premium';
import toast from 'react-hot-toast';

// ============ TYPES ============

export interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// ============ QUERIES ============

export const usePremiumStats = () => {
  return useQuery<PremiumStats>({
    queryKey: ['premium-stats'],
    queryFn: async () => {
      const response = await PremiumService.getStats();
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const usePremiumSubscriptions = (filters?: Record<string, unknown>) => {
  return useQuery<PremiumSubscription[]>({
    queryKey: ['premium-subscriptions', filters],
    queryFn: async () => {
      const response = await PremiumService.getAll(filters);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const usePaymentConfig = () => {
  return useQuery<PaymentConfig>({
    queryKey: ['payment-config'],
    queryFn: async () => {
      const response = await PremiumService.getPaymentConfig();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePremiumPlans = () => {
  return useQuery({
    queryKey: ['premium-plans'],
    queryFn: async () => {
      const response = await PremiumService.getPlans();
      return response.data;
    },
    staleTime: 60 * 60 * 1000,
  });
};

// ============ MUTATIONS ============

export const useApprovePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => PremiumService.approvePayment(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['premium-stats'] });
      toast.success('Pago aprobado y Premium activado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al aprobar el pago';
      toast.error(message);
    },
  });
};

export const useRejectPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) => 
      PremiumService.rejectPayment(subscriptionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['premium-stats'] });
      toast.success('Pago rechazado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al rechazar el pago';
      toast.error(message);
    },
  });
};

export const useActivatePremium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ActivatePremiumData }) => 
      PremiumService.activatePremium(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['premium-stats'] });
      toast.success('Premium activado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al activar Premium';
      toast.error(message);
    },
  });
};

export const useUpdatePaymentConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { yapeNumber: string; plinNumber: string }) => 
      PremiumService.updatePaymentConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-config'] });
      toast.success('Configuración de pagos actualizada');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar configuración';
      toast.error(message);
    },
  });
};

// ============ FORM HOOKS ============

export interface ActivatePremiumFormData {
  selectedUser: User | null;
  plan: 'monthly' | 'quarterly' | 'yearly';
  duration: number;
}

export const useActivatePremiumForm = (onReset?: () => void) => {
  const [formData, setFormData] = useState<ActivatePremiumFormData>({
    selectedUser: null,
    plan: 'monthly',
    duration: 1,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value, 10) : value,
    }));
  }, []);

  const handleUserSelect = useCallback((user: User | null) => {
    setFormData(prev => ({ ...prev, selectedUser: user }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      selectedUser: null,
      plan: 'monthly',
      duration: 1,
    });
    setFormSubmitted(false);
    onReset?.();
  }, [onReset]);

  return {
    formData,
    setFormData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleUserSelect,
    resetForm,
  };
};

export interface RejectPaymentFormData {
  reason: string;
}

export const useRejectPaymentForm = () => {
  const [formData, setFormData] = useState<RejectPaymentFormData>({
    reason: '',
  });

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ reason: '' });
  }, []);

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm,
  };
};

export interface PaymentConfigFormData {
  yapeNumber: string;
  plinNumber: string;
}

export const usePaymentConfigForm = (initialData?: PaymentConfigFormData) => {
  const [formData, setFormData] = useState<PaymentConfigFormData>(
    initialData || { yapeNumber: '', plinNumber: '' }
  );
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ yapeNumber: '', plinNumber: '' });
    }
    setFormSubmitted(false);
  }, [initialData]);

  return {
    formData,
    setFormData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    resetForm,
  };
};