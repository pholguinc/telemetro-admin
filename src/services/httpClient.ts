import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/environment';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    console.log('Making request to:', config.url, 'with token:', token ? 'YES' : 'NO');
    
    if (token) {
      if (config.headers) {
        // Soportar AxiosHeaders o objeto plano
        const headers: any = config.headers as any;
        if (typeof headers.set === 'function') {
          headers.set('Authorization', `Bearer ${token}`);
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        (config as any).headers = { Authorization: `Bearer ${token}` };
      }
    }

    // Para FormData, no establecer Content-Type (axios lo hace automáticamente)
    if (config.data instanceof FormData && config.headers) {
      const headers: any = config.headers as any;
      if (typeof headers.delete === 'function') {
        headers.delete('Content-Type');
      } else {
        delete headers['Content-Type'];
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    console.error('API Error:', error);

    // Manejar errores de autenticación
    const status = (error.response && error.response.status) || 0;
    if (status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      return Promise.reject(error);
    }

    // Mostrar mensaje de error
    const message = (error.response?.data as any)?.error?.message || (error.response?.data as any)?.message || 'Error de conexión';
    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;


