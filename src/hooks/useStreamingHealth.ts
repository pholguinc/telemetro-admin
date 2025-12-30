import { useQuery } from '@tanstack/react-query';

// Basic types for streaming health
interface StreamingHealthMetrics {
  totalStreams: number;
  activeStreams: number;
  averageViewers: number;
  uptime: number;
  bandwidth: number;
  errors: number;
}

interface StreamHealth {
  streamId: string;
  status: 'healthy' | 'warning' | 'error';
  viewers: number;
  quality: 'high' | 'medium' | 'low';
  latency: number;
  bitrate: number;
  lastCheck: string;
}

// Hooks
export const useStreamingHealthMetrics = () => {
  return useQuery<StreamingHealthMetrics>({
    queryKey: ['streaming-health-metrics'],
    queryFn: async () => {
      // Mock data since service might not exist
      return {
        totalStreams: 150,
        activeStreams: 23,
        averageViewers: 1250,
        uptime: 99.5,
        bandwidth: 850,
        errors: 2
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
};

export const useStreamHealthStatus = () => {
  return useQuery<StreamHealth[]>({
    queryKey: ['stream-health-status'],
    queryFn: async () => {
      // Mock data since service might not exist
      return [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook para salud del backend
export const useBackendHealth = () => {
  return useQuery<{
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    responseTime: number;
    services: Array<{
      name: string;
      status: 'up' | 'down';
      responseTime: number;
    }>;
  }>({
    queryKey: ['backend-health'],
    queryFn: async () => {
      // Mock data
      return {
        status: 'healthy',
        uptime: 99.9,
        responseTime: 120,
        services: [
          { name: 'Database', status: 'up', responseTime: 45 },
          { name: 'Redis', status: 'up', responseTime: 12 },
          { name: 'Storage', status: 'up', responseTime: 89 },
        ]
      };
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

// Hook para streams activos
export const useActiveStreams = () => {
  return useQuery<Array<{
    id: string;
    title: string;
    streamerName: string;
    viewers: number;
    duration: number;
    quality: 'high' | 'medium' | 'low';
    status: 'healthy' | 'warning' | 'error';
  }>>({
    queryKey: ['active-streams'],
    queryFn: async () => {
      // Mock data
      return [
        {
          id: '1',
          title: 'Gaming Session',
          streamerName: 'StreamerPro',
          viewers: 150,
          duration: 3600,
          quality: 'high',
          status: 'healthy'
        },
        {
          id: '2',
          title: 'Music Live',
          streamerName: 'MusicMaster',
          viewers: 89,
          duration: 1800,
          quality: 'medium',
          status: 'warning'
        }
      ];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};
