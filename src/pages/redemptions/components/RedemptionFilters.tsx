import React from 'react';
import { Search, Filter } from 'lucide-react';

interface RedemptionFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: 'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  setStatusFilter: (value: 'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled') => void;
  stationCode: string;
  setStationCode: (value: string) => void;
}

const RedemptionFilters: React.FC<RedemptionFiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  stationCode,
  setStationCode,
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
              placeholder="Código de canje, usuario..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmados</option>
            <option value="delivered">Entregados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        {/* Filtro por estación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Estación
          </label>
          <input
            type="text"
            value={stationCode}
            onChange={(e) => setStationCode(e.target.value)}
            placeholder="Ej: VES-01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default RedemptionFilters;





