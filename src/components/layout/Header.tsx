import React from 'react';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// Types
interface HeaderProps {
  onMenuClick: () => void;
}

type Language = 'es' | 'en';

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState<boolean>(false);

  const handleLogout = (): void => {
    logout();
    setDropdownOpen(false);
  };

  const changeLanguage = (lng: Language): void => {
    i18n.changeLanguage(lng);
  };

  const handleDropdownToggle = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSettingsClick = (): void => {
    setDropdownOpen(false);
    // TODO: Implementar navegación a configuración
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Botón de menú móvil y título */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900">
            Panel de Administración
          </h1>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-4">


          {/* Dropdown del usuario */}
          <div className="relative">
            <button
              onClick={handleDropdownToggle}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
              aria-label="Menú de usuario"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.metroUsername || user?.displayName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.metroUsername || user?.displayName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.phone}</p>
                </div>
                
                <button
                  onClick={handleSettingsClick}
                  className="hidden items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  type="button"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Configuración
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  type="button"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
