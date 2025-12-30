import api from './httpClient';

export const AuthService = {
  login: async (phone: string, pin: string) => {
    const response = await api.post('/auth/login-pin', { phone, pin });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },
  getToken: () => {
    return localStorage.getItem('adminToken');
  }
};

export const authService = AuthService;


