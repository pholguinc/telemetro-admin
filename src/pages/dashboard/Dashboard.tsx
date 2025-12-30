import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Image, 
  TrendingUp, 
  Activity,
  Eye,
  MousePointer,
  Calendar,
  Award,
  RefreshCw,
  Plus,
  BookOpen,
  LucideIcon
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useStats';

// Types
interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
}

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

const Dashboard: React.FC = () => {
  const { data: statsData, isLoading, error, refetch } = useDashboardStats();

  // Formatear números
  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Configurar stats con datos reales del backend
  const stats: StatCard[] = statsData ? [
    {
      title: 'Usuarios Totales',
      value: formatNumber(statsData.users?.total || 0),
      change: `${statsData.users?.active || 0} activos`,
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Banners Activos',
      value: statsData.banners?.active || 0,
      change: `${statsData.banners?.total || 0} total`,
      changeType: 'neutral',
      icon: Image,
      color: 'bg-orange-500'
    },
    {
      title: 'Juegos Activos',
      value: statsData.games?.active || 0,
      change: `${statsData.games?.total || 0} total`,
      changeType: 'positive',
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      title: 'Ofertas Laborales',
      value: statsData.jobs?.active || 0,
      change: `${statsData.jobs?.total || 0} total`,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ] : [];

  const recentActivity: Activity[] = statsData?.recentActivity || [
    {
      id: 1,
      action: 'Nuevo usuario registrado',
      user: 'jaxximize',
      time: 'Hace 5 minutos',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 2,
      action: 'Banner actualizado',
      user: 'admin',
      time: 'Hace 15 minutos',
      icon: Image,
      color: 'text-orange-600'
    },
    {
      id: 3,
      action: 'Nueva suscripción',
      user: 'maria_lopez',
      time: 'Hace 1 hora',
      icon: Award,
      color: 'text-green-600'
    },
    {
      id: 4,
      action: 'Juego completado',
      user: 'carlos_gamer',
      time: 'Hace 2 horas',
      icon: Activity,
      color: 'text-purple-600'
    }
  ];

  const handleRefresh = (): void => {
    refetch();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar estadísticas</h3>
          <p className="text-gray-500 mb-4">No se pudieron cargar los datos del dashboard</p>
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Intentar de nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido al panel de administración de Telemetro
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="btn-secondary flex items-center space-x-2"
          type="button"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: StatCard, index: number) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600' 
                        : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs último mes</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
            <button 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              type="button"
            >
              Ver todo
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity: Activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">Usuario: {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
          
          <div className="space-y-3">
            <Link 
              to="/banners"
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border-2 border-dashed border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
            >
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Image className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gestionar Banners</p>
                <p className="text-sm text-gray-500">Crear y editar banners</p>
              </div>
            </Link>
            
            <Link 
              to="/users"
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ver Usuarios</p>
                <p className="text-sm text-gray-500">Gestionar usuarios</p>
              </div>
            </Link>
            
            <Link 
              to="/education"
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border-2 border-dashed border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
            >
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gestión de Educación</p>
                <p className="text-sm text-gray-500">Cursos y microcursos</p>
              </div>
            </Link>
            
            <button 
              onClick={handleRefresh}
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              type="button"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <RefreshCw className={`h-5 w-5 text-green-600 ${isLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Actualizar Datos</p>
                <p className="text-sm text-gray-500">Refrescar estadísticas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
