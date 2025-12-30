import React from 'react';
import { Package, Gift, Clock, Star } from 'lucide-react';

interface MarketplaceStats {
  totalProducts: number;
  activeProducts: number;
  totalRedemptions: number;
  pendingRedemptions: number;
  totalRevenue: number;
}

interface MarketplaceStatsProps {
  stats: MarketplaceStats | undefined;
}

const MarketplaceStatsComponent: React.FC<MarketplaceStatsProps> = ({ stats }) => {
  if (!stats) return null;

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Productos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Productos Activos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeProducts}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Package className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Canjes</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalRedemptions}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Gift className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Canjes Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingRedemptions}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceStatsComponent;

