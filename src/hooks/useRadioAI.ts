import RadioAiService from '@/services/radio-ai/radioAiService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// ========== INTERFACES ==========

export interface Music {
  _id: string;
  userId: {
    _id: string;
    displayName?: string;
    fullName?: string;
    metroUsername?: string;
    email?: string;
  };
  title: string;
  subtitle: string;
  emotion: string;
  duration: number;
  trackId: string;
  status: 'processing' | 'completed' | 'failed';
  trackUrl?: string;
  image_url?: string;
  generatedAt?: Date;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MusicDraft {
  title: string;
  subtitle: string;
  emotion: string;
  image_url?: string;
}

export interface AdminStats {
  totalMusic: number;
  totalUsers: number;
  recentMusic: number;
  statusDistribution: Array<{ _id: string; count: number }>;
  emotionDistribution: Array<{ _id: string; count: number }>;
}

interface CreateData extends Record<string, unknown> {
  title: string;
  subtitle: string;
  emotion: string;
  image_url?: string;
}

// ========== HOOK DE FORMULARIO ==========

export const useRadioAiForm = (
  initialDraft: MusicDraft,
  editing: Music | null,
  onReset?: () => void
) => {
  const [draft, setDraft] = useState<MusicDraft>(
    editing
      ? {
          title: editing.title,
          subtitle: editing.subtitle,
          emotion: editing.emotion,
          image_url: editing.image_url,
        }
      : initialDraft
  );
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setDraft((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleImageUpload = async (url: string) => {
    setDraft((prev) => ({ ...prev, image_url: url }));
  };

  const handleRemoveImage = () => {
    setDraft((prev) => ({ ...prev, image_url: undefined }));
  };

  const resetForm = useCallback(() => {
    setDraft(initialDraft);
    setFormSubmitted(false);
    if (onReset) onReset();
  }, [initialDraft, onReset]);

  return {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    resetForm,
  };
};

// ========== QUERIES ==========

/**
 * Query: Obtener todas las músicas con filtros (admin)
 */
export const useAdminMusic = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ['admin-music', params],
    queryFn: async () => {
      const response = await RadioAiService.getAll(params);
      return response.data;
    },
  });
};

/**
 * Query: Obtener estadísticas admin
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-music-stats'],
    queryFn: async () => {
      const response = await RadioAiService.getAdminStats();
      return response.data;
    },
  });
};

/**
 * Query: Obtener música por ID
 */
export const useMusicById = (id: string) => {
  return useQuery({
    queryKey: ['music', id],
    queryFn: async () => {
      const response = await RadioAiService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Query: Obtener músicas pendientes
 */
export const usePendingMusic = () => {
  return useQuery({
    queryKey: ['admin-music-pending'],
    queryFn: async () => {
      const response = await RadioAiService.getPending();
      return response.data;
    },
  });
};

/**
 * Query: Obtener músicas fallidas
 */
export const useFailedMusic = () => {
  return useQuery({
    queryKey: ['admin-music-failed'],
    queryFn: async () => {
      const response = await RadioAiService.getFailed();
      return response.data;
    },
  });
};

// ========== MUTATIONS ==========

/**
 * Mutation: Actualizar música
 */
export const useUpdateMusic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateData }) =>
      RadioAiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-stats'] });
      queryClient.invalidateQueries({ queryKey: ['music'] });
      toast.success('Música actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar música');
    },
  });
};

/**
 * Mutation: Cambiar estado de música
 */
export const useToggleMusicStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RadioAiService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-failed'] });
      toast.success('Estado actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al cambiar estado');
    },
  });
};

/**
 * Mutation: Eliminar música
 */
export const useDeleteMusic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RadioAiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-stats'] });
      toast.success('Música eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar música');
    },
  });
};

/**
 * Mutation: Marcar como completada
 */
export const useMarkAsCompleted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RadioAiService.markAsCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-pending'] });
      toast.success('Música marcada como completada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar estado');
    },
  });
};

/**
 * Mutation: Marcar como fallida
 */
export const useMarkAsFailed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      RadioAiService.markAsFailed(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-pending'] });
      toast.success('Música marcada como fallida');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar estado');
    },
  });
};

/**
 * Mutation: Actualizar imagen
 */
export const useUpdateMusicImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, image_url }: { id: string; image_url: string }) =>
      RadioAiService.updateImage(id, image_url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['music'] });
      toast.success('Imagen actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar imagen');
    },
  });
};

/**
 * Mutation: Actualizar URL de track
 */
export const useUpdateTrackUrl = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trackUrl }: { id: string; trackUrl: string }) =>
      RadioAiService.updateTrackUrl(id, trackUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['music'] });
      toast.success('URL de track actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar URL');
    },
  });
};

/**
 * Mutation: Limpiar música expirada
 */
export const useCleanExpired = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => RadioAiService.cleanExpired(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-stats'] });
      toast.success('Música expirada limpiada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al limpiar música expirada');
    },
  });
};

/**
 * Mutation: Reintentar generación
 */
export const useRetryMusic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RadioAiService.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-music-failed'] });
      toast.success('Reintentando generación de música');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al reintentar');
    },
  });
};