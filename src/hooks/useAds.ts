import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdsService} from '../services';
import toast from 'react-hot-toast';

// Types
interface Ad {
  id: string;
  title: string;
  description?: string;
  type: 'banner' | 'interstitial' | 'video' | 'native' | 'fullscreen';
  placement: 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace' | 'profile' | 'streaming' | 'fullscreen';
  imageUrl?: string;
  videoUrl?: string;
  clickUrl?: string;
  destination?: string;
  advertiser?: string;
  status: 'draft' | 'active' | 'paused' | 'expired';
  isActive?: boolean;
  priority?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  totalSpent?: number;
  schedule?: {
    startDate: string;
    endDate: string;
  };
  createdBy?: {
    id: string;
    displayName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AdStats {
  total: number;
  active: number;
  paused: number;
  draft: number;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: string;
  };
  topPerforming: Ad[];
}

interface AdMetrics {
  ad: {
    id: string;
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
    totalSpent: number;
  };
  timeline: Record<string, {
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

export interface CreateAdData extends Record<string, unknown> {
  title: string;
  description?: string;
  type: 'banner' | 'interstitial' | 'video' | 'native' | 'fullscreen';
  placement: 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace' | 'profile' | 'streaming' | 'fullscreen';
  imageUrl?: string;
  videoUrl?: string;
  clickUrl?: string;
  destination?: string;
  advertiser?: string;
  status?: 'draft' | 'active' | 'paused' | 'expired';
  isActive?: boolean;
  priority?: number;
  schedule?: {
    startDate?: string;
    endDate?: string;
  };
}

export interface UpdateAdData extends Partial<CreateAdData> {}

interface AdFilters extends Record<string, unknown> {
  status?: 'draft' | 'active' | 'paused' | 'expired';
  type?: 'banner' | 'interstitial' | 'video' | 'native' | 'fullscreen';
  placement?: 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace' | 'profile' | 'streaming' | 'fullscreen';
  advertiser?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface MetricsParams extends Record<string, unknown> {
  startDate?: string;
  endDate?: string;
  groupBy?: 'hour' | 'day' | 'month';
}

// Hooks
export const useAds = (params: AdFilters = {}) => {
  return useQuery<{ data: Ad[]; pagination: any }>({
    queryKey: ['ads', params],
    queryFn: async () => {
      const res = await AdsService.getAll(params);
      return {
        data: res.data || [],
        pagination: res.pagination || {}
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdStats = () => {
  return useQuery<AdStats>({
    queryKey: ['ads-stats'],
    queryFn: async () => {
      const res = await AdsService.getStats();
      return res.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Ad, Error, CreateAdData>({
    mutationFn: (data: CreateAdData) => AdsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads-stats'] });
      toast.success('Anuncio creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear anuncio';
      toast.error(message);
    },
  });
};

export const useUpdateAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Ad, Error, { id: string; data: UpdateAdData }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdData }) => 
      AdsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Anuncio actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar anuncio';
      toast.error(message);
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => AdsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads-stats'] });
      toast.success('Anuncio eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar anuncio';
      toast.error(message);
    },
  });
};

export const useToggleAdStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Ad, Error, { id: string; status: 'draft' | 'active' | 'paused' | 'expired' }>({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'active' | 'paused' | 'expired' }) => 
      AdsService.toggleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Estado del anuncio actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar estado';
      toast.error(message);
    },
  });
};

export const useAdMetrics = (id: string, params: MetricsParams = {}) => {
  return useQuery<AdMetrics>({
    queryKey: ['ad-metrics', id, params],
    queryFn: async () => {
      const res = await AdsService.getMetrics(id, params);
      return res.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook para obtener un anuncio específico
export const useAd = (id: string) => {
  return useQuery<Ad>({
    queryKey: ['ad', id],
    queryFn: async () => {
      const res = await AdsService.getById(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook para registrar interacciones
export const useRecordAdInteraction = () => {
  return useMutation<any, Error, { id: string; type: 'impression' | 'click' | 'conversion'; userId?: string; metadata?: any }>({
    mutationFn: ({ id, type, userId, metadata }) => 
      AdsService.recordInteraction(id, { type, userId, metadata }),
    onError: (error: any) => {
      console.error('Error recording ad interaction:', error);
    },
  });
};

// Hook para obtener anuncios activos (para la app)
export const useActiveAds = (params: { placement?: string; type?: string; limit?: number } = {}) => {
  return useQuery<Ad[]>({
    queryKey: ['active-ads', params],
    queryFn: async () => {
      const res = await AdsService.getActiveAds(params);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
