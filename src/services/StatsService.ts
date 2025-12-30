import api from './httpClient';
import type { AdminStats } from '../models';

export const StatsService = {
  getDashboard: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};


