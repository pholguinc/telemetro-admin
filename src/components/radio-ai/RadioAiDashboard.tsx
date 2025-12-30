// components/radio-ai/RadioAiDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Brain, 
  Users, 
  TrendingUp, 
  Database, 
  Clock,
  Heart,
  Zap,
  Activity,
  Settings,
  LucideIcon
} from 'lucide-react';
import radioAiService from '../../services/radio-ai/radioAiService';

// Types
interface Stats {
  total_sessions: number;
  total_tracks_cached: number;
  average_rating: number;
  mood_distribution: MoodDistribution[];
}

interface MoodDistribution {
  mood: string;
  count: number;
}

interface CacheMetrics {
  cache_hit_rate: number;
  total_tracks: number;
  storage_used: string;
  avg_generation_time: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
}

interface MoodDistributionChartProps {
  data: MoodDistribution[];
}

const RadioAiDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [statsData, cacheData] = await Promise.all([
        radioAiService.getStats(),
        radioAiService.getCacheMetrics()
      ]);
      
      setStats(statsData.data);
      setCacheMetrics(cacheData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error cargando RADIO.ai
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadDashboardData}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const MoodDistributionChart: React.FC<MoodDistributionChartProps> = ({ data }) => {
    const maxCount = Math.max(...data.map(item => item.count));
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Distribución de Estados de Ánimo
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                {item.mood}
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm text-gray-500 text-right">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">RADIO.ai Dashboard</h1>
            <p className="text-purple-100 mt-2">
              Inteligencia Artificial Musical - Monitoreo y Gestión
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8" />
            <Brain className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Sesiones Totales"
          value={stats?.total_sessions?.toLocaleString() || '0'}
          icon={Users}
          color="bg-blue-500"
          subtitle="Usuarios únicos"
        />
        <StatCard
          title="Música en Cache"
          value={stats?.total_tracks_cached?.toLocaleString() || '0'}
          icon={Database}
          color="bg-green-500"
          subtitle={`${cacheMetrics?.cache_hit_rate || 0}% hit rate`}
        />
        <StatCard
          title="Rating Promedio"
          value={stats?.average_rating?.toFixed(1) || '0.0'}
          icon={Heart}
          color="bg-pink-500"
          subtitle="De 5.0 estrellas"
        />
        <StatCard
          title="Tiempo Respuesta"
          value={cacheMetrics?.avg_generation_time || 'N/A'}
          icon={Zap}
          color="bg-yellow-500"
          subtitle="Generación promedio"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        {stats?.mood_distribution && stats.mood_distribution.length > 0 && (
          <MoodDistributionChart data={stats.mood_distribution} />
        )}

        {/* Cache Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Métricas de Cache
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Tracks Almacenados
              </span>
              <span className="text-sm text-gray-900">
                {cacheMetrics?.total_tracks || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Hit Rate
              </span>
              <span className="text-sm text-gray-900">
                {cacheMetrics?.cache_hit_rate || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Almacenamiento Usado
              </span>
              <span className="text-sm text-gray-900">
                {cacheMetrics?.storage_used || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Tiempo Generación
              </span>
              <span className="text-sm text-gray-900">
                {cacheMetrics?.avg_generation_time || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Estado del Sistema
          </h3>
          <button
            onClick={loadDashboardData}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
          >
            Actualizar
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                RADIO.ai Activo
              </p>
              <p className="text-xs text-green-600">
                Sistema funcionando correctamente
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Cache Optimizado
              </p>
              <p className="text-xs text-blue-600">
                {cacheMetrics?.cache_hit_rate || 0}% de eficiencia
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800">
                IA Conectada
              </p>
              <p className="text-xs text-purple-600">
                Suno AI + OpenAI operativos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Settings className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                Configurar APIs
              </p>
              <p className="text-xs text-gray-500">
                Suno AI y OpenAI
              </p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Database className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                Limpiar Cache
              </p>
              <p className="text-xs text-gray-500">
                Optimizar almacenamiento
              </p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                Ver Analytics
              </p>
              <p className="text-xs text-gray-500">
                Reportes detallados
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RadioAiDashboard;