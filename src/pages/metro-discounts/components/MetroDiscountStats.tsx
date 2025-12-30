import React from 'react';
import { Ticket, CheckCircle, Clock, XCircle, Coins, DollarSign } from 'lucide-react';
import type { MetroDiscountStats } from '../../../models/metro-discount';

interface MetroDiscountStatsProps {
  stats: MetroDiscountStats | undefined;
  isLoading: boolean;
}

const MetroDiscountStats: React.FC<MetroDiscountStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
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
      label: 'Total Descuentos',
      value: stats.totalDiscounts,
      icon: Ticket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Activos',
      value: stats.activeDiscounts,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Usados',
      value: stats.usedDiscounts,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Expirados',
      value: stats.expiredDiscounts,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Puntos Canjeados',
      value: stats.totalPointsRedeemed.toLocaleString(),
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Ahorro Total',
      value: `S/ ${stats.totalSavings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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

export default MetroDiscountStats;





