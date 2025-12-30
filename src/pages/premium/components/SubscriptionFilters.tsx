import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SubscriptionFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: 'all' | 'active' | 'pending_payment' | 'cancelled' | 'expired';
  setStatusFilter: (value: 'all' | 'active' | 'pending_payment' | 'cancelled' | 'expired') => void;
  planFilter: 'all' | 'monthly' | 'quarterly' | 'yearly';
  setPlanFilter: (value: 'all' | 'monthly' | 'quarterly' | 'yearly') => void;
}

const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  planFilter,
  setPlanFilter,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Usuario, teléfono..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro de estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="active">Activas</option>
            <option value="pending_payment">Pago Pendiente</option>
            <option value="cancelled">Canceladas</option>
            <option value="expired">Expiradas</option>
          </select>
        </div>

        {/* Filtro de plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan
          </label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFilters;


