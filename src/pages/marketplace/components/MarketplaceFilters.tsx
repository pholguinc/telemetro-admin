import React from 'react';

type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilter = 'all' | 'digital' | 'physical' | 'premium' | 'food' | 'entertainment' | 'services' | 'other';

interface MarketplaceFiltersProps {
  search: string;
  status: StatusFilter;
  category: CategoryFilter;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Físico' },
  { value: 'premium', label: 'Premium' },
  { value: 'food', label: 'Comida' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'services', label: 'Servicios' },
  { value: 'other', label: 'Otro' },
];

const STATUSES = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  search,
  status,
  category,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}) => (
  <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <input
        type="text"
        placeholder="Buscar productos..."
        value={search}
        onChange={onSearchChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        aria-label="Buscar productos por nombre o descripción"
      />
      <select
        value={status}
        onChange={onStatusChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por estado"
      >
        {STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={onCategoryChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por categoría"
      >
        {CATEGORIES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default MarketplaceFilters;




