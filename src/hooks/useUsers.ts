import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService as usersService } from '../services';
import { User, UsersPage } from '../models';
import toast from 'react-hot-toast';

// Additional types for user operations
interface CreateUserData {
  name: string;
  username?: string;
  phone: string;
  email: string;
  role?: 'user' | 'admin' | 'premium' | 'metro_streamer';
  status?: 'active' | 'inactive';
  points?: number;
}

interface UpdateUserData extends Partial<CreateUserData> {}

interface UserFilters {
  role?: 'user' | 'admin' | 'premium' | 'metro_streamer';
  status?: 'active' | 'inactive';
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Hook para obtener todos los usuarios
export const useUsers = (
  page: number = 1, 
  limit: number = 10, 
  filters: UserFilters = {}
) => {
  return useQuery<UsersPage>({
    queryKey: ['users', page, limit, filters],
    queryFn: async () => {
      const response = await usersService.getAll(page, limit, filters);
      return response?.data || { users: [], pagination: { page: 1, limit: 10, total: 0 } };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener un usuario específico
export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await usersService.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para actualizar un usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, { id: string; data: UpdateUserData }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => 
      usersService.update(id, data),
    onSuccess: (updatedUser, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar usuario';
      toast.error(message);
    },
  });
};

// Hook para crear un usuario
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, CreateUserData>({
    mutationFn: (userData: CreateUserData) => usersService.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear usuario';
      toast.error(message);
    },
  });
};

// Hook para eliminar un usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar usuario';
      toast.error(message);
    },
  });
};
