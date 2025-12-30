import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetroYaService as metroYaService } from '../services';
import toast from 'react-hot-toast';

// Basic types for MetroYa
interface MetroYaService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

interface MetroYaBooking {
  id: string;
  userId: string;
  serviceId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: string;
  createdAt: string;
}

interface ServiceFilters extends Record<string, unknown> {
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Hooks
export const useMetroYaServices = (params: ServiceFilters = {}) => {
  return useQuery<MetroYaService[]>({
    queryKey: ['metro-ya-services', params],
    queryFn: async () => {
      const response = await metroYaService.getServices(params);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMetroYaBookings = (params: Record<string, unknown> = {}) => {
  return useQuery<MetroYaBooking[]>({
    queryKey: ['metro-ya-bookings', params],
    queryFn: async () => {
      const response = await metroYaService.getBookings?.(params);
      return response?.data || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!metroYaService.getBookings,
  });
};

export const useCreateMetroYaService = () => {
  const queryClient = useQueryClient();
  
  return useMutation<MetroYaService, Error, Record<string, unknown>>({
    mutationFn: (data: Record<string, unknown>) => metroYaService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metro-ya-services'] });
      toast.success('Servicio MetroYa creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al crear servicio');
    },
  });
};
