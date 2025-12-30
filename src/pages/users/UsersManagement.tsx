import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, UserPlus, Eye, Edit, Trash2, MoreVertical, RefreshCw, Users, X } from 'lucide-react';
import { useUsers, useUpdateUser, useCreateUser, useDeleteUser } from '../../hooks/useUsers';
import { User } from '../../models';
import { metroYaService } from '../../services';
import toast from 'react-hot-toast';

// Types
interface UserFilters {
  search?: string;
  role?: 'user' | 'admin' | 'premium' | 'metro_streamer';
  status?: 'active' | 'inactive';
}

type RoleFilter = 'all' | 'user' | 'admin' | 'premium' | 'metro_streamer';
type StatusFilter = 'all' | 'active' | 'inactive';

interface UserStats {
  total: number;
  active: number;
  premium: number;
  admins: number;
}

interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'premium' | 'metro_streamer';
  status: 'active' | 'inactive';
  pin?: string;
}

// Interfaz específica para actualizaciones de usuario que incluye campos adicionales del backend
interface UserUpdateData {
  name?: string;
  displayName?: string; // Campo que espera el backend para el nombre
  username?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'premium' | 'metro_streamer';
  status?: 'active' | 'inactive';
  pin?: string;
  pointsDelta?: number; // Campo específico para ajuste de puntos
  points?: number; // Campo directo de puntos si es necesario
}

const UsersManagement: React.FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    pin: ''
  });

  const filters: UserFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data: usersResponse, isLoading, error, refetch } = useUsers(currentPage, 10, filters);
    
  // Safely extract users array
  const users = Array.isArray((usersResponse as any)?.data?.users) 
    ? (usersResponse as any).data.users 
    : Array.isArray((usersResponse as any)?.users)
    ? (usersResponse as any).users
    : [];
  const pagination = (usersResponse as any)?.data?.pagination || (usersResponse as any)?.pagination || {};
  
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  // Calcular estadísticas
  const stats: UserStats = {
    total: users.length,
    active: users.filter((u: User) => u.status === 'active').length,
    premium: users.filter((u: User) => u.role === 'premium').length,
    admins: users.filter((u: User) => u.role === 'admin').length,
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setRoleFilter(e.target.value as RoleFilter);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as StatusFilter);
    setCurrentPage(1);
  };

  const handleRefresh = (): void => {
    refetch();
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      pin: ''
    });
  };

  const handleCreateUser = (): void => {
    setSelectedUser(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone?.startsWith('+51') ? user.phone.slice(3) : (user.phone || ''),
      role: user.role as any,
      status: user.status as any,
      pin: '' // No mostrar PIN existente por seguridad
    });
    setShowCreateModal(true);
  };

  const handleDeleteUser = (user: User): void => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async (): Promise<void> => {
    if (!userToDelete) return;
    
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast.success(`Usuario ${userToDelete.name} eliminado correctamente`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const handleToggleUserStatus = async (user: User): Promise<void> => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const updateData: UserUpdateData = {
        status: newStatus
      };
      
      await updateUser.mutateAsync({
        id: user.id,
        data: updateData as any // Temporal: hasta que el hook useUpdateUser soporte UserUpdateData
      });
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error al actualizar el estado del usuario');
    }
  };

  const handleCloseModal = (): void => {
    setShowCreateModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      if (selectedUser) {
        // Editar usuario existente
        const updateData: UserUpdateData = {
          displayName: formData.name, // El backend espera displayName
          username: formData.username,
          email: formData.email,
          phone: formData.phone.startsWith('+51') ? formData.phone : `+51${formData.phone}`,
          role: formData.role,
          status: formData.status
        };
        
        // Solo incluir PIN si se proporcionó uno nuevo
        if (formData.pin && formData.pin.trim()) {
          updateData.pin = formData.pin;
        }
        
        await updateUser.mutateAsync({
          id: selectedUser.id,
          data: updateData
        });
        
        toast.success('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        if (!formData.pin || formData.pin.trim().length < 4) {
          toast.error('El PIN debe tener al menos 4 caracteres');
          return;
        }
        
        const createData = {
          phone: formData.phone.startsWith('+51') ? formData.phone : `+51${formData.phone}`,
          pin: formData.pin,
          displayName: formData.name, // El backend espera displayName, no name
          role: formData.role,
          username: formData.username, // Enviar siempre, incluso si está vacío
          metroUsername: formData.username, // Probar también con metroUsername
          email: formData.email, // Enviar siempre, incluso si está vacío
          status: formData.status // Enviar siempre
        };
        
        console.log('🔍 Creating user with data:', createData);
        console.log('🔍 Form data before processing:', formData);
        console.log('🔍 Username being sent:', formData.username);
        console.log('🔍 Username in createData:', createData.username);
        
        const response = await createUser.mutateAsync(createData as any); // Temporal: el backend espera displayName pero el tipo espera name
        
        console.log('✅ User creation response:', response);
        console.log('🔍 Username in response:', (response as any)?.data?.username);
        
        toast.success('Usuario creado correctamente');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(selectedUser ? 'Error al actualizar usuario' : 'Error al crear usuario');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    // Debug específico para username
    if (name === 'username') {
      console.log('🔍 Username field changed:', { name, value, length: value.length });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = async (user: User, newRole: string): Promise<void> => {
    try {
      const updateData: UserUpdateData = {
        role: newRole as UserUpdateData['role']
      };
      
      await updateUser.mutateAsync({
        id: user.id,
        data: updateData as any // Temporal: hasta que el hook useUpdateUser soporte UserUpdateData
      });
      toast.success(`Rol actualizado a ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  const handlePointsAdjustment = async (user: User): Promise<void> => {
    const adjustment = prompt('Ingrese el ajuste de puntos (positivo para sumar, negativo para restar):', '0');
    if (adjustment === null) return;
    
    const pointsDelta = parseInt(adjustment, 10);
    if (isNaN(pointsDelta) || pointsDelta === 0) {
      toast.error('Ingrese un número válido diferente de 0');
      return;
    }
    
    try {
      // Usar exactamente el formato que espera el backend
      const updateData: UserUpdateData = {
        pointsDelta
      };

      console.log('🔍 Updating user points:', {
        userId: user.id,
        currentPoints: user.points,
        pointsDelta,
        expectedNewPoints: (user.points || 0) + pointsDelta,
        updateData
      });

      const response = await updateUser.mutateAsync({
        id: user.id,
        data: updateData as any // Temporal: hasta que el hook useUpdateUser soporte UserUpdateData
      });

      console.log('✅ Points update response:', response);
      toast.success(`${pointsDelta > 0 ? 'Sumados' : 'Restados'} ${Math.abs(pointsDelta)} puntos correctamente`);
      
      // Forzar refresh para ver los cambios actualizados
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error adjusting points:', error);
      toast.error('Error al ajustar los puntos. Revisa la consola para más detalles.');
    }
  };

  const handleTogglePremium = async (user: User): Promise<void> => {
    try {
      const hasMetroPremium = (user as any).hasMetroPremium;
      await metroYaService.togglePremium(user.id, !hasMetroPremium);
      toast.success(`Premium ${hasMetroPremium ? 'desactivado' : 'activado'} correctamente`);
      refetch();
    } catch (error) {
      console.error('Error toggling premium:', error);
      toast.error('Error al cambiar el estado premium');
    }
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'premium':
        return 'bg-yellow-100 text-yellow-700';
      case 'metro_streamer':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h3>
          <p className="text-gray-500 mb-4">No se pudieron cargar los usuarios</p>
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Intentar de nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={isLoading}
            type="button"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          
          <button 
            onClick={handleCreateUser}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Premium</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.premium}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.admins}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input-field pl-10 w-full"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="input-field w-auto"
          >
            <option value="all">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
            <option value="metro_streamer">Metro Streamer</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="input-field w-auto"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Usuarios ({users.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                ? 'Intenta cambiar los filtros de búsqueda' 
                : 'Aún no hay usuarios registrados'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(users) ? users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.username || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username || 'sin_username'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email || 'Sin email'}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'Sin teléfono'}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                         {user.role !== 'user' && user.role !== 'admin' && (
                            <button
                              onClick={() => handleRoleChange(user, 'user')}
                              className="text-xs px-3 py-1 bg-sky-500 text-white border-gray-300 rounded-full hover:bg-sky-800 transition-colors"
                              title="Cambiar a usuario normal"
                            >
                              Degradar a User
                            </button>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{user.points || 0} pts</span>
                          <button
                            onClick={() => handlePointsAdjustment(user)}
                            className="text-xs text-primary-600 hover:text-primary-800 underline"
                            type="button"
                          >
                            ajustar
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.joinDate)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Editar usuario"
                            type="button"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`p-1 rounded transition-colors ${
                              user.status === 'active'
                                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? 'Desactivar' : 'Activar'}
                            type="button"
                          >
                            {user.status === 'active' ? '⏸️' : '▶️'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Eliminar usuario"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : []}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.total && pagination.total > 10 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, pagination.total)} de {pagination.total} usuarios
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      Anterior
                    </button>
                    
                    <span className="px-3 py-2 text-sm text-gray-700">
                      Página {currentPage} de {Math.ceil(pagination.total / 10)}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(pagination.total / 10)}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de creación/edición */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de usuario *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="Ej: juan_perez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="Ej: juan@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +51
                    </span>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone.startsWith('+51') ? formData.phone.slice(3) : formData.phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        handleInputChange({
                          ...e,
                          target: { ...e.target, name: 'phone', value: numericValue }
                        });
                      }}
                      className="input-field rounded-l-none"
                      required
                      placeholder="987654321"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN {selectedUser ? '(dejar vacío para mantener actual)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={handleInputChange}
                    className="input-field"
                    required={!selectedUser}
                    placeholder={selectedUser ? "Nuevo PIN (opcional)" : "Mínimo 4 caracteres"}
                    minLength={4}
                  />
                  {selectedUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Solo ingrese un PIN si desea cambiarlo
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createUser.isLoading || updateUser.isLoading}
                  >
                    {createUser.isLoading || updateUser.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      selectedUser ? 'Actualizar Usuario' : 'Crear Usuario'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirmar Eliminación
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que quieres eliminar al usuario{' '}
                <span className="font-semibold text-gray-900">
                  {userToDelete.name || userToDelete.username}
                </span>?
                <br />
                <span className="text-sm text-red-600">
                  Esta acción no se puede deshacer.
                </span>
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={deleteUser.isLoading}
                >
                  {deleteUser.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Eliminando...</span>
                    </div>
                  ) : (
                    'Eliminar Usuario'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
