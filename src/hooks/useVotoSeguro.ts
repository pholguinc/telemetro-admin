import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VotoSeguroService as votoSeguroService } from '../services';
import { VotoParties } from '../models';
import toast from 'react-hot-toast';

// Types for Voto Seguro
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
  updatedAt: string;
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
  updatedAt: string;
}

interface VotoSeguroStats {
  totalCandidates: number;
  activeCandidates: number;
  totalParties: number;
  activeParties: number;
  candidatesByPosition: Record<string, number>;
  partiesByRegion: Record<string, number>;
}

interface CreateCandidateData {
  name: string;
  lastName: string;
  position: 'president' | 'vicepresident' | 'congressman' | 'mayor' | 'regional_governor' | 'councilor';
  partyId: string;
  photoUrl?: string;
  biography?: string;
  proposals?: string[];
  location?: {
    region: string;
    province?: string;
    district?: string;
  };
  isActive?: boolean;
}

interface UpdateCandidateData extends Partial<CreateCandidateData> {}

interface CreatePartyData {
  name: string;
  shortName: string;
  logoUrl?: string;
  color?: string;
  description?: string;
  ideology?: string;
  foundedYear?: number;
  website?: string;
  isActive?: boolean;
}

interface UpdatePartyData extends Partial<CreatePartyData> {}

interface CandidateFilters {
  position?: 'president' | 'vicepresident' | 'congressman' | 'mayor' | 'regional_governor' | 'councilor';
  partyId?: string;
  region?: string;
  province?: string;
  district?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface PartyFilters {
  isActive?: boolean;
  ideology?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ImportResult {
  imported: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// Hook para obtener todos los candidatos
export const useVotoSeguroCandidates = (params: CandidateFilters = {}) => {
  return useQuery<Candidate[]>({
    queryKey: ['voto-seguro', 'candidates', params],
    queryFn: async () => {
      const response = await votoSeguroService.getAllCandidates(params);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un candidato específico
export const useVotoSeguroCandidate = (candidateId: string) => {
  return useQuery<Candidate>({
    queryKey: ['voto-seguro', 'candidates', candidateId],
    queryFn: async () => {
      const response = await votoSeguroService.getCandidate(candidateId);
      return response.data;
    },
    enabled: !!candidateId,
  });
};

// Hook para obtener todos los partidos políticos
export const useVotoSeguroParties = () => {
  return useQuery<PoliticalParty[]>({
    queryKey: ['voto-seguro', 'parties'],
    queryFn: async () => {
      const response = await votoSeguroService.getAllParties();
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener un partido específico
export const useVotoSeguroParty = (partyId: string) => {
  return useQuery<PoliticalParty>({
    queryKey: ['voto-seguro', 'parties', partyId],
    queryFn: async () => {
      const response = await votoSeguroService.getParty(partyId);
      return response.data;
    },
    enabled: !!partyId,
  });
};

// Hook para estadísticas de Voto Seguro
export const useVotoSeguroStats = () => {
  return useQuery<VotoSeguroStats>({
    queryKey: ['voto-seguro', 'stats'],
    queryFn: async () => {
      const response = await votoSeguroService.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para candidatos por posición
export const useCandidatesByPosition = (position: string) => {
  return useQuery<Candidate[]>({
    queryKey: ['voto-seguro', 'candidates', 'position', position],
    queryFn: async () => {
      const response = await votoSeguroService.getCandidatesByPosition(position);
      return response.data || [];
    },
    enabled: !!position,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para búsqueda política
export const useSearchPolitical = (query: string) => {
  return useQuery<{
    candidates: Candidate[];
    parties: PoliticalParty[];
  }>({
    queryKey: ['voto-seguro', 'search', query],
    queryFn: async () => {
      const response = await votoSeguroService.searchPolitical(query);
      return response.data;
    },
    enabled: !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Mutations para gestión de candidatos
export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Candidate, Error, CreateCandidateData>({
    mutationFn: (candidateData: CreateCandidateData) => 
      votoSeguroService.createCandidate(candidateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'stats'] });
      toast.success('Candidato creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear el candidato';
      toast.error(message);
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Candidate, Error, { candidateId: string; candidateData: UpdateCandidateData }>({
    mutationFn: ({ candidateId, candidateData }: { candidateId: string; candidateData: UpdateCandidateData }) => 
      votoSeguroService.updateCandidate(candidateId, candidateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'candidates', variables.candidateId] });
      toast.success('Candidato actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar el candidato';
      toast.error(message);
    },
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (candidateId: string) => votoSeguroService.deleteCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'stats'] });
      toast.success('Candidato eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar el candidato';
      toast.error(message);
    },
  });
};

// Mutations para gestión de partidos políticos
export const useCreateParty = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PoliticalParty, Error, CreatePartyData>({
    mutationFn: (partyData: CreatePartyData) => votoSeguroService.createParty(partyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'parties'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'stats'] });
      toast.success('Partido político creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear el partido político';
      toast.error(message);
    },
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PoliticalParty, Error, { partyId: string; partyData: UpdatePartyData }>({
    mutationFn: ({ partyId, partyData }: { partyId: string; partyData: UpdatePartyData }) => 
      votoSeguroService.updateParty(partyId, partyData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'parties'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'parties', variables.partyId] });
      toast.success('Partido político actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar el partido político';
      toast.error(message);
    },
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (partyId: string) => votoSeguroService.deleteParty(partyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'parties'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'stats'] });
      toast.success('Partido político eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar el partido político';
      toast.error(message);
    },
  });
};

// Mutations para importación masiva
export const useImportCandidatesCsv = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ImportResult, Error, File>({
    mutationFn: (csvFile: File) => votoSeguroService.importCandidatesCsv(csvFile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'stats'] });
      toast.success(`Importación exitosa: ${data.imported || 0} candidatos importados`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al importar candidatos';
      toast.error(message);
    },
  });
};

export const useImportPartiesCsv = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ImportResult, Error, File>({
    mutationFn: (csvFile: File) => votoSeguroService.importPartiesCsv(csvFile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'parties'] });
      queryClient.invalidateQueries({ queryKey: ['voto-seguro', 'stats'] });
      toast.success(`Importación exitosa: ${data.imported || 0} partidos importados`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al importar partidos';
      toast.error(message);
    },
  });
};
