import React from 'react';
import { Gift, CheckCircle, Clock, Package } from 'lucide-react';
import type { RedemptionStats } from '../../../models/redemptions';

interface RedemptionStatsProps {
  stats: RedemptionStats | undefined;
  isLoading: boolean;
}

const RedemptionStats: React.FC<RedemptionStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsCards = [
    {
      label: 'Total Canjes',
      value: stats.total,
      icon: Gift,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Confirmados',
      value: stats.confirmed,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Entregados',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`${stat.color} w-5 h-5`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
};

export default RedemptionStats;





