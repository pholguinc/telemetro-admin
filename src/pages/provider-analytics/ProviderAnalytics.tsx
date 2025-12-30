import React from 'react';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useMarketplaceStats } from '../../hooks/useMarketplace';

const ProviderAnalytics: React.FC = () => {
  const { data: stats } = useMarketplaceStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics de Proveedores</h1>
          <p className="text-gray-600 mt-2">Análisis de rendimiento de proveedores</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canjes</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalRedemptions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="text-center py-12">
          <BarChart3 className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Analytics de Proveedores
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Métricas detalladas de rendimiento de proveedores en desarrollo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderAnalytics;
