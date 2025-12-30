import React from 'react';
import { Package, CheckCircle, Clock, MapPin } from 'lucide-react';

interface OfferStatsData {
  total: number;
  active: number;
  totalRedemptions?: number;
}

interface OfferStatsProps {
  stats: OfferStatsData | undefined;
}

const OfferStats: React.FC<OfferStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Total de Ofertas',
      value: stats.total || 0,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Ofertas Activas',
      value: stats.active || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Ofertas Inactivas',
      value: (stats.total || 0) - (stats.active || 0),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Total Canjeadas',
      value: stats.totalRedemptions || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">{stat.label}</span>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default OfferStats;




