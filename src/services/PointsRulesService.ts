import api from './httpClient';
import { CreateRuleData, UpdateRuleData, PointsRulesResponse, PointsRuleResponse } from '../models/points-rules';

export const PointsRulesService = {
  // Obtener todas las reglas
  getAllRules: async (): Promise<PointsRulesResponse> => {
    const response = await api.get<PointsRulesResponse>('/admin/points/rules');
    return response.data;
  },

  // Obtener una regla específica
  getRule: async (ruleId: string): Promise<PointsRuleResponse> => {
    const response = await api.get<PointsRuleResponse>(`/admin/points/rules/${ruleId}`);
    return response.data;
  },

  // Crear una nueva regla
  createRule: async (data: CreateRuleData): Promise<PointsRuleResponse> => {
    const response = await api.post<PointsRuleResponse>('/admin/points/rules', data);
    return response.data;
  },

  // Actualizar una regla existente
  updateRule: async (ruleId: string, data: UpdateRuleData): Promise<PointsRuleResponse> => {
    const response = await api.put<PointsRuleResponse>(`/admin/points/rules/${ruleId}`, data);
    return response.data;
  },

  // Eliminar una regla
  deleteRule: async (ruleId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/admin/points/rules/${ruleId}`);
    return response.data;
  },

  // Activar/Desactivar una regla
  toggleRuleStatus: async (ruleId: string): Promise<PointsRuleResponse> => {
    const response = await api.patch<PointsRuleResponse>(`/admin/points/rules/${ruleId}/toggle`);
    return response.data;
  },
};
