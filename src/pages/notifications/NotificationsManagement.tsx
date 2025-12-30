import React, { useState } from 'react';
import { Send, Bell, LayoutList, Plus, Trash2, Edit, RefreshCw, BarChart3, TestTube, Users } from 'lucide-react';
import { 
  useNotifications, 
  useNotificationTemplates, 
  useSendBroadcast, 
  useCreateTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate,
  useNotificationStats,
  useSendTestNotification
} from '../../hooks/useNotifications';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  status: 'sent' | 'pending' | 'failed';
  targetAudience?: {
    roles?: string[];
    userIds?: string[];
    location?: string[];
  };
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  category?: string;
  variables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type Tab = 'broadcast' | 'templates' | 'history' | 'stats';
type Target = 'all' | 'premium' | 'inactive' | 'byUserId';

const NotificationsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('broadcast');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [target, setTarget] = useState<Target>('all');
  const [userId, setUserId] = useState<string>('');
  const [category, setCategory] = useState<string>('general');
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const { data: notifications = [], isLoading: loadingNotifications, refetch } = useNotifications({ limit: 50 });
  const { data: templates = [], isLoading: loadingTemplates, refetch: refetchTemplates } = useNotificationTemplates();
  const { data: stats, isLoading: loadingStats } = useNotificationStats();

  const sendBroadcast = useSendBroadcast();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const sendTestNotification = useSendTestNotification();

  const handleSend = async (): Promise<void> => {
    if (!title.trim() || !message.trim()) return;
    
    const payload = {
      title: title.trim(),
      message: message.trim(),
      type: 'info' as const,
      targetAudience: {
        hasMetroPremium: target === 'premium' ? true : undefined,
        userIds: target === 'byUserId' && userId ? [userId] : undefined
      }
    };
    
    try {
      await sendBroadcast.mutateAsync(payload);
      setTitle('');
      setMessage('');
      setUserId('');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleCreateTemplate = async (): Promise<void> => {
    if (!title.trim() || !message.trim()) return;
    
    const templateData = {
      name: title.trim(),
      title: title.trim(),
      message: message.trim(),
      type: 'info' as const,
      category: category,
      isActive: true
    };
    
    try {
      await createTemplate.mutateAsync(templateData);
      setTitle('');
      setMessage('');
      setCategory('general');
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleEditTemplate = (template: NotificationTemplate): void => {
    setEditingTemplate(template);
    setTitle(template.title);
    setMessage(template.message);
    setCategory(template.category || 'general');
    setActiveTab('templates');
  };

  const handleUpdateTemplate = async (): Promise<void> => {
    if (!editingTemplate || !title.trim() || !message.trim()) return;
    
    const templateData = {
      name: title.trim(),
      title: title.trim(),
      message: message.trim(),
      type: editingTemplate.type,
      category: category,
      isActive: editingTemplate.isActive
    };
    
    try {
      await updateTemplate.mutateAsync({ 
        id: editingTemplate.id, 
        data: templateData 
      });
      setEditingTemplate(null);
      setTitle('');
      setMessage('');
      setCategory('general');
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (template: NotificationTemplate): Promise<void> => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el template "${template.name}"?`)) {
      try {
        await deleteTemplate.mutateAsync(template.id);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleTabChange = (tab: Tab): void => {
    setActiveTab(tab);
    setEditingTemplate(null);
    setTitle('');
    setMessage('');
    setCategory('general');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setTarget(e.target.value as Target);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserId(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setCategory(e.target.value);
  };

  const handleRefresh = (): void => {
    if (activeTab === 'history') {
      refetch();
    } else if (activeTab === 'templates') {
      refetchTemplates();
    }
  };

  const handleSendTest = async (): Promise<void> => {
    try {
      await sendTestNotification.mutateAsync();
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'promotion':
        return 'bg-purple-100 text-purple-700';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔔 Gestión de Notificaciones</h1>
          <p className="text-gray-600 mt-2">
            Envía notificaciones y gestiona templates
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center space-x-2 mt-4 sm:mt-0"
          disabled={loadingNotifications || loadingTemplates}
          type="button"
        >
          <RefreshCw className={`h-5 w-5 ${(loadingNotifications || loadingTemplates) ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('broadcast')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'broadcast'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            📢 Enviar Notificación
          </button>
          
          <button
            onClick={() => handleTabChange('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            📝 Templates
          </button>
          
          <button
            onClick={() => handleTabChange('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            📋 Historial
          </button>
          
          <button
            onClick={() => handleTabChange('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            📊 Estadísticas
          </button>
        </nav>
      </div>

      {/* Contenido según tab */}
      {activeTab === 'broadcast' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Enviar Notificación</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className="input-field"
                placeholder="Título de la notificación"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={handleMessageChange}
                rows={4}
                className="input-field resize-none"
                placeholder="Escribe tu mensaje aquí..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                className="input-field"
              >
                <option value="general">General</option>
                <option value="content">Contenido</option>
                <option value="security">Seguridad</option>
                <option value="promotion">Promoción</option>
                <option value="system">Sistema</option>
                <option value="social">Social</option>
              </select>
            </div>

            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-2">
                Audiencia
              </label>
              <select
                id="target"
                value={target}
                onChange={handleTargetChange}
                className="input-field"
              >
                <option value="all">Todos los usuarios</option>
                <option value="premium">Solo usuarios premium</option>
                <option value="inactive">Usuarios inactivos</option>
                <option value="byUserId">Usuario específico</option>
              </select>
            </div>

            {target === 'byUserId' && (
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Usuario
                </label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={handleUserIdChange}
                  className="input-field"
                  placeholder="ID del usuario"
                />
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={handleSendTest}
                className="btn-secondary flex items-center space-x-2"
                disabled={sendTestNotification.isPending}
                type="button"
              >
                {sendTestNotification.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                  <TestTube className="h-5 w-5" />
                )}
                <span>
                  {sendTestNotification.isPending ? 'Enviando...' : 'Enviar Prueba'}
                </span>
              </button>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleCreateTemplate}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={!title.trim() || !message.trim() || createTemplate.isPending}
                  type="button"
                >
                  <Plus className="h-5 w-5" />
                  <span>Guardar como Template</span>
                </button>
                
                <button
                  onClick={handleSend}
                  className="btn-primary flex items-center space-x-2"
                  disabled={!title.trim() || !message.trim() || sendBroadcast.isPending}
                  type="button"
                >
                  {sendBroadcast.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span>
                    {sendBroadcast.isPending ? 'Enviando...' : 'Enviar Notificación'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Templates ({templates.length})
            </h2>
          </div>

          {loadingTemplates ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <LayoutList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay templates
              </h3>
              <p className="text-gray-500">
                Crea templates para reutilizar notificaciones frecuentes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template: NotificationTemplate) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {template.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900 font-medium mb-1">{template.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{template.message}</p>
                      
                      <p className="text-xs text-gray-500">
                        Creado: {formatDate(template.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar template"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar template"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Historial de Notificaciones ({notifications.length})
            </h2>
          </div>

          {loadingNotifications ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-500">
                Las notificaciones enviadas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: Notification) => (
                <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      
                      <p className="text-xs text-gray-500">
                        {notification.sentAt ? `Enviado: ${formatDate(notification.sentAt)}` : `Creado: ${formatDate(notification.createdAt)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Estadísticas generales */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notificaciones</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalNotifications}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Enviadas</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.sentNotifications}</p>
                    <p className="text-sm text-gray-500">{stats.sendRate}% del total</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Leídas</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.readNotifications}</p>
                    <p className="text-sm text-gray-500">{stats.readRate}% de enviadas</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Templates</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{templates.length}</p>
                    <p className="text-sm text-gray-500">Disponibles</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <LayoutList className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notificaciones por tipo */}
          {stats?.notificationsByType && stats.notificationsByType.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Notificaciones por Tipo
              </h2>
              <div className="space-y-4">
                {stats.notificationsByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(item._id)}`}>
                        {item._id}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{item.count}</p>
                      <p className="text-sm text-gray-500">notificaciones</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actividad reciente */}
          {stats?.recentActivity && stats.recentActivity.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Actividad de los Últimos 7 Días
              </h2>
              <div className="space-y-4">
                {stats.recentActivity.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{day._id}</p>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{day.sent}</p>
                        <p className="text-gray-500">Enviadas</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{day.read}</p>
                        <p className="text-gray-500">Leídas</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingStats && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando estadísticas...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;
