import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetroDiscountService } from '../services/MetroDiscountService';
import type { 
  MetroDiscount, 
  MetroDiscountStats, 
  MetroPricing,
  DiscountOptions,
  PricingConfig,
  DiscountOptionsConfig,
  ExportFilters,
  MetroDiscountOption,
  CreateDiscountOptionData,
  UpdateDiscountOptionData,
  User,
  UserFilters,
  UsersResponse,
  SystemDiscountOptionsConfig
} from '../models/metro-discount';
import toast from 'react-hot-toast';

// ============ QUERIES ============

export const useMetroDiscountStats = () => {
  return useQuery<MetroDiscountStats>({
    queryKey: ['metro-discount-stats'],
    queryFn: async () => {
      const response = await MetroDiscountService.getStats();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
};

export const useMetroDiscounts = (filters?: Record<string, unknown>) => {
  return useQuery<{ discounts: MetroDiscount[]; pagination: any }>({
    queryKey: ['metro-discounts', filters],
    queryFn: async () => {
      const response = await MetroDiscountService.getAll(filters);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
};

export const useMetroPricing = () => {
  return useQuery<PricingConfig>({
    queryKey: ['metro-pricing'],
    queryFn: async () => {
      const response = await MetroDiscountService.getPricing();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useDiscountOptions = () => {
  return useQuery<DiscountOptionsConfig>({
    queryKey: ['discount-options'],
    queryFn: async () => {
      const response = await MetroDiscountService.getDiscountOptions();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ========== NUEVAS QUERIES PARA OPCIONES PERSONALIZADAS ==========

export const useCustomDiscountOptions = (filters?: Record<string, unknown>) => {
  return useQuery<{ options: MetroDiscountOption[]; pagination: any }>({
    queryKey: ['custom-discount-options', filters],
    queryFn: async () => {
      const response = await MetroDiscountService.getCustomDiscountOptions(filters);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
};

// ========== NUEVAS QUERIES PARA USUARIOS ==========

export const useUsers = (filters: UserFilters = {}) => {
  return useQuery<UsersResponse>({
    queryKey: ['users', filters],
    queryFn: async () => {
      const response = await MetroDiscountService.getUsers(filters);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
};

// ========== NUEVAS QUERIES PARA OPCIONES DEL SISTEMA ==========

export const useSystemDiscountOptions = () => {
  return useQuery<SystemDiscountOptionsConfig>({
    queryKey: ['system-discount-options'],
    queryFn: async () => {
      const response = await MetroDiscountService.getSystemDiscountOptions();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============ MUTATIONS ============

export const useUseDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: { operatorId?: string; stationUsed?: string } }) => 
      MetroDiscountService.useDiscount(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metro-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['metro-discount-stats'] });
      toast.success('Descuento usado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al usar el descuento';
      toast.error(message);
    },
  });
};

export const useUpdatePricing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pricing: MetroPricing) => MetroDiscountService.updatePricing(pricing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metro-pricing'] });
      toast.success('Precios actualizados exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar precios';
      toast.error(message);
    },
  });
};

export const useUpdateDiscountOptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discountOptions: DiscountOptions) => 
      MetroDiscountService.updateDiscountOptions(discountOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-options'] });
      toast.success('Opciones de descuento actualizadas');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar opciones';
      toast.error(message);
    },
  });
};

export const useExportDiscounts = () => {
  return useMutation({
    mutationFn: (filters: ExportFilters) => MetroDiscountService.exportDiscounts(filters),
    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `descuentos-metro-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archivo exportado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al exportar descuentos';
      toast.error(message);
    },
  });
};

// ========== NUEVAS MUTATIONS PARA OPCIONES PERSONALIZADAS ==========

export const useCreateDiscountOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscountOptionData) => MetroDiscountService.createDiscountOption(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-discount-options'] });
      toast.success('Opción de descuento creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear opción de descuento';
      toast.error(message);
    },
  });
};

export const useUpdateDiscountOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountOptionData> }) => 
      MetroDiscountService.updateDiscountOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-discount-options'] });
      toast.success('Opción de descuento actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar opción de descuento';
      toast.error(message);
    },
  });
};

export const useDeleteDiscountOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MetroDiscountService.deleteDiscountOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-discount-options'] });
      toast.success('Opción de descuento eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar opción de descuento';
      toast.error(message);
    },
  });
};

export const useToggleDiscountOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MetroDiscountService.toggleDiscountOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-discount-options'] });
      toast.success('Estado de opción actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar estado';
      toast.error(message);
    },
  });
};

// ========== NUEVAS MUTATIONS PARA USUARIOS ==========

export const useToggleUserPremium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, premium }: { userId: string; premium: boolean }) => 
      MetroDiscountService.toggleUserPremium(userId, premium),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Estado Premium actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar Premium';
      toast.error(message);
    },
  });
};

// ========== NUEVAS MUTATIONS PARA OPCIONES DEL SISTEMA ==========

export const useUpdateSystemDiscountOptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discountOptions: Record<string, any>) => 
      MetroDiscountService.updateSystemDiscountOptions(discountOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-discount-options'] });
      toast.success('Opciones del sistema actualizadas');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar opciones del sistema';
      toast.error(message);
    },
  });
};

// ============ FORM HOOKS ============

export interface UseDiscountFormData {
  code: string;
  operatorId: string;
  stationUsed: string;
}

export const useDiscountForm = () => {
  const [formData, setFormData] = useState<UseDiscountFormData>({
    code: '',
    operatorId: '',
    stationUsed: '',
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
      operatorId: '',
      stationUsed: '',
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

export const usePricingForm = (initialPricing?: MetroPricing) => {
  const [formData, setFormData] = useState<MetroPricing>(
    initialPricing || {
      single_trip: { regular: 0, university: 0, school: 0 },
      round_trip: { regular: 0, university: 0, school: 0 },
      monthly_pass: { regular: 0, university: 0, school: 0 },
    }
  );
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback((
    tripType: keyof MetroPricing,
    userType: 'regular' | 'university' | 'school',
    value: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [tripType]: {
        ...prev[tripType],
        [userType]: value,
      },
    }));
  }, []);

  const resetForm = useCallback(() => {
    if (initialPricing) {
      setFormData(initialPricing);
    }
    setFormSubmitted(false);
  }, [initialPricing]);

  return {
    formData,
    setFormData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    resetForm,
  };
};

// ========== NUEVOS FORM HOOKS ==========

export const useDiscountOptionForm = (initialData?: Partial<CreateDiscountOptionData>) => {
  const [formData, setFormData] = useState<CreateDiscountOptionData>({
    discountType: '',
    discountValue: 0,
    pointsRequired: 0,
    cantidad_disponible: 0,
    fecha_expiracion: '',
    premiumOnly: false,
    description: '',
    enabled: true,
    ...initialData,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      discountType: '',
      discountValue: 0,
      pointsRequired: 0,
      cantidad_disponible: 0,
      fecha_expiracion: '',
      premiumOnly: false,
      description: '',
      enabled: true,
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

export const useSystemOptionsForm = (initialOptions?: Record<string, any>) => {
  const [formData, setFormData] = useState<Record<string, any>>(
    initialOptions || {}
  );
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback((
    key: string,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }, []);

  const resetForm = useCallback(() => {
    if (initialOptions) {
      setFormData(initialOptions);
    }
    setFormSubmitted(false);
  }, [initialOptions]);

  return {
    formData,
    setFormData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    resetForm,
  };
};









