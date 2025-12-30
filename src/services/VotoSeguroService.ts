import api from './httpClient';

export const VotoSeguroService = {
  getAllCandidates: async (params: Record<string, unknown> = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await api.get(`/voto-seguro/candidates?${queryParams}`);
    return response.data;
  },
  getCandidate: async (candidateId: string) => {
    const response = await api.get(`/voto-seguro/candidates/${candidateId}`);
    return response.data;
  },
  createCandidate: async (candidateData: Record<string, unknown>) => {
    const response = await api.post('/voto-seguro/admin/candidates', candidateData);
    return response.data;
  },
  updateCandidate: async (candidateId: string, candidateData: Record<string, unknown>) => {
    const response = await api.put(`/voto-seguro/admin/candidates/${candidateId}`, candidateData);
    return response.data;
  },
  deleteCandidate: async (candidateId: string) => {
    const response = await api.delete(`/voto-seguro/admin/candidates/${candidateId}`);
    return response.data;
  },
  getAllParties: async () => {
    const response = await api.get('/voto-seguro/parties');
    return response.data;
  },
  getParty: async (partyId: string) => {
    const response = await api.get(`/voto-seguro/parties/${partyId}`);
    return response.data;
  },
  createParty: async (partyData: Record<string, unknown>) => {
    const response = await api.post('/voto-seguro/admin/parties', partyData);
    return response.data;
  },
  updateParty: async (partyId: string, partyData: Record<string, unknown>) => {
    const response = await api.put(`/voto-seguro/admin/parties/${partyId}`, partyData);
    return response.data;
  },
  deleteParty: async (partyId: string) => {
    const response = await api.delete(`/voto-seguro/admin/parties/${partyId}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/voto-seguro/stats');
    return response.data;
  },
  searchPolitical: async (query: string) => {
    const response = await api.get(`/voto-seguro/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  getCandidatesByPosition: async (position: string) => {
    const response = await api.get(`/voto-seguro/candidates/position/${position}`);
    return response.data;
  },
  importCandidatesCsv: async (csvFile: File) => {
    const formData = new FormData();
    formData.append('csv', csvFile);
    const response = await api.post('/voto-seguro/admin/candidates/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  importPartiesCsv: async (csvFile: File) => {
    const formData = new FormData();
    formData.append('csv', csvFile);
    const response = await api.post('/voto-seguro/admin/parties/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};


