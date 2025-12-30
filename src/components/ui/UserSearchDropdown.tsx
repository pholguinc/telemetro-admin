import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronDown, X } from 'lucide-react';
import { StreamersService } from '../../services';
import { buildImageUrl } from '../../config/environment';

interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface UserSearchDropdownProps {
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  selectedUser,
  onUserSelect,
  placeholder = "Buscar usuario por nombre, username o email...",
  disabled = false,
  error = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para buscar usuarios
  const searchUsers = async (search: string) => {
    if (search.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await StreamersService.searchUsers(search, 8);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce de búsqueda
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchTerm) {
      const timeout = setTimeout(() => {
        searchUsers(searchTerm);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setUsers([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setSearchTerm('');
    setIsOpen(false);
    setUsers([]);
  };

  const clearSelection = () => {
    onUserSelect(null);
    setSearchTerm('');
    setUsers([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (searchTerm) {
      searchUsers(searchTerm);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Usuario seleccionado */}
      {selectedUser ? (
        <div className={`
          w-full px-4 py-2 border rounded-lg flex items-center justify-between
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {selectedUser.avatar ? (
                <img
                  src={buildImageUrl(selectedUser.avatar)}
                  alt={selectedUser.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedUser.displayName}
              </p>
              <p className="text-xs text-gray-500">
                @{selectedUser.username} • {selectedUser.email}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        /* Input de búsqueda */
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-4 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <ChevronDown className={`
            absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `} />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !selectedUser && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Buscando usuarios...
            </div>
          ) : users.length > 0 ? (
            <>
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={buildImageUrl(user.avatar)}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{user.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : searchTerm.length >= 2 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No se encontraron usuarios
            </div>
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;


