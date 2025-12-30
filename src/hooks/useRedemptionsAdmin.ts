import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RedemptionsAdminService } from '../services/RedemptionsAdminService';
import { MarketplaceService } from '../services/MarketplaceService';
import type { 
  RedemptionStats,
  ConfirmRedemptionData,
  DeliverRedemptionData,
  ExportRedemptionsFilters,
  Redemption
} from '../models/redemptions';
import toast from 'react-hot-toast';

// ============ QUERIES ============

export const useRedemptionStats = (stationCode?: string) => {
  return useQuery<RedemptionStats>({
    queryKey: ['redemption-stats', stationCode],
    queryFn: async () => {
      const response = await RedemptionsAdminService.getStats({ stationCode, limit: 10 });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
};

export const useRedemptions = (filters?: Record<string, unknown>) => {
  return useQuery<{ redemptions: Redemption[]; pagination: any }>({
    queryKey: ['redemptions', filters],
    queryFn: async () => {
      const response = await MarketplaceService.getAllRedemptions(filters);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
};

// ============ MUTATIONS ============

export const useConfirmRedemption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConfirmRedemptionData) => RedemptionsAdminService.confirmByCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemption-stats'] });
      toast.success('Canje confirmado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al confirmar el canje';
      toast.error(message);
    },
  });
};

export const useDeliverRedemption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeliverRedemptionData) => RedemptionsAdminService.markDeliveredByCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemption-stats'] });
      toast.success('Canje marcado como entregado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al marcar como entregado';
      toast.error(message);
    },
  });
};

export const useExportRedemptions = () => {
  return useMutation({
    mutationFn: (filters: ExportRedemptionsFilters) => RedemptionsAdminService.exportCsv(filters),
    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `canjes-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archivo exportado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al exportar canjes';
      toast.error(message);
    },
  });
};

// ============ FORM HOOKS ============

export interface ConfirmRedemptionFormData {
  code: string;
  stationName: string;
  stationCode: string;
  deviceId: string;
}

export const useConfirmRedemptionForm = () => {
  const [formData, setFormData] = useState<ConfirmRedemptionFormData>({
    code: '',
    stationName: '',
    stationCode: '',
    deviceId: '',
  });
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
    setFormData({
      code: '',
      stationName: '',
      stationCode: '',
      deviceId: '',
    });
    setFormSubmitted(false);
  }, []);

  return {
    formData,
    setFormData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    resetForm,
  };
};

export interface DeliverRedemptionFormData {
  code: string;
}

export const useDeliverRedemptionForm = () => {
  const [formData, setFormData] = useState<DeliverRedemptionFormData>({
    code: '',
  });
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
    setFormData({ code: '' });
    setFormSubmitted(false);
  }, []);

  return {
    formData,
    setFormData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    resetForm,
  };
};


