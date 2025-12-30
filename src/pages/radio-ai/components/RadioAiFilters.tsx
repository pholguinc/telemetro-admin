import React from 'react';
import { Search, Filter, Music as MusicIcon } from 'lucide-react';

// ✅ AGREGAR ESTOS TIPOS AL INICIO (ANTES DE LA INTERFAZ)
type EmotionFilter = 'all' | string;
type StatusFilter = 'all' | 'processing' | 'completed' | 'failed';

interface RadioAiFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  emotionFilter: EmotionFilter;
  setEmotionFilter: (value: EmotionFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  emotions: string[];
  activeTab: string;
}

const RadioAiFilters: React.FC<RadioAiFiltersProps> = ({
  search,
  setSearch,
  emotionFilter,
  setEmotionFilter,
  statusFilter,
  setStatusFilter,
  emotions,
  activeTab,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por título, subtítulo, emoción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filtro de Emoción */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MusicIcon className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value as EmotionFilter)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent capitalize"
          >
            <option value="all">Todas las emociones</option>
            {emotions.map((emotion) => (
              <option key={emotion} value={emotion} className="capitalize">
                {emotion}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Estado (solo visible en tab "Todas") */}
        {activeTab === 'all' && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="processing">En proceso</option>
              <option value="completed">Completadas</option>
              <option value="failed">Fallidas</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadioAiFilters;