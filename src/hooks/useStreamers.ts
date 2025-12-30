import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StreamersService} from '../services';
import toast from 'react-hot-toast';

// Types for streamers
interface Streamer {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  displayName?: string;
  name?: string;
  username?: string;
  bio?: string;
  category: 'gaming' | 'education' | 'music' | 'talk' | 'sports' | 'other';
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
  isLive?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  followerCount?: number;
  totalViews?: number;
  totalStreams?: number;
  streamKey?: string;
  streamUrl?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  monetization?: {
    isEnabled?: boolean;
    donationsEnabled?: boolean;
    subscriptionsEnabled?: boolean;
    pointsPerView?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface StreamSession {
  id: string;
  streamerId: string;
  streamer: Streamer;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  status: 'live' | 'ended' | 'scheduled';
  viewerCount: number;
  peakViewers: number;
  duration: number; // in seconds
  startedAt: string;
  endedAt?: string;
  scheduledFor?: string;
}

interface StreamerStats {
  totalStreamers: number;
  activeStreamers: number;
  liveStreamers: number;
  totalSessions: number;
  totalViews: number;
  averageSessionDuration: number;
  topStreamers: Streamer[];
  categoryBreakdown: Array<{
    category: string;
    count: number;
    views: number;
  }>;
}

interface CreateStreamerData extends Record<string, unknown> {
  userId: string;
  displayName: string;
  bio?: string;
  category: 'gaming' | 'education' | 'music' | 'talk' | 'sports' | 'other';
  isActive?: boolean;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  monetization?: {
    isEnabled?: boolean;
    donationsEnabled?: boolean;
    subscriptionsEnabled?: boolean;
    pointsPerView?: number;
  };
}

interface UpdateStreamerData extends Partial<CreateStreamerData> {}

interface StreamerFilters extends Record<string, unknown> {
  category?: 'gaming' | 'education' | 'music' | 'talk' | 'sports' | 'other';
  isLive?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface SessionFilters extends Record<string, unknown> {
  streamerId?: string;
  status?: 'live' | 'ended' | 'scheduled';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener streamers
export const useStreamers = (params: StreamerFilters = {}) => {
  return useQuery<Streamer[]>({
    queryKey: ['streamers', params],
    queryFn: async () => {
      const response = await StreamersService.getAll(params);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener streamer específico
export const useStreamer = (streamerId: string) => {
  return useQuery<Streamer>({
    queryKey: ['streamers', streamerId],
    queryFn: async () => {
      const response = await StreamersService.getById(streamerId);
      return response.data;
    },
    enabled: !!streamerId,
  });
};

// Hook para estadísticas de streamers
export const useStreamersStats = () => {
  return useQuery<StreamerStats>({
    queryKey: ['streamers-stats'],
    queryFn: async () => {
      const response = await StreamersService.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para sesiones de streaming
export const useStreamSessions = (params: SessionFilters = {}) => {
  return useQuery<StreamSession[]>({
    queryKey: ['stream-sessions', params],
    queryFn: async () => {
      const response = await StreamersService.getSessions(params);
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Mutations para gestión de streamers
export const useCreateStreamer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, CreateStreamerData>({
    mutationFn: (streamerData: CreateStreamerData) => StreamersService.create(streamerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streamers'] });
      queryClient.invalidateQueries({ queryKey: ['streamers-stats'] });
      toast.success('Streamer creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear streamer';
      toast.error(message);
    },
  });
};

export const useUpdateStreamer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { streamerId: string; streamerData: UpdateStreamerData }>({
    mutationFn: ({ streamerId, streamerData }: { streamerId: string; streamerData: UpdateStreamerData }) => 
      StreamersService.update(streamerId, streamerData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['streamers'] });
      queryClient.invalidateQueries({ queryKey: ['streamers', variables.streamerId] });
      toast.success('Streamer actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar streamer';
      toast.error(message);
    },
  });
};

export const useDeleteStreamer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (streamerId: string) => StreamersService.delete(streamerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streamers'] });
      queryClient.invalidateQueries({ queryKey: ['streamers-stats'] });
      toast.success('Streamer eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar streamer';
      toast.error(message);
    },
  });
};

// Hook para verificar streamer
export const useVerifyStreamer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, string>({
    mutationFn: (streamerId: string) => StreamersService.verify(streamerId),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con streamers
      queryClient.invalidateQueries({ queryKey: ['streamers'] });
      queryClient.invalidateQueries({ queryKey: ['streamers-stats'] });
      // Refetch inmediatamente
      queryClient.refetchQueries({ queryKey: ['streamers'] });
      toast.success('Streamer verificado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al verificar streamer';
      toast.error(message);
    },
  });
};

// Hook para toggle de verificación del streamer
export const useToggleVerification = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { streamerId: string; isVerified: boolean }>({
    mutationFn: ({ streamerId, isVerified }: { streamerId: string; isVerified: boolean }) => 
      StreamersService.toggleVerification(streamerId, isVerified),
    onSuccess: (data, variables) => {
      // Invalidar todas las queries relacionadas con streamers
      queryClient.invalidateQueries({ queryKey: ['streamers'] });
      queryClient.invalidateQueries({ queryKey: ['streamers-stats'] });
      // Refetch inmediatamente
      queryClient.refetchQueries({ queryKey: ['streamers'] });
      
      toast.success(
        variables.isVerified 
          ? 'Streamer verificado exitosamente' 
          : 'Verificación removida exitosamente'
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar verificación';
      toast.error(message);
    },
  });
};

// Hook para estadísticas de streamers (alias para compatibilidad)
export const useStreamerStats = () => {
  return useStreamersStats();
};

// Hook para actualizar estado de streamer
export const useUpdateStreamerStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { streamerId: string; isActive: boolean }>({
    mutationFn: ({ streamerId, isActive }: { streamerId: string; isActive: boolean }) => 
      StreamersService.updateStatus(streamerId, isActive),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con streamers
      queryClient.invalidateQueries({ queryKey: ['streamers'] });
      queryClient.invalidateQueries({ queryKey: ['streamers-stats'] });
      // Refetch inmediatamente
      queryClient.refetchQueries({ queryKey: ['streamers'] });
      toast.success('Estado del streamer actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar estado del streamer';
      toast.error(message);
    },
  });
};

// Hook para cambiar estado completo del streamer
export const useChangeStreamerStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { streamerId: string; status: string; reason?: string }>({
    mutationFn: ({ streamerId, status, reason }: { streamerId: string; status: string; reason?: string }) => 
      StreamersService.changeStatus(streamerId, status, reason),
    onSuccess: (data, variables) => {
      // Invalidar todas las queries relacionadas con streamers
      queryClient.invalidateQueries({ queryKey: ['streamers'] });
      queryClient.invalidateQueries({ queryKey: ['streamers-stats'] });
      // Refetch inmediatamente
      queryClient.refetchQueries({ queryKey: ['streamers'] });
      
      const statusLabels: Record<string, string> = {
        active: 'activado',
        inactive: 'desactivado', 
        suspended: 'suspendido',
        banned: 'baneado'
      };
      
      toast.success(`Streamer ${statusLabels[variables.status]} exitosamente`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar estado del streamer';
      toast.error(message);
    },
  });
};
