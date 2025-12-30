import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService as authService } from '../services';
import toast from 'react-hot-toast';

// Types
interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'user' | 'premium' | 'metro_streamer';
  metroUsername?: string;
  displayName?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, pin: string) => Promise<LoginResponse>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface ApiResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  error?: {
    message: string;
  };
}

interface ApiError {
  response?: {
    data?: {
      error?: {
        message: string;
      };
    };
  };
  message: string;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si hay un usuario guardado al cargar
    const savedUser = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (savedUser && token) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = async (phone: string, pin: string): Promise<LoginResponse> => {
    try {
      setLoading(true);
      
      // Asegurar formato de teléfono
      const formattedPhone = phone.startsWith('+51') ? phone : `+51${phone}`;
      
      const response: ApiResponse = await authService.login(formattedPhone, pin);
      
      if (response.success && response.data.user.role === 'admin') {
        const { token, user: userData } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        
        // Actualizar estado
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('¡Bienvenido al panel de administración!');
        return { success: true };
      } else {
        throw new Error('Credenciales inválidas o no tienes permisos de administrador');
      }
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      const message = apiError.response?.data?.error?.message || apiError.message || 'Error al iniciar sesión';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Sesión cerrada correctamente');
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
