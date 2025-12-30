import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { MetroYaCouponsService } from '../services/metro-ya-coupons.service';
import type {
  MetroYaCoupon,
  MetroYaCouponTemplate,
  MetroYaCouponGlobalStats,
  MetroYaCouponDetail,
  CreateMetroYaCouponRequest,
  UpdateMetroYaCouponRequest,
  MetroYaCouponFilters
} from '../models/metro-ya-coupon';

// Query Keys
const QUERY_KEYS = {
  templates: ['metro-ya-coupons', 'templates'] as const,
  globalStats: ['metro-ya-coupons', 'global-stats'] as const,
  coupons: (filters: MetroYaCouponFilters) => ['metro-ya-coupons', 'list', filters] as const,
  coupon: (id: string) => ['metro-ya-coupons', 'detail', id] as const,
};

// ============ QUERIES ============

/**
 * Hook para obtener plantillas de cupones
 */
export const useCouponTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: async () => {
      console.log('🔍 useCouponTemplates queryFn called');
      try {
        const templates = await MetroYaCouponsService.getCouponTemplates();
        console.log('✅ useCouponTemplates received data:', templates);
        return templates || [];
      } catch (error) {
        console.error('❌ Error fetching coupon templates:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
};

/**
 * Hook para obtener estadísticas globales
 */
export const useCouponGlobalStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.globalStats,
    queryFn: async () => {
      console.log('🔍 useCouponGlobalStats queryFn called');
      try {
        const stats = await MetroYaCouponsService.getGlobalStats();
        console.log('✅ useCouponGlobalStats received data:', stats);
        return stats || {
          stats: {
            totalCoupons: 0,
            activeCoupons: 0,
            inactiveCoupons: 0,
            totalUsages: 0,
            uniqueUsers: 0,
          },
          topCoupons: []
        };
      } catch (error) {
        console.error('❌ Error fetching global stats:', error);
        return {
          stats: {
            totalCoupons: 0,
            activeCoupons: 0,
            inactiveCoupons: 0,
            totalUsages: 0,
            uniqueUsers: 0,
          },
          topCoupons: []
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 3,
  });
};

/**
 * Hook para obtener lista de cupones
 */
export const useCoupons = (filters: MetroYaCouponFilters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.coupons(filters),
    queryFn: async () => {
      console.log('🔍 useCoupons queryFn called with filters:', filters);
      try {
        const data = await MetroYaCouponsService.getAllCoupons(filters);
        console.log('✅ useCoupons received data:', data);
        return data || {
          coupons: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
          summary: {
            total: 0,
            active: 0,
            inactive: 0,
          }
        };
      } catch (error) {
        console.error('❌ Error fetching coupons:', error);
        return {
          coupons: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
          summary: {
            total: 0,
            active: 0,
            inactive: 0,
          }
        };
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: 3,
  });
};

/**
 * Hook para obtener detalles de un cupón
 */
export const useCouponDetail = (couponId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.coupon(couponId),
    queryFn: () => MetroYaCouponsService.getCouponById(couponId),
    enabled: !!couponId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// ============ MUTATIONS ============

/**
 * Hook para crear cupón
 */
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMetroYaCouponRequest) => MetroYaCouponsService.createCoupon(data),
    onSuccess: (newCoupon) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'global-stats'] });
      
      toast.success(`Cupón "${newCoupon.title}" creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al crear cupón';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar cupón
 */
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, data }: { couponId: string; data: UpdateMetroYaCouponRequest }) =>
      MetroYaCouponsService.updateCoupon(couponId, data),
    onSuccess: (updatedCoupon, { couponId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'list'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.coupon(couponId) });
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'global-stats'] });
      
      toast.success(`Cupón "${updatedCoupon.title}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al actualizar cupón';
      toast.error(message);
    },
  });
};

/**
 * Hook para activar/desactivar cupón
 */
export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => MetroYaCouponsService.toggleCouponStatus(couponId),
    onSuccess: (updatedCoupon, couponId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'list'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.coupon(couponId) });
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'global-stats'] });
      
      const status = updatedCoupon.isActive ? 'activado' : 'desactivado';
      toast.success(`Cupón "${updatedCoupon.title}" ${status} exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al cambiar estado del cupón';
      toast.error(message);
    },
  });
};

/**
 * Hook para eliminar cupón
 */
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => MetroYaCouponsService.deleteCoupon(couponId),
    onSuccess: (_, couponId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'list'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.coupon(couponId) });
      queryClient.invalidateQueries({ queryKey: ['metro-ya-coupons', 'global-stats'] });
      
      toast.success('Cupón eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al eliminar cupón';
      toast.error(message);
    },
  });
};

// ============ FORM HOOKS ============

/**
 * Hook para manejar formulario de creación de cupón
 */
export const useCreateCouponForm = () => {
  const [formData, setFormData] = useState<CreateMetroYaCouponRequest>({
    code: '',
    title: '',
    description: '',
    benefitType: 'discount_percentage',
    category: 'transport',
    maxUsesPerCycle: 1,
    displayOrder: 0,
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (field: keyof CreateMetroYaCouponRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      benefitType: 'discount_percentage',
      category: 'transport',
      maxUsesPerCycle: 1,
      displayOrder: 0,
    });
    setFormSubmitted(false);
  };

  const loadTemplate = (template: MetroYaCouponTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      icon: template.icon,
      benefitType: template.benefitType,
      discountPercentage: template.discountPercentage,
      discountAmount: template.discountAmount,
      pointsBonus: template.pointsBonus,
      category: template.category,
      maxUsesPerCycle: template.maxUsesPerCycle,
    }));
  };

  const createCoupon = async (data: CreateMetroYaCouponRequest) => {
    try {
      setFormSubmitted(true);
      
      // Convertir fechas al formato ISO antes de enviar
      const dataToSend = {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
      };
      
      const result = await MetroYaCouponsService.createCoupon(dataToSend);
      resetForm();
      return result;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  };

  return {
    formData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    resetForm,
    loadTemplate,
    createCoupon,
  };
};

/**
 * Hook para manejar formulario de edición de cupón
 */
export const useUpdateCouponForm = (initialData?: MetroYaCoupon) => {
  // Función para convertir fecha ISO a formato datetime-local
  const isoToDateTimeLocal = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
  };

  const [formData, setFormData] = useState<UpdateMetroYaCouponRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    icon: initialData?.icon || '',
    discountPercentage: initialData?.discountPercentage,
    discountAmount: initialData?.discountAmount,
    pointsBonus: initialData?.pointsBonus,
    category: initialData?.category || 'transport',
    maxUsesPerCycle: initialData?.maxUsesPerCycle || 1,
    displayOrder: initialData?.displayOrder || 0,
    isActive: initialData?.isActive ?? true,
    validFrom: isoToDateTimeLocal(initialData?.validFrom),
    validUntil: isoToDateTimeLocal(initialData?.validUntil),
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (field: keyof UpdateMetroYaCouponRequest, value: any) => {
    // Convertir fechas al formato ISO si es necesario
    if ((field === 'validFrom' || field === 'validUntil') && value) {
      // Si el valor viene del input datetime-local, convertirlo a ISO
      if (typeof value === 'string' && value.includes('T') && !value.includes('Z')) {
        value = new Date(value).toISOString();
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        icon: initialData.icon,
        discountPercentage: initialData.discountPercentage,
        discountAmount: initialData.discountAmount,
        pointsBonus: initialData.pointsBonus,
        category: initialData.category,
        maxUsesPerCycle: initialData.maxUsesPerCycle,
        displayOrder: initialData.displayOrder,
        isActive: initialData.isActive,
        validFrom: isoToDateTimeLocal(initialData.validFrom),
        validUntil: isoToDateTimeLocal(initialData.validUntil),
      });
    }
    setFormSubmitted(false);
  };

  return {
    formData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    resetForm,
  };
};

// Importar useState
import { useState } from 'react';
