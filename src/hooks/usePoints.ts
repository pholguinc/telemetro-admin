import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PointsService } from '../services/PointsService';
import toast from 'react-hot-toast';
import type {
  PointsTransaction,
  PointsOverview,
  UserPointsStats,
  PointsHistoryResponse,
  TransactionFilters as TransactionFiltersType
} from '../models/points';

interface UserPoints {
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  rank: number;
  level: number;
  nextLevelPoints: number;
  lastActivity: string;
}

interface PointsStats {
  totalPointsInCirculation: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  activeUsers: number;
  topEarners: Array<{
    userId: string;
    username: string;
    totalEarned: number;
    rank: number;
  }>;
  sourceBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  dailyActivity: Array<{
    date: string;
    earned: number;
    spent: number;
  }>;
}

interface PointsRule {
  id: string;
  name: string;
  description: string;
  source: 'game' | 'referral' | 'purchase' | 'task' | 'bonus';
  action: string;
  pointsAwarded: number;
  maxPerDay?: number;
  maxPerUser?: number;
  isActive: boolean;
  conditions?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface CreateTransactionData extends Record<string, unknown> {
  userId: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty' | 'refund';
  amount: number;
  source: 'game' | 'referral' | 'purchase' | 'admin' | 'marketplace' | 'task' | 'bonus';
  description: string;
  metadata?: Record<string, unknown>;
}

interface CreateRuleData extends Record<string, unknown> {
  name: string;
  description: string;
  source: 'game' | 'referral' | 'purchase' | 'task' | 'bonus';
  action: string;
  pointsAwarded: number;
  maxPerDay?: number;
  maxPerUser?: number;
  isActive?: boolean;
  conditions?: Record<string, unknown>;
}

interface UpdateRuleData extends Partial<CreateRuleData> {}

interface TransactionFilters extends Record<string, unknown> {
  userId?: string;
  type?: 'earned' | 'spent' | 'bonus' | 'penalty' | 'refund';
  source?: 'game' | 'referral' | 'purchase' | 'admin' | 'marketplace' | 'task' | 'bonus';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

interface UserPointsFilters extends Record<string, unknown> {
  search?: string;
  minBalance?: number;
  maxBalance?: number;
  sortBy?: 'balance' | 'totalEarned' | 'totalSpent' | 'rank';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface RuleFilters extends Record<string, unknown> {
  source?: 'game' | 'referral' | 'purchase' | 'task' | 'bonus';
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener transacciones de puntos (usando nuevo endpoint)
export const usePointsTransactions = (params: TransactionFilters = {}) => {
  return useQuery<PointsHistoryResponse>({
    queryKey: ['points-transactions', params],
    queryFn: async () => {
      const response = await PointsService.getHistory({
        page: params.page,
        limit: params.limit,
        userId: params.userId,
        source: params.source as any,
        transactionType: params.type as any,
        startDate: params.startDate,
        endDate: params.endDate
      });
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Hook para obtener puntos de usuarios (usa overview para obtener top usuarios)
export const useUserPointsBalances = (params: UserPointsFilters = {}) => {
  return useQuery<UserPoints[]>({
    queryKey: ['user-points', params],
    queryFn: async () => {
      const response = await PointsService.getOverview(30);
      // Devuelve la lista de top usuarios del overview
      return response.data?.topUsers || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener puntos de un usuario específico
export const useUserPoints = (userId: string) => {
  return useQuery<UserPoints>({
    queryKey: ['user-points', userId],
    queryFn: async () => {
      const response = await PointsService.getUserStats(userId, 30);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Hook para estadísticas de puntos (usando nuevo endpoint)
export const usePointsStats = (days: number = 30) => {
  return useQuery<PointsOverview>({
    queryKey: ['points-stats', days],
    queryFn: async () => {
      const response = await PointsService.getOverview(days);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para estadísticas legacy (compatibilidad)
export const usePointsStatsLegacy = () => {
  return useQuery<PointsStats>({
    queryKey: ['points-stats-legacy'],
    queryFn: async () => {
      const response = await PointsService.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener reglas de puntos
export const usePointsRules = (params: RuleFilters = {}) => {
  return useQuery<PointsRule[]>({
    queryKey: ['points-rules', params],
    queryFn: async () => {
      // TODO: Implementar endpoint de reglas en el backend
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener una regla específica
export const usePointsRule = (ruleId: string) => {
  return useQuery<PointsRule>({
    queryKey: ['points-rules', ruleId],
    queryFn: async () => {
      // TODO: Implementar endpoint de regla por ID en el backend
      return {} as PointsRule;
    },
    enabled: !!ruleId,
  });
};

// Hook para obtener leaderboard de puntos
export const usePointsLeaderboard = (period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'monthly', limit: number = 100) => {
  return useQuery<Array<{
    rank: number;
    userId: string;
    username: string;
    avatar?: string;
    points: number;
    change: number;
  }>>({
    queryKey: ['points-leaderboard', period, limit],
    queryFn: async () => {
      // TODO: Implementar endpoint de leaderboard en el backend
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Mutations para gestión de transacciones
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PointsTransaction, Error, CreateTransactionData>({
    mutationFn: async (transactionData: CreateTransactionData) => {
      // TODO: Implementar endpoint de crear transacción en el backend
      return {} as PointsTransaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['points-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-points', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-points'] });
      queryClient.invalidateQueries({ queryKey: ['points-stats'] });
      queryClient.invalidateQueries({ queryKey: ['points-leaderboard'] });
      toast.success('Transacción de puntos creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear transacción';
      toast.error(message);
    },
  });
};

// Hook para ajustar puntos de usuario (admin)
export const useAdjustUserPoints = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PointsTransaction, Error, { userId: string; amount: number; reason: string }>({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      // TODO: Implementar endpoint de ajustar puntos en el backend
      return {} as PointsTransaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['points-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-points', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-points'] });
      queryClient.invalidateQueries({ queryKey: ['points-stats'] });
      queryClient.invalidateQueries({ queryKey: ['points-leaderboard'] });
      toast.success('Puntos ajustados exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al ajustar puntos';
      toast.error(message);
    },
  });
};

// Mutations para gestión de reglas
export const useCreateRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PointsRule, Error, CreateRuleData>({
    mutationFn: async (ruleData: CreateRuleData) => {
      // TODO: Implementar endpoint de crear regla en el backend
      return {} as PointsRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-rules'] });
      toast.success('Regla de puntos creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear regla';
      toast.error(message);
    },
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PointsRule, Error, { ruleId: string; ruleData: UpdateRuleData }>({
    mutationFn: async ({ ruleId, ruleData }: { ruleId: string; ruleData: UpdateRuleData }) => {
      // TODO: Implementar endpoint de actualizar regla en el backend
      return {} as PointsRule;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['points-rules'] });
      queryClient.invalidateQueries({ queryKey: ['points-rules', variables.ruleId] });
      toast.success('Regla de puntos actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar regla';
      toast.error(message);
    },
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (ruleId: string) => {
      // TODO: Implementar endpoint de eliminar regla en el backend
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-rules'] });
      toast.success('Regla de puntos eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar regla';
      toast.error(message);
    },
  });
};

// Hook para activar/desactivar regla
export const useToggleRuleStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PointsRule, Error, { ruleId: string; isActive: boolean }>({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      // TODO: Implementar endpoint de toggle status regla en el backend
      return {} as PointsRule;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['points-rules'] });
      queryClient.invalidateQueries({ queryKey: ['points-rules', variables.ruleId] });
      toast.success(`Regla ${variables.isActive ? 'activada' : 'desactivada'} exitosamente`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar estado de regla';
      toast.error(message);
    },
  });
};

// Alias para compatibilidad
export const usePointsBalance = (userId?: string) => {
  if (userId) {
    return useUserPoints(userId);
  }
  return useUserPointsBalances();
};

// Hook para historial de puntos (legacy - devuelve solo el array)
export const usePointsHistory = (userId?: string) => {
  const query = usePointsTransactions(userId ? { userId } : {});
  
  return {
    ...query,
    data: query.data?.transactions || []
  };
};

// Hook para configuración de puntos
export const usePointsConfig = () => {
  return usePointsRules();
};

// Hook para progreso diario
export const useDailyProgress = (userId: string) => {
  return useQuery<{
    dailyEarned: number;
    dailyLimit: number;
    progress: number;
    tasksCompleted: number;
    availableTasks: number;
  }>({
    queryKey: ['daily-progress', userId],
    queryFn: async () => {
      // Mock data since this might not exist in service
      return {
        dailyEarned: 150,
        dailyLimit: 500,
        progress: 30,
        tasksCompleted: 3,
        availableTasks: 10
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// ========== NUEVOS HOOKS PARA ADMINISTRACIÓN ==========

// Hook para obtener overview de puntos (admin)
export const usePointsOverview = (days: number = 30) => {
  return useQuery<PointsOverview>({
    queryKey: ['points-overview', days],
    queryFn: async () => {
      const response = await PointsService.getOverview(days);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener estadísticas de usuario específico (admin)
export const useUserPointsStats = (userId: string, days: number = 30) => {
  return useQuery<UserPointsStats>({
    queryKey: ['user-points-stats', userId, days],
    queryFn: async () => {
      const response = await PointsService.getUserStats(userId, days);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Hook para exportar historial de puntos
export const useExportPointsHistory = () => {
  return useMutation<Blob, Error, {
    userId?: string;
    source?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
  }>({
    mutationFn: async (params) => {
      const blob = await PointsService.exportHistory(params);
      return blob;
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial-puntos-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Historial exportado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al exportar historial';
      toast.error(message);
    },
  });
};
