import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, Globe, Save, RefreshCw } from 'lucide-react';
import { NotificationsService } from '../../services/NotificationsService';
import toast from 'react-hot-toast';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  categories: {
    general: boolean;
    promotions: boolean;
    updates: boolean;
    security: boolean;
    social: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface UserNotificationSettingsProps {
  userId?: string;
  onSettingsChange?: (settings: NotificationSettings) => void;
}

const UserNotificationSettings: React.FC<UserNotificationSettingsProps> = ({
  userId,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    categories: {
      general: true,
      promotions: true,
      updates: true,
      security: true,
      social: false
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await NotificationsService.getUserSettings();
      if (response.data?.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await NotificationsService.updateUserSettings(settings);
      toast.success('Configuración guardada exitosamente');
      onSettingsChange?.(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings, value?: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value !== undefined ? value : !prev[key]
    }));
  };

  const handleCategoryToggle = (category: keyof NotificationSettings['categories']) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  const handleQuietHoursToggle = () => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled
      }
    }));
  };

  const handleTimeChange = (type: 'startTime' | 'endTime', value: string) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [type]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuración de Notificaciones</h2>
          <p className="text-gray-600 mt-1">Personaliza cómo y cuándo recibir notificaciones</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadSettings}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
            type="button"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recargar</span>
          </button>
          
          <button
            onClick={saveSettings}
            className="btn-primary flex items-center space-x-2"
            disabled={saving}
            type="button"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{saving ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Canales de notificación */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Canales de Notificación</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones Push</p>
                  <p className="text-sm text-gray-500">Recibe notificaciones en tu dispositivo</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones por Email</p>
                  <p className="text-sm text-gray-500">Recibe notificaciones en tu correo</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones en la App</p>
                  <p className="text-sm text-gray-500">Notificaciones dentro de la aplicación</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.inAppNotifications}
                  onChange={() => handleToggle('inAppNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Categorías de notificaciones */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Notificaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.categories).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{key}</p>
                  <p className="text-sm text-gray-500">
                    {key === 'general' && 'Notificaciones generales del sistema'}
                    {key === 'promotions' && 'Ofertas y promociones especiales'}
                    {key === 'updates' && 'Actualizaciones de la aplicación'}
                    {key === 'security' && 'Alertas de seguridad'}
                    {key === 'social' && 'Actividad social y comentarios'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleCategoryToggle(key as keyof NotificationSettings['categories'])}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Horario silencioso */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Horario Silencioso</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900">Activar horario silencioso</p>
                <p className="text-sm text-gray-500">No recibir notificaciones durante estas horas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={handleQuietHoursToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de fin
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotificationSettings;


