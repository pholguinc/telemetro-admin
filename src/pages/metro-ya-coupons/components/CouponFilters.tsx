import React from 'react';
import { Search, Filter } from 'lucide-react';

// Types
type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilter = 'all' | 'transport' | 'discount' | 'special' | 'bonus';
type BenefitTypeFilter = 'all' | 'discount_percentage' | 'discount_fixed' | 'free_trip' | 'points_bonus' | 'custom';

interface CouponFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (category: CategoryFilter) => void;
  benefitTypeFilter: BenefitTypeFilter;
  setBenefitTypeFilter: (benefitType: BenefitTypeFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
}

const CouponFilters: React.FC<CouponFiltersProps> = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  benefitTypeFilter,
  setBenefitTypeFilter,
  statusFilter,
  setStatusFilter,
}) => {
  const categories: Array<{ value: CategoryFilter; label: string }> = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'transport', label: 'Transporte' },
    { value: 'discount', label: 'Descuentos' },
    { value: 'special', label: 'Especiales' },
    { value: 'bonus', label: 'Bonificaciones' },
  ];

  const benefitTypes: Array<{ value: BenefitTypeFilter; label: string }> = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'discount_percentage', label: 'Descuento %' },
    { value: 'discount_fixed', label: 'Descuento fijo' },
    { value: 'free_trip', label: 'Viaje gratis' },
    { value: 'points_bonus', label: 'Bonus puntos' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const statuses: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Código, título, descripción..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de beneficio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Beneficio
          </label>
          <select
            value={benefitTypeFilter}
            onChange={(e) => setBenefitTypeFilter(e.target.value as BenefitTypeFilter)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            {benefitTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            setSearch('');
            setCategoryFilter('all');
            setBenefitTypeFilter('all');
            setStatusFilter('all');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default CouponFilters;
