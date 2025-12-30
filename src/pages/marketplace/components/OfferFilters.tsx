import React from 'react';
import { Search, Filter } from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilter = 'all' | 'food_drink' | 'entertainment' | 'transport' | 'services' | 'shopping' | 'health' | 'education' | 'other';

interface OfferFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (value: CategoryFilter) => void;
}

const OfferFilters: React.FC<OfferFiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}) => {
  const categoryLabels: Record<CategoryFilter, string> = {
    all: 'Todas las categorías',
    food_drink: 'Comida y Bebidas',
    entertainment: 'Entretenimiento',
    transport: 'Transporte',
    services: 'Servicios',
    shopping: 'Compras',
    health: 'Salud',
    education: 'Educación',
    other: 'Otros',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ofertas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro de Estado */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>

        {/* Filtro de Categoría */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OfferFilters;




