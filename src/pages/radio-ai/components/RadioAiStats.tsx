import React from 'react';
import { Music, Users, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { AdminStats } from '@/hooks/useRadioAI';


interface RadioAiStatsProps {
  stats: AdminStats | undefined;
}

const RadioAiStats: React.FC<RadioAiStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statusDist = stats.statusDistribution || [];
  const pending = statusDist.find((s) => s._id === 'processing')?.count || 0;
  const completed = statusDist.find((s) => s._id === 'completed')?.count || 0;
  const failed = statusDist.find((s) => s._id === 'failed')?.count || 0;

  const statCards = [
    {
      title: 'Total Música',
      value: stats.totalMusic?.toLocaleString() || '0',
      icon: Music,
      color: 'bg-purple-500',
      subtitle: `${stats.recentMusic || 0} esta semana`,
    },
    {
      title: 'Usuarios Activos',
      value: stats.totalUsers?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-blue-500',
      subtitle: 'Generando música',
    },
    {
      title: 'Pendientes',
      value: pending.toLocaleString(),
      icon: Clock,
      color: 'bg-yellow-500',
      subtitle: 'En proceso',
    },
    {
      title: 'Completadas',
      value: completed.toLocaleString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      subtitle: 'Listas para reproducir',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RadioAiStats;