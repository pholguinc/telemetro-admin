import React, { useState } from 'react';
import { Heart, TrendingUp, Users, DollarSign, RefreshCw, Calendar } from 'lucide-react';
import { useDonationsOverview, useDonationsList } from '../../hooks/useDonations';

// Types
type Period = '7d' | '30d' | '90d' | '1y';

const DonationsOverview: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');

  const { data: overview, isLoading: overviewLoading, refetch } = useDonationsOverview(selectedPeriod);
  const { data: donationsData = [], isLoading: donationsLoading } = useDonationsList({ limit: 10 });


  // Safely extract donations array
  const donations = Array.isArray(donationsData) 
    ? donationsData 
    : Array.isArray((donationsData as any)?.data) 
    ? (donationsData as any).data 
    : [];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedPeriod(e.target.value as Period);
  };

  const handleRefresh = (): void => {
    refetch();
  };

  const formatAmount = (amount: number | undefined): string => {
    if (!amount || isNaN(amount)) return 'S/ 0.00';
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPeriodLabel = (period: Period): string => {
    const labels: Record<Period, string> = {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días', 
      '90d': 'Últimos 90 días',
      '1y': 'Último año'
    };
    return labels[period];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">❤️ Donaciones</h1>
          <p className="text-gray-600 mt-2">
            Resumen de donaciones y campañas benéficas
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="input-field w-auto"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={overviewLoading}
            type="button"
          >
            <RefreshCw className={`h-5 w-5 ${overviewLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donaciones</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalDonations || 0}</p>
                <p className="text-sm text-gray-500">{getPeriodLabel(selectedPeriod)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatAmount(overview.totalAmount)}
                </p>
                <p className="text-sm text-gray-500">{getPeriodLabel(selectedPeriod)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {formatAmount(overview.averageDonation)}
                </p>
                <p className="text-sm text-gray-500">por donación</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crecimiento</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  +{overview.growthRate?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-gray-500">vs período anterior</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donaciones recientes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Donaciones Recientes
        </h2>

        {donationsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando donaciones...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay donaciones
            </h3>
            <p className="text-gray-500">
              Las donaciones aparecerán aquí cuando se realicen
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(donations) ? donations.map((donation: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Donación #{index + 1}</h3>
                    <p className="text-sm text-gray-600">Funcionalidad en desarrollo...</p>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    S/ 0.00
                  </span>
                </div>
              </div>
            )) : []}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsOverview;
