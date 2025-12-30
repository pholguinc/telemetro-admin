import api from './httpClient';

export const JobsService = {
  getAll: async (params: Record<string, unknown> = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'undefined')
    );
    const queryParams = new URLSearchParams(cleanParams as Record<string, string>);
    const response = await api.get(`/admin/jobs?${queryParams}`);
    return response.data;
  },
  create: async (jobData: Record<string, unknown>) => {
    const response = await api.post('/admin/jobs', jobData);
    return response.data;
  },
  update: async (id: string, jobData: Record<string, unknown>) => {
    const response = await api.put(`/admin/jobs/${id}`, jobData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/jobs/stats');
    return response.data;
  },
  getApplications: async () => {
    const response = await api.get('/admin/jobs/applications');
    return response.data;
  }
};


