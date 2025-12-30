import React from 'react';
import { Ticket, User, Phone, Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { MetroDiscount } from '../../../models/metro-discount';

interface DiscountListProps {
  discounts: MetroDiscount[];
  isLoading: boolean;
  onUseDiscount: (discount: MetroDiscount) => void;
}

const DiscountList: React.FC<DiscountListProps> = ({
  discounts,
  isLoading,
  onUseDiscount,
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

  if (discounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="text-center py-12">
            <Ticket className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay descuentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron descuentos con los filtros aplicados
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (discount: MetroDiscount) => {
    if (discount.isUsed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Usado
        </span>
      );
    }
    if (new Date(discount.validUntil) < new Date()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Expirado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Activo
      </span>
    );
  };

  const getTripTypeBadge = (tripType: string) => {
    const types = {
      single: { label: 'Simple', color: 'bg-blue-100 text-blue-800' },
      round_trip: { label: 'Ida y Vuelta', color: 'bg-purple-100 text-purple-800' },
      monthly_pass: { label: 'Pase Mensual', color: 'bg-indigo-100 text-indigo-800' },
    };
    const type = types[tripType as keyof typeof types] || { label: tripType, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.color}`}>
        {type.label}
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

  const getUserInfo = (discount: MetroDiscount) => {
    if (!discount.userId || typeof discount.userId === 'string') {
      return { displayName: 'Usuario eliminado', phone: '-' };
    }
    return {
      displayName: discount.userId.displayName || 'Usuario',
      phone: discount.userId.phone || '-',
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
                Descuento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo Viaje
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estaciones
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Válido Hasta
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
            {discounts.map((discount) => {
              const userInfo = getUserInfo(discount);
              const canUse = !discount.isUsed && new Date(discount.validUntil) > new Date();
              
              return (
                <tr key={discount._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Ticket className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-mono font-bold text-gray-900">
                        {discount.discountCode}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {discount.pointsUsed} puntos
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      {discount.discountValue}% OFF
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTripTypeBadge(discount.tripType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="line-through text-gray-500">S/ {discount.originalPrice.toFixed(2)}</span>
                      {' → '}
                      <span className="font-bold text-green-600">S/ {discount.finalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Ahorro: S/ {(discount.originalPrice - discount.finalPrice).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {discount.stationFrom && discount.stationTo ? (
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{discount.stationFrom} → {discount.stationTo}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin estaciones</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(discount.validUntil)}
                    </div>
                    {discount.usedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Usado: {formatDate(discount.usedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(discount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {canUse && (
                      <button
                        onClick={() => onUseDiscount(discount)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Usar Descuento
                      </button>
                    )}
                    {discount.isUsed && (
                      <span className="text-green-600">✓ Usado</span>
                    )}
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

export default DiscountList;








