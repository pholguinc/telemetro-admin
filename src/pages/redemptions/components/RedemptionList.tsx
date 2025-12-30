import React from 'react';
import { Gift, User, Phone, Calendar, MapPin, CheckCircle, Clock, Package, XCircle } from 'lucide-react';
import type { Redemption } from '../../../models/redemptions';

interface RedemptionListProps {
  redemptions: Redemption[];
  isLoading: boolean;
  onConfirm: (redemption: Redemption) => void;
  onDeliver: (redemption: Redemption) => void;
}

const RedemptionList: React.FC<RedemptionListProps> = ({
  redemptions,
  isLoading,
  onConfirm,
  onDeliver,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="text-center py-12">
            <Gift className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay canjes</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron canjes con los filtros aplicados
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Confirmado', color: 'bg-purple-100 text-purple-800', icon: Package },
      delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const badge = badges[status as keyof typeof badges] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-800',
      icon: Gift 
    };
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserInfo = (redemption: Redemption) => {
    if (!redemption.userId || typeof redemption.userId === 'string') {
      return { displayName: 'Usuario eliminado', phone: '-' };
    }
    return {
      displayName: redemption.userId.displayName || 'Usuario',
      phone: redemption.userId.phone || '-',
    };
  };

  const getProductInfo = (redemption: Redemption) => {
    if (!redemption.productId || typeof redemption.productId === 'string') {
      return { name: 'Producto eliminado', category: '-' };
    }
    return {
      name: redemption.productId.name || 'Producto',
      category: redemption.productId.category || '-',
    };
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Canje
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {redemptions.map((redemption) => {
              const userInfo = getUserInfo(redemption);
              const productInfo = getProductInfo(redemption);
              
              return (
                <tr key={redemption._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Gift className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-mono font-bold text-gray-900">
                        {redemption.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {userInfo.displayName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {userInfo.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {productInfo.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {productInfo.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-blue-600">
                      {redemption.pointsSpent} pts
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {redemption.station ? (
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {redemption.station.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {redemption.station.code}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin estación</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(redemption.createdAt)}
                    </div>
                    {redemption.deliveredAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Entregado: {formatDate(redemption.deliveredAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(redemption.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col gap-2">
                      {redemption.status === 'pending' && (
                        <button
                          onClick={() => onConfirm(redemption)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Confirmar
                        </button>
                      )}
                      {redemption.status === 'confirmed' && (
                        <button
                          onClick={() => onDeliver(redemption)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Marcar Entregado
                        </button>
                      )}
                      {redemption.status === 'delivered' && (
                        <span className="text-green-600">✓ Completado</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RedemptionList;





