import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetroSessionsService as metroSessionsService } from '../services';
import toast from 'react-hot-toast';

// Force refresh - updated at 2025-09-25

// Basic types for metro sessions
interface MetroSession {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startsAt: string;
  artist: string;
  genre: string;
}

interface SessionFilters extends Record<string, unknown> {
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Hooks
export const useMetroSessions = (params: SessionFilters = {}) => {
  return useQuery<MetroSession[]>({
    queryKey: ['metro-sessions', params],
    queryFn: async () => {
      const response = await metroSessionsService.getAllSessions(params);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateMetroSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation<MetroSession, Error, Record<string, unknown>>({
    mutationFn: (data: Record<string, unknown>) => metroSessionsService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metro-sessions'] });
      toast.success('Sesión de metro creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al crear sesión');
    },
  });
};

// Alias para compatibilidad
export const useSessions = useMetroSessions;
export const useCreateSession = useCreateMetroSession;

// Hook para sesiones en vivo
export const useLiveSessions = () => {
  return useQuery<MetroSession[]>({
    queryKey: ['metro-sessions', { status: 'active' }],
    queryFn: async () => {
      const response = await metroSessionsService.getAllSessions({ status: 'active' });
      return response.data || [];
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // 1 minuto
  });
};

// Hook para estadísticas de sesiones
export const useSessionStats = () => {
  return useQuery<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    averageDuration: number;
  }>({
    queryKey: ['metro-session-stats'],
    queryFn: async () => {
      const response = await metroSessionsService.getSessionStats?.();
      return response?.data || {
        totalSessions: 0,
        activeSessions: 0,
        completedSessions: 0,
        averageDuration: 0
      };
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!metroSessionsService.getSessionStats,
  });
};

// Hook para actualizar sesión
export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation<MetroSession, Error, { sessionId: string; data: Record<string, unknown> }>({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: Record<string, unknown> }) => 
      metroSessionsService.updateSession?.(sessionId, data) || Promise.resolve({} as MetroSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metro-sessions'] });
      toast.success('Sesión actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar sesión');
    },
    enabled: !!metroSessionsService.updateSession,
  });
};

// Hook para eliminar sesión
export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (sessionId: string) => 
      metroSessionsService.deleteSession?.(sessionId) || Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metro-sessions'] });
      toast.success('Sesión eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar sesión');
    },
    enabled: !!metroSessionsService.deleteSession,
  });
};
