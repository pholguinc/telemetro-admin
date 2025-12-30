import { useQuery } from '@tanstack/react-query';
import { StatsService as statsService } from '../services';
import { AdminStats } from '../models';

// Types for dashboard statistics
interface DashboardStats {
  users: {
    total: number;
    active: number;
    growth?: number;
    newToday?: number;
  };
  banners: {
    total: number;
    active: number;
    impressions?: number;
    clicks?: number;
  };
  games?: {
    total: number;
    active: number;
    sessions?: number;
  };
  jobs?: {
    total: number;
    active: number;
    applications?: number;
  };
  marketplace?: {
    products: number;
    orders: number;
    revenue: number;
  };
  engagement?: {
    dailyActiveUsers: number;
    sessionDuration: number;
    bounceRate: number;
  };
}

// Hook para estadísticas del dashboard
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await statsService.getDashboard();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos
  });
};

// Hook para estadísticas de administrador (usando el tipo existente)
export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await statsService.getAdminStats?.();
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!statsService.getAdminStats, // Solo si el método existe
  });
};
