import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MicrosegurosService } from "../services/MicrosegurosService";
import toast from "react-hot-toast";

// Types for microseguros
interface Microseguro {
  _id: string;
  name: string;
  description: string;
  category: string;
  monthlyPrice: number;
  maxCoverage: number;
  benefits: string[];
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MicroseguroContract {
  _id: string;
  userId: string;
  microseguroId: string | Microseguro;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  paymentMethod: "card" | "points";
  transactionId?: string;
  claimsCount?: number;
  lastClaimDate?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface MicroseguroClaim {
  _id: string;
  contractId: string;
  userId: string;
  microseguroId: string;
  claimType: string;
  description: string;
  claimAmount: number;
  evidenceFiles: string[];
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface MicrosegurosStats {
  totalMicroseguros: number;
  activeMicroseguros: number;
  totalContracts: number;
  activeContracts: number;
  totalClaims: number;
  pendingClaims: number;
  monthlyRevenue: number;
}

export interface CreateMicroseguroData extends Record<string, unknown> {
  name: string;
  description: string;
  category: string;
  monthlyPrice: number;
  maxCoverage: number;
  benefits: string[];
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateMicroseguroData extends Partial<CreateMicroseguroData> {}

interface MicrosegurosFilters extends Record<string, unknown> {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ========== HOOKS PRINCIPALES ==========

// Hook para obtener microseguros con filtros
export const useMicroseguros = (params: MicrosegurosFilters = {}) => {
  return useQuery({
    queryKey: ["microseguros", params],
    queryFn: async () => {
      const response = await MicrosegurosService.getAll(params);
      // ⭐ Retorna solo los datos internos (data.microseguros y data.pagination)
      return response.data || { microseguros: [], pagination: {} };
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Hook para estadísticas de microseguros
export const useMicrosegurosStats = () => {
  return useQuery<MicrosegurosStats>({
    queryKey: ["microseguros-stats"],
    queryFn: async () => {
      const response = await MicrosegurosService.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook para crear microseguro
export const useCreateMicroseguro = () => {
  const queryClient = useQueryClient();

  return useMutation<Microseguro, Error, CreateMicroseguroData>({
    mutationFn: (data: CreateMicroseguroData) =>
      MicrosegurosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microseguros"] });
      queryClient.invalidateQueries({ queryKey: ["microseguros-stats"] });
      toast.success("Microseguro creado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al crear microseguro";
      toast.error(message);
    },
  });
};

// Hook para actualizar microseguro
export const useUpdateMicroseguro = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Microseguro,
    Error,
    { id: string; data: UpdateMicroseguroData }
  >({
    mutationFn: ({ id, data }: { id: string; data: UpdateMicroseguroData }) =>
      MicrosegurosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microseguros"] });
      toast.success("Microseguro actualizado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message ||
        "Error al actualizar microseguro";
      toast.error(message);
    },
  });
};

// Hook para eliminar microseguro
export const useDeleteMicroseguro = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => MicrosegurosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microseguros"] });
      queryClient.invalidateQueries({ queryKey: ["microseguros-stats"] });
      toast.success("Microseguro eliminado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al eliminar microseguro";
      toast.error(message);
    },
  });
};

// Hook para toggle de estado
export const useToggleMicroseguroStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Microseguro, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      MicrosegurosService.toggleStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microseguros"] });
      toast.success("Estado del microseguro actualizado");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al cambiar estado";
      toast.error(message);
    },
  });
};

// Hook para obtener un microseguro específico
export const useMicroseguro = (id: string) => {
  return useQuery<Microseguro>({
    queryKey: ["microseguro", id],
    queryFn: async () => {
      const response = await MicrosegurosService.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ========== HOOKS DE USUARIO ==========

// Hook para obtener contratos del usuario
export const useUserContracts = (
  params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery<{
    contracts: MicroseguroContract[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["user-contracts", params],
    queryFn: async () => {
      const response = await MicrosegurosService.getUserContracts(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Hook para contratar microseguro
export const useContractInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    {
      microseguroId: string;
      paymentMethod: "card" | "points";
      tokenId?: string;
      duration?: number;
    }
  >({
    mutationFn: (contractData) =>
      MicrosegurosService.contractInsurance(contractData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["microseguros-stats"] });
      toast.success("Microseguro contratado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message ||
        "Error al contratar microseguro";
      toast.error(message);
    },
  });
};

// Hook para cancelar contrato
export const useCancelContract = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { contractId: string; reason?: string }>({
    mutationFn: ({ contractId, reason }) =>
      MicrosegurosService.cancelContract(contractId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-contracts"] });
      toast.success("Contrato cancelado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al cancelar contrato";
      toast.error(message);
    },
  });
};

// Hook para obtener reclamos del usuario
export const useUserClaims = (
  params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery<{
    claims: MicroseguroClaim[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["user-claims", params],
    queryFn: async () => {
      const response = await MicrosegurosService.getUserClaims(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Hook para crear reclamo
export const useCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    {
      contractId: string;
      claimType: string;
      description: string;
      claimAmount: number;
      evidenceFiles?: string[];
    }
  >({
    mutationFn: (claimData) => MicrosegurosService.createClaim(claimData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-claims"] });
      queryClient.invalidateQueries({ queryKey: ["user-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["microseguros-stats"] });
      toast.success("Reclamo creado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al crear reclamo";
      toast.error(message);
    },
  });
};

// ========== HOOKS DE ADMINISTRACIÓN ==========

// Hook para obtener todos los reclamos (Admin)
export const useClaims = (
  params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery<{
    claims: MicroseguroClaim[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["microseguros-claims", params],
    queryFn: async () => {
      const response = await MicrosegurosService.getAllClaims(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Hook para procesar reclamo (Admin)
export const useProcessClaim = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    {
      claimId: string;
      status: "approved" | "rejected";
      adminNotes?: string;
    }
  >({
    mutationFn: ({ claimId, status, adminNotes }) =>
      MicrosegurosService.processClaim(claimId, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microseguros-claims"] });
      queryClient.invalidateQueries({ queryKey: ["user-claims"] });
      queryClient.invalidateQueries({ queryKey: ["microseguros-stats"] });
      toast.success("Reclamo procesado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al procesar reclamo";
      toast.error(message);
    },
  });
};
