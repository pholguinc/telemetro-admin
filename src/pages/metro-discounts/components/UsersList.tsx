import React from 'react';
import { Crown, User, Phone, Mail, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import type { User as UserType } from '../../../models/metro-discount';

interface UsersListProps {
  users: UserType[];
  isLoading: boolean;
  onTogglePremium: (user: UserType) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  isLoading,
  onTogglePremium,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="text-gray-500 mb-2">
            <User className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No hay usuarios
          </h3>
          <p className="text-gray-500">
            No se encontraron usuarios con los filtros aplicados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
                Estado Premium
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {user.hasMetroPremium ? (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user._id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      {user.phone}
                    </div>
                    {user.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onTogglePremium(user)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.hasMetroPremium
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.hasMetroPremium ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Regular
                      </>
                    )}
                  </button>
                  {user.premiumExpiryDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Expira: {new Date(user.premiumExpiryDate).toLocaleDateString('es-PE')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {new Date(user.createdAt).toLocaleDateString('es-PE')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onTogglePremium(user)}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                      user.hasMetroPremium
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    }`}
                  >
                    {user.hasMetroPremium ? (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-1" />
                        Quitar Premium
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4 mr-1" />
                        Activar Premium
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;


