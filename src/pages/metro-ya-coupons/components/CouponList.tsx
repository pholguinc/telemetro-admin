import React from 'react';
import { Edit, Trash2, ToggleLeft, ToggleRight, Eye, MoreVertical } from 'lucide-react';
import type { MetroYaCoupon } from '../../../models/metro-ya-coupon';

interface CouponListProps {
  coupons: MetroYaCoupon[];
  isLoading: boolean;
  onEdit: (coupon: MetroYaCoupon) => void;
  onDelete: (coupon: MetroYaCoupon) => void;
  onToggleStatus: (coupon: MetroYaCoupon) => void;
  onViewDetails: (coupon: MetroYaCoupon) => void;
}

const CouponList: React.FC<CouponListProps> = ({
  coupons,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
}) => {
  const formatBenefit = (coupon: MetroYaCoupon): string => {
    switch (coupon.benefitType) {
      case 'discount_percentage':
        return `${coupon.discountPercentage}% de descuento`;
      case 'discount_fixed':
        return `S/ ${coupon.discountAmount} de descuento`;
      case 'free_trip':
        return 'Viaje gratis';
      case 'points_bonus':
        return `+${coupon.pointsBonus} puntos`;
      case 'custom':
        return 'Beneficio personalizado';
      default:
        return 'Sin beneficio definido';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'transport':
        return 'bg-blue-100 text-blue-800';
      case 'discount':
        return 'bg-green-100 text-green-800';
      case 'special':
        return 'bg-purple-100 text-purple-800';
      case 'bonus':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'transport':
        return 'Transporte';
      case 'discount':
        return 'Descuento';
      case 'special':
        return 'Especial';
      case 'bonus':
        return 'Bonus';
      default:
        return 'Otro';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cupones</h3>
        <p className="text-gray-500">No se encontraron cupones con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cupón
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beneficio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                        {coupon.icon}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {coupon.code}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatBenefit(coupon)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(coupon.category)}`}>
                    {getCategoryLabel(coupon.category)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                        <div className="font-medium">{coupon.stats.totalUses}</div>
                        <div className="text-gray-500 text-xs">
                        {coupon.stats.activeUsers} usuarios
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    coupon.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {coupon.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(coupon.createdAt).toLocaleDateString('es-PE')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewDetails(coupon)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(coupon)}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(coupon)}
                      className={`transition-colors ${
                        coupon.isActive 
                          ? 'text-red-400 hover:text-red-600' 
                          : 'text-green-400 hover:text-green-600'
                      }`}
                      title={coupon.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {coupon.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(coupon)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponList;
