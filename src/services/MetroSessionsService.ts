import api from './httpClient';

export const MetroSessionsService = {
  getAllSessions: async (params: Record<string, unknown> = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await api.get(`/admin/metro-sessions?${queryParams}`);
    return response.data;
  },
  getSession: async (sessionId: string) => {
    const response = await api.get(`/admin/metro-sessions/${sessionId}`);
    return response.data;
  },
  createSession: async (sessionData: Record<string, unknown>) => {
    const response = await api.post('/admin/metro-sessions', sessionData);
    return response.data;
  },
  updateSession: async (sessionId: string, sessionData: Record<string, unknown>) => {
    const response = await api.put(`/admin/metro-sessions/${sessionId}`, sessionData);
    return response.data;
  },
  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/admin/metro-sessions/${sessionId}`);
    return response.data;
  },
  getLiveSessions: async () => {
    const response = await api.get('/metro-sessions/live');
    return response.data;
  },
  getSessionStats: async () => {
    const response = await api.get('/admin/metro-sessions/stats');
    return response.data;
  }
};


