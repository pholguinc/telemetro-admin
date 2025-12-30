import api from './httpClient';

export const MicrosegurosService = {
  // ========== MÉTODOS PRINCIPALES ==========
  
  // Obtener todos los microseguros con filtros
  getAll: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/microseguros/admin/all?${queryParams}`);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/microseguros/${id}`);
    return response.data;
  },
  
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/microseguros', data);
    return response.data;
  },
  
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put(`/microseguros/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/microseguros/${id}`);
    return response.data;
  },
  
  toggleStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/microseguros/${id}/status`, { isActive });
    return response.data;
  },
  
  // Estadísticas generales
  getStats: async () => {
    const response = await api.get('/microseguros/admin/stats');
    return response.data;
  },

  // Upload de archivos
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/microseguros/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // ========== MÉTODOS DE USUARIO ==========
  
  // Obtener microseguros disponibles (para compatibilidad)
  getMicroseguros: async (params: { category?: string } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/microseguros?${queryParams}`);
    return response.data;
  },

  // Contratar microseguro
  contractInsurance: async (contractData: {
    microseguroId: string;
    paymentMethod: 'card' | 'points';
    tokenId?: string;
    duration?: number;
  }) => {
    const response = await api.post('/microseguros/contract', contractData);
    return response.data;
  },

  // Obtener contratos del usuario
  getUserContracts: async (params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/microseguros/my-contracts?${queryParams}`);
    return response.data;
  },

  // Cancelar contrato
  cancelContract: async (contractId: string, reason?: string) => {
    const response = await api.patch(`/microseguros/contracts/${contractId}/cancel`, {
      reason
    });
    return response.data;
  },

  // Crear reclamo
  createClaim: async (claimData: {
    contractId: string;
    claimType: string;
    description: string;
    claimAmount: number;
    evidenceFiles?: string[];
  }) => {
    const response = await api.post('/microseguros/claims', claimData);
    return response.data;
  },

  // Obtener reclamos del usuario
  getUserClaims: async (params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/microseguros/my-claims?${queryParams}`);
    return response.data;
  },

  // ========== MÉTODOS DE ADMINISTRACIÓN ==========

  // Procesar reclamo (Admin)
  processClaim: async (claimId: string, processData: {
    status: 'approved' | 'rejected';
    adminNotes?: string;
  }) => {
    const response = await api.patch(`/microseguros/claims/${claimId}/process`, processData);
    return response.data;
  },

  // Obtener todos los reclamos (Admin)
  getAllClaims: async (params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/microseguros/claims?${queryParams}`);
    return response.data;
  },
};