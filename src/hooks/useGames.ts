import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GamesService as gamesService } from '../services';
import toast from 'react-hot-toast';

// Types for games
interface Game {
  id: string;
  name: string;
  description: string;
  category: 'puzzle' | 'action' | 'strategy' | 'casual' | 'educational' | 'trivia';
  thumbnailUrl?: string;
  gameUrl: string;
  developer: string;
  version: string;
  pointsReward: number;
  minPlayTime: number; // minimum seconds to earn points
  maxPointsPerDay: number;
  isActive: boolean;
  isFeatured: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  playCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  game: Game;
  user: {
    id: string;
    name: string;
    username: string;
  };
  score: number;
  duration: number; // in seconds
  pointsEarned: number;
  status: 'playing' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
}

interface GameStats {
  totalGames: number;
  activeGames: number;
  totalSessions: number;
  totalPointsAwarded: number;
  averageSessionDuration: number;
  popularGames: Game[];
  categoryStats: Array<{
    category: string;
    count: number;
    sessions: number;
  }>;
  dailyActiveUsers: number;
}

interface Leaderboard {
  gameId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: Array<{
    rank: number;
    userId: string;
    username: string;
    avatar?: string;
    score: number;
    pointsEarned: number;
    sessionCount: number;
  }>;
}

interface CreateGameData extends Record<string, unknown> {
  name: string;
  description: string;
  category: 'puzzle' | 'action' | 'strategy' | 'casual' | 'educational' | 'trivia';
  thumbnailUrl?: string;
  gameUrl: string;
  developer: string;
  version: string;
  pointsReward: number;
  minPlayTime: number;
  maxPointsPerDay: number;
  isActive?: boolean;
  isFeatured?: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

interface UpdateGameData extends Partial<CreateGameData> {}

interface GameFilters extends Record<string, unknown> {
  category?: 'puzzle' | 'action' | 'strategy' | 'casual' | 'educational' | 'trivia';
  difficulty?: 'easy' | 'medium' | 'hard';
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface SessionFilters extends Record<string, unknown> {
  gameId?: string;
  userId?: string;
  status?: 'playing' | 'completed' | 'abandoned';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener todos los juegos
export const useGames = (params: GameFilters = {}) => {
  return useQuery<Game[]>({
    queryKey: ['games', params],
    queryFn: async () => {
      const response = await gamesService.getAll();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un juego específico
export const useGame = (gameId: string) => {
  return useQuery<Game>({
    queryKey: ['games', gameId],
    queryFn: async () => {
      const response = await gamesService.getById(gameId);
      return response.data;
    },
    enabled: !!gameId,
  });
};

// Hook para estadísticas de juegos
export const useGamesStats = () => {
  return useQuery<GameStats>({
    queryKey: ['games-stats'],
    queryFn: async () => {
      const response = await gamesService.getStats?.();
      return response?.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!gamesService.getStats,
  });
};

// Hook para obtener sesiones de juego
export const useGameSessions = (params: SessionFilters = {}) => {
  return useQuery<GameSession[]>({
    queryKey: ['game-sessions', params],
    queryFn: async () => {
      const response = await gamesService.getSessions?.(params);
      return response?.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: !!gamesService.getSessions,
  });
};

// Hook para obtener leaderboard
export const useGameLeaderboard = (gameId: string, period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly') => {
  return useQuery<Leaderboard>({
    queryKey: ['game-leaderboard', gameId, period],
    queryFn: async () => {
      const response = await gamesService.getLeaderboard?.(gameId, period);
      return response?.data;
    },
    enabled: !!gameId && !!gamesService.getLeaderboard,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Mutations para gestión de juegos
export const useCreateGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Game, Error, CreateGameData>({
    mutationFn: (gameData: CreateGameData) => gamesService.create(gameData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games-stats'] });
      toast.success('Juego creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear el juego';
      toast.error(message);
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Game, Error, { gameId: string; gameData: UpdateGameData }>({
    mutationFn: ({ gameId, gameData }: { gameId: string; gameData: UpdateGameData }) => 
      gamesService.update(gameId, gameData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games', variables.gameId] });
      toast.success('Juego actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar el juego';
      toast.error(message);
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (gameId: string) => gamesService.delete(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games-stats'] });
      toast.success('Juego eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar el juego';
      toast.error(message);
    },
  });
};

// Hook para activar/desactivar juego
export const useToggleGameStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Game, Error, { gameId: string; isActive: boolean }>({
    mutationFn: ({ gameId, isActive }: { gameId: string; isActive: boolean }) => 
      gamesService.toggleStatus?.(gameId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Estado del juego actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar estado del juego';
      toast.error(message);
    },
    enabled: !!gamesService.toggleStatus,
  });
};

// Hook para destacar juego
export const useFeatureGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Game, Error, string>({
    mutationFn: (gameId: string) => gamesService.feature?.(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Juego destacado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al destacar juego';
      toast.error(message);
    },
    enabled: !!gamesService.feature,
  });
};
