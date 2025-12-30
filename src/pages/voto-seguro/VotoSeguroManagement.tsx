import React, { useState } from 'react';
import { Vote, Users, UserCheck, Search, Plus, Edit, Trash2, RefreshCw, Upload } from 'lucide-react';
import { 
  useVotoSeguroCandidates, 
  useVotoSeguroParties, 
  useVotoSeguroStats,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
  useCreateParty,
  useUpdateParty,
  useDeleteParty,
  useImportCandidatesCsv,
  useImportPartiesCsv
} from '../../hooks/useVotoSeguro';

// Types
interface Candidate {
  id: string;
  name: string;
  lastName: string;
  fullName: string;
  position: 'president' | 'vicepresident' | 'congressman' | 'mayor' | 'regional_governor' | 'councilor';
  partyId: string;
  party: PoliticalParty;
  photoUrl?: string;
  biography?: string;
  proposals?: string[];
  location?: {
    region: string;
    province?: string;
    district?: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface PoliticalParty {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  color?: string;
  description?: string;
  ideology?: string;
  foundedYear?: number;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

type Tab = 'candidates' | 'parties' | 'stats';
type PositionFilter = 'all' | 'president' | 'vicepresident' | 'congressman' | 'mayor' | 'regional_governor' | 'councilor';

const VotoSeguroManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('candidates');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');

  const { data: candidatesData = [], isLoading: candidatesLoading, refetch: refetchCandidates } = useVotoSeguroCandidates({
    search: searchTerm,
    position: positionFilter !== 'all' ? positionFilter : undefined
  });

  const { data: partiesData = [], isLoading: partiesLoading, refetch: refetchParties } = useVotoSeguroParties();
  const { data: stats } = useVotoSeguroStats();

  // Debug logs
  console.log('🔍 VotoSeguroManagement - RAW candidatesData:', candidatesData);
  console.log('🔍 VotoSeguroManagement - Type of candidatesData:', typeof candidatesData);
  console.log('🔍 VotoSeguroManagement - Is Array:', Array.isArray(candidatesData));

  // Safely extract arrays
  const candidates: Candidate[] = Array.isArray(candidatesData) 
    ? candidatesData 
    : Array.isArray((candidatesData as any)?.data) 
    ? (candidatesData as any).data 
    : [];

  const parties: PoliticalParty[] = Array.isArray(partiesData) 
    ? partiesData 
    : Array.isArray((partiesData as any)?.data) 
    ? (partiesData as any).data 
    : [];

  console.log('🔍 VotoSeguroManagement - Processed candidates:', candidates);
  console.log('🔍 VotoSeguroManagement - Candidates length:', candidates.length);
  console.log('🔍 VotoSeguroManagement - Processed parties:', parties);

  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const deleteCandidate = useDeleteCandidate();
  const createParty = useCreateParty();
  const updateParty = useUpdateParty();
  const deleteParty = useDeleteParty();
  const importCandidates = useImportCandidatesCsv();
  const importParties = useImportPartiesCsv();

  const handleTabChange = (tab: Tab): void => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setPositionFilter(e.target.value as PositionFilter);
  };

  const handleRefresh = (): void => {
    if (activeTab === 'candidates') {
      refetchCandidates();
    } else if (activeTab === 'parties') {
      refetchParties();
    }
  };

  const handleDeleteCandidate = async (candidate: Candidate): Promise<void> => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${candidate.fullName}?`)) {
      try {
        await deleteCandidate.mutateAsync(candidate.id);
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  const handleDeleteParty = async (party: PoliticalParty): Promise<void> => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el partido ${party.name}?`)) {
      try {
        await deleteParty.mutateAsync(party.id);
      } catch (error) {
        console.error('Error deleting party:', error);
      }
    }
  };

  const getPositionLabel = (position: string): string => {
    const labels: Record<string, string> = {
      president: 'Presidente',
      vicepresident: 'Vicepresidente',
      congressman: 'Congresista',
      mayor: 'Alcalde',
      regional_governor: 'Gobernador Regional',
      councilor: 'Consejero'
    };
    return labels[position] || position;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🗳️ Voto Seguro</h1>
          <p className="text-gray-600 mt-2">
            Gestiona candidatos y partidos políticos
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center space-x-2 mt-4 sm:mt-0"
          disabled={candidatesLoading || partiesLoading}
          type="button"
        >
          <RefreshCw className={`h-5 w-5 ${(candidatesLoading || partiesLoading) ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidatos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCandidates}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partidos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalParties}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Vote className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidatos Activos</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activeCandidates}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partidos Activos</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.activeParties}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Vote className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('candidates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'candidates'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            👤 Candidatos
          </button>
          
          <button
            onClick={() => handleTabChange('parties')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'parties'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            🏛️ Partidos
          </button>
          
          <button
            onClick={() => handleTabChange('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            📊 Estadísticas
          </button>
        </nav>
      </div>

      {/* Contenido según tab */}
      {activeTab === 'candidates' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Candidatos ({candidates.length})
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {/* TODO: Importar CSV */}}
                className="btn-secondary flex items-center space-x-2"
                type="button"
              >
                <Upload className="h-5 w-5" />
                <span>Importar CSV</span>
              </button>
              <button
                onClick={() => {/* TODO: Crear candidato */}}
                className="btn-primary flex items-center space-x-2"
                type="button"
              >
                <Plus className="h-5 w-5" />
                <span>Crear Candidato</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <input
              type="text"
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input-field flex-1"
            />
            
            <select
              value={positionFilter}
              onChange={handlePositionChange}
              className="input-field w-auto"
            >
              <option value="all">Todos los cargos</option>
              <option value="president">Presidente</option>
              <option value="vicepresident">Vicepresidente</option>
              <option value="congressman">Congresista</option>
              <option value="mayor">Alcalde</option>
              <option value="regional_governor">Gobernador Regional</option>
              <option value="councilor">Consejero</option>
            </select>
          </div>

          {candidatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando candidatos...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay candidatos
              </h3>
              <p className="text-gray-500">
                Agrega candidatos para las elecciones
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(candidates) ? candidates.map((candidate: Candidate) => (
                <div key={candidate.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
                  {/* Foto */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {candidate.photoUrl ? (
                      <img
                        src={candidate.photoUrl}
                        alt={candidate.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                        <UserCheck className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        candidate.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {candidate.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{candidate.fullName}</h3>
                    <p className="text-sm text-blue-600 mb-2">{getPositionLabel(candidate.position)}</p>
                    
                    {candidate.party && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: candidate.party.color || '#6B7280' }}
                        ></div>
                        <span className="text-sm text-gray-600">{candidate.party.name}</span>
                      </div>
                    )}
                    
                    {candidate.location && (
                      <p className="text-sm text-gray-500 mb-3">
                        {candidate.location.region}
                        {candidate.location.province && `, ${candidate.location.province}`}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* TODO: Editar candidato */}}
                        className="flex-1 btn-secondary flex items-center justify-center space-x-1"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCandidate(candidate)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                  </div>
                </div>
              </div>
            )) : []}
          </div>
        )}
      </div>
      )}

      {activeTab === 'parties' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Partidos Políticos ({parties.length})
            </h2>
            <button
              onClick={() => {/* TODO: Crear partido */}}
              className="btn-primary flex items-center space-x-2"
              type="button"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Partido</span>
            </button>
          </div>

          {partiesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando partidos...</p>
            </div>
          ) : parties.length === 0 ? (
            <div className="text-center py-8">
              <Vote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay partidos políticos
              </h3>
              <p className="text-gray-500">
                Agrega partidos políticos para las elecciones
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(parties) ? parties.map((party: PoliticalParty) => (
                <div key={party.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {party.logoUrl ? (
                        <img
                          src={party.logoUrl}
                          alt={party.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: party.color || '#6B7280' }}
                        >
                          <span className="text-white font-bold text-lg">
                            {party.shortName?.charAt(0) || party.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{party.name}</h3>
                        <p className="text-sm text-gray-600">{party.shortName}</p>
                        {party.ideology && (
                          <p className="text-sm text-gray-500">{party.ideology}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        party.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {party.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      
                      <button
                        onClick={() => {/* TODO: Editar partido */}}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteParty(party)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : []}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Estadísticas Electorales
          </h2>
          <div className="text-center py-8">
            <Vote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Análisis Electoral
            </h3>
            <p className="text-gray-500">
              Estadísticas detalladas en desarrollo...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotoSeguroManagement;
