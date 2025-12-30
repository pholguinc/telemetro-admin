import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PointsRulesService } from '../services/PointsRulesService';
import { CreateRuleData, UpdateRuleData } from '../models/points-rules';
import toast from 'react-hot-toast';

// Hook para obtener todas las reglas
export const usePointsRules = () => {
  return useQuery({
    queryKey: ['points-rules'],
    queryFn: async () => {
      const response = await PointsRulesService.getAllRules();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al obtener reglas');
      }
      return response.data;
    },
  });
};

// Hook para obtener una regla específica
export const usePointsRule = (ruleId: string) => {
  return useQuery({
    queryKey: ['points-rule', ruleId],
    queryFn: async () => {
      const response = await PointsRulesService.getRule(ruleId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al obtener regla');
      }
      return response.data.rule;
    },
    enabled: !!ruleId,
  });
};

// Hook para crear una nueva regla
export const useCreateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRuleData) => PointsRulesService.createRule(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['points-rules'] });
        toast.success('Regla creada exitosamente');
      } else {
        toast.error(response.message || 'Error al crear regla');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear regla');
    },
  });
};

// Hook para actualizar una regla
export const useUpdateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: UpdateRuleData }) =>
      PointsRulesService.updateRule(ruleId, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['points-rules'] });
        queryClient.invalidateQueries({ queryKey: ['points-rule', variables.ruleId] });
        toast.success('Regla actualizada exitosamente');
      } else {
        toast.error(response.message || 'Error al actualizar regla');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar regla');
    },
  });
};

// Hook para eliminar una regla
export const useDeleteRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => PointsRulesService.deleteRule(ruleId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['points-rules'] });
        toast.success('Regla eliminada exitosamente');
      } else {
        toast.error(response.message || 'Error al eliminar regla');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar regla');
    },
  });
};

// Hook para activar/desactivar una regla
export const useToggleRuleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => PointsRulesService.toggleRuleStatus(ruleId),
    onSuccess: (response, ruleId) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['points-rules'] });
        queryClient.invalidateQueries({ queryKey: ['points-rule', ruleId] });
        toast.success('Estado de regla actualizado');
      } else {
        toast.error(response.message || 'Error al cambiar estado de regla');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al cambiar estado de regla');
    },
  });
};
