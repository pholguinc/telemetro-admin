import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipsService } from '../services';
import toast from 'react-hot-toast';

// Types for clips
interface Clip {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  views: number;
  likes: number;
  comments: number;
  shares: number;
  isFeatured: boolean;
  status: 'draft' | 'active' | 'paused' | 'reported' | 'removed';
  tags?: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClipStats {
  totalClips: number;
  activeClips: number;
  featuredClips: number;
  totalViews: number;
  totalLikes: number;
  averageDuration: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

interface UpdateClipData {
  title?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'reported' | 'removed';
  isFeatured?: boolean;
  tags?: string[];
  category?: string;
}

interface ClipFilters {
  status?: 'draft' | 'active' | 'paused' | 'reported' | 'removed';
  isFeatured?: boolean;
  category?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener clips
export const useClips = (params: ClipFilters = {}) => {
  return useQuery<Clip[]>({
    queryKey: ['clips', params],
    queryFn: async () => {
      const response = await ClipsService.getAll();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para estadísticas de clips
export const useClipStats = () => {
  return useQuery<ClipStats>({
    queryKey: ['clips-stats'],
    queryFn: async () => {
      const response = await ClipsService.getStats?.();
      return response?.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!ClipsService.getStats, // Solo si el método existe
  });
};

// Hook para obtener un clip específico
export const useClip = (id: string) => {
  return useQuery<Clip>({
    queryKey: ['clips', id],
    queryFn: async () => {
      const response = await ClipsService.getById?.(id);
      return response?.data;
    },
    enabled: !!id && !!ClipsService.getById,
  });
};

// Hook para actualizar clip
export const useUpdateClip = () => {
  const queryClient = useQueryClient();

  return useMutation<Clip, Error, { id: string; data: UpdateClipData }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateClipData }) =>
      ClipsService.update(id, data as Record<string, unknown>),
    onSuccess: async (updatedClip) => {
      // Invalidation agresiva para forzar recarga real desde DB
      await queryClient.invalidateQueries({ queryKey: ['clips'] });
      await queryClient.refetchQueries({ queryKey: ['clips'] });

      queryClient.invalidateQueries({ queryKey: ['clips', updatedClip.id] });
      queryClient.invalidateQueries({ queryKey: ['clips-stats'] });
      toast.success('Clip actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar clip';
      toast.error(message);
    },
  });
};

// Hook para eliminar clip
export const useDeleteClip = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => ClipsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['clips-stats'] });
      toast.success('Clip eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar clip';
      toast.error(message);
    },
  });
};

// Hook para crear clip
export const useCreateClip = () => {
  const queryClient = useQueryClient();

  return useMutation<Clip, Error, any>({
    mutationFn: (clipData: any) => ClipsService.create(clipData),
    onSuccess: async () => {
      // Invalidation agresiva para ignorar la respuesta inmediata del create (que podría venir con draft)
      // y forzar la recarga de la lista real desde el servidor
      await queryClient.invalidateQueries({ queryKey: ['clips'] });
      await queryClient.refetchQueries({ queryKey: ['clips'] });

      queryClient.invalidateQueries({ queryKey: ['clips-stats'] });
      toast.success('Clip creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear clip';
      toast.error(message);
    },
  });
};

// Hook para destacar/quitar destacado de clip
export const useFeatureClip = () => {
  const queryClient = useQueryClient();

  return useMutation<Clip, Error, { id: string; featured: boolean }>({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      featured ? ClipsService.feature(id) : ClipsService.unfeature(id),
    onSuccess: (_, { featured }) => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['clips-stats'] });
      toast.success(featured ? 'Clip destacado exitosamente' : 'Clip quitado de destacados');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar estado de destacado';
      toast.error(message);
    },
  });
};

// Hook para aprobar clip
export const useApproveClip = () => {
  const queryClient = useQueryClient();

  return useMutation<Clip, Error, string>({
    mutationFn: (id: string) => ClipsService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['clips-stats'] });
      toast.success('Clip aprobado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al aprobar clip';
      toast.error(message);
    },
  });
};

// Hook para rechazar clip
export const useRejectClip = () => {
  const queryClient = useQueryClient();

  return useMutation<Clip, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ClipsService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['clips-stats'] });
      toast.success('Clip rechazado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al rechazar clip';
      toast.error(message);
    },
  });
};
