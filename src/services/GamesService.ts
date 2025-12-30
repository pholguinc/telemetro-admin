import api from './httpClient';

export const GamesService = {
  getAll: async () => {
    const response = await api.get('/admin/games');
    return response.data;
  },
  create: async (gameData: Record<string, unknown>) => {
    const response = await api.post('/admin/games', gameData);
    return response.data;
  },
  update: async (id: string, gameData: Record<string, unknown>) => {
    const response = await api.put(`/admin/games/${id}`, gameData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/games/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/games/stats');
    return response.data;
  },
  getResults: async () => {
    const response = await api.get('/admin/games/results');
    return response.data;
  }
};


