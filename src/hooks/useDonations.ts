import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Types for donations
interface Donation {
  id: string;
  donorId: string;
  recipientId?: string;
  donor: {
    id: string;
    name: string;
    email: string;
    isAnonymous: boolean;
  };
  recipient?: {
    id: string;
    name: string;
    type: 'streamer' | 'charity' | 'cause';
  };
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'paypal' | 'points' | 'crypto';
  transactionId?: string;
  isPublic: boolean;
  createdAt: string;
  processedAt?: string;
}

interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  currency: string;
  category: 'charity' | 'emergency' | 'education' | 'environment' | 'health' | 'community';
  imageUrl?: string;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    type: 'individual' | 'organization';
  };
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  endDate?: string;
  donationCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  activeCampaigns: number;
  completedCampaigns: number;
  topDonors: Array<{
    donorId: string;
    donorName: string;
    totalDonated: number;
    donationCount: number;
  }>;
  topCampaigns: Array<{
    campaignId: string;
    title: string;
    raised: number;
    goal: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

interface CreateCampaignData extends Record<string, unknown> {
  title: string;
  description: string;
  goal: number;
  currency: string;
  category: 'charity' | 'emergency' | 'education' | 'environment' | 'health' | 'community';
  imageUrl?: string;
  organizerId: string;
  endDate?: string;
}

interface UpdateCampaignData extends Partial<CreateCampaignData> {}

interface DonationFilters extends Record<string, unknown> {
  donorId?: string;
  recipientId?: string;
  campaignId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'card' | 'paypal' | 'points' | 'crypto';
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

interface CampaignFilters extends Record<string, unknown> {
  category?: 'charity' | 'emergency' | 'education' | 'environment' | 'health' | 'community';
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  organizerId?: string;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// API Base
const API_BASE = '/api/admin/donations';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// Hook para resumen de donaciones
export const useDonationsOverview = (period: string = '30d') => {
  return useQuery<{
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    growthRate: number;
  }>({
    queryKey: ['donations', 'overview', period],
    queryFn: () => apiCall(`/overview?period=${period}`),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener donaciones
export const useDonations = (params: DonationFilters = {}) => {
  return useQuery<Donation[]>({
    queryKey: ['donations', params],
    queryFn: () => {
      const queryParams = new URLSearchParams(params as Record<string, string>);
      return apiCall(`?${queryParams}`);
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener campañas
export const useDonationCampaigns = (params: CampaignFilters = {}) => {
  return useQuery<DonationCampaign[]>({
    queryKey: ['donation-campaigns', params],
    queryFn: () => {
      const queryParams = new URLSearchParams(params as Record<string, string>);
      return apiCall(`/campaigns?${queryParams}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para estadísticas de donaciones
export const useDonationStats = () => {
  return useQuery<DonationStats>({
    queryKey: ['donation-stats'],
    queryFn: () => apiCall('/stats'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para reportes financieros
export const useFinancialReports = (period: string = 'month') => {
  return useQuery<{
    summary: {
      totalRevenue: number;
      totalDonations: number;
      platformFees: number;
      netAmount: number;
    };
    breakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    trends: Array<{
      period: string;
      amount: number;
      count: number;
    }>;
  }>({
    queryKey: ['financial-reports', period],
    queryFn: () => apiCall(`/reports?period=${period}`),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Mutations para gestión de campañas
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DonationCampaign, Error, CreateCampaignData>({
    mutationFn: (campaignData: CreateCampaignData) => 
      apiCall('/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['donation-stats'] });
      toast.success('Campaña creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear campaña');
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DonationCampaign, Error, { campaignId: string; campaignData: UpdateCampaignData }>({
    mutationFn: ({ campaignId, campaignData }: { campaignId: string; campaignData: UpdateCampaignData }) => 
      apiCall(`/campaigns/${campaignId}`, {
        method: 'PUT',
        body: JSON.stringify(campaignData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-campaigns'] });
      toast.success('Campaña actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar campaña');
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (campaignId: string) => 
      apiCall(`/campaigns/${campaignId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['donation-stats'] });
      toast.success('Campaña eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar campaña');
    },
  });
};

// Hook para verificar campaña
export const useVerifyCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DonationCampaign, Error, string>({
    mutationFn: (campaignId: string) => 
      apiCall(`/campaigns/${campaignId}/verify`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-campaigns'] });
      toast.success('Campaña verificada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al verificar campaña');
    },
  });
};

// Hook para procesar reembolso
export const useProcessRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Donation, Error, { donationId: string; reason: string }>({
    mutationFn: ({ donationId, reason }: { donationId: string; reason: string }) => 
      apiCall(`/${donationId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation-stats'] });
      toast.success('Reembolso procesado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar reembolso');
    },
  });
};

// Alias para compatibilidad
export const useDonationsList = (params: DonationFilters = {}) => {
  return useDonations(params);
};

// Hook para exportar reporte
export const useExportDonationsReport = () => {
  return useMutation<Blob, Error, { startDate: string; endDate: string; format: 'csv' | 'pdf' }>({
    mutationFn: async ({ startDate, endDate, format }: { startDate: string; endDate: string; format: 'csv' | 'pdf' }) => {
      const response = await fetch(`${API_BASE}/export?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al exportar reporte');
      }
      
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donations_report_${variables.startDate}_${variables.endDate}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Reporte exportado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al exportar reporte');
    },
  });
};

// Hooks para streaming analytics (que se usan en algunos componentes)
export const useStreamersAnalytics = () => {
  return useQuery<{
    totalStreamers: number;
    activeStreamers: number;
    totalDonations: number;
    averageDonation: number;
    topStreamers: Array<{
      id: string;
      name: string;
      donations: number;
      amount: number;
    }>;
  }>({
    queryKey: ['streamers-analytics'],
    queryFn: async () => {
      // Mock data since this might not exist
      return {
        totalStreamers: 50,
        activeStreamers: 23,
        totalDonations: 1250,
        averageDonation: 15.50,
        topStreamers: []
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para configuración de comisiones
export const useCommissionConfig = () => {
  return useQuery<{
    platformFee: number;
    streamerShare: number;
    minimumPayout: number;
  }>({
    queryKey: ['commission-config'],
    queryFn: async () => {
      // Mock data
      return {
        platformFee: 10,
        streamerShare: 90,
        minimumPayout: 50
      };
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para actualizar configuración de comisiones
export const useUpdateCommissionConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { platformFee: number; streamerShare: number; minimumPayout: number }>({
    mutationFn: async (config: { platformFee: number; streamerShare: number; minimumPayout: number }) => {
      // Mock implementation
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-config'] });
      toast.success('Configuración actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar configuración');
    },
  });
};
