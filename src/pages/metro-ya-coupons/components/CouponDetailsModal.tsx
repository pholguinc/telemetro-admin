import React from 'react';
import { X, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import type { MetroYaCouponDetail } from '../../../models/metro-ya-coupon';

interface CouponDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponDetail: MetroYaCouponDetail | null;
  isLoading: boolean;
}

const CouponDetailsModal: React.FC<CouponDetailsModalProps> = ({
  isOpen,
  onClose,
  couponDetail,
  isLoading,
}) => {
  if (!isOpen) return null;

  const formatBenefit = (coupon: any): string => {
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Detalles del Cupón</h3>
              <p className="text-sm text-gray-500">Información completa y estadísticas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ) : couponDetail ? (
          <div className="space-y-6">
            {/* Información principal del cupón */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-lg bg-white flex items-center justify-center text-2xl shadow-sm">
                    {couponDetail.coupon.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {couponDetail.coupon.title}
                    </h2>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(couponDetail.coupon.category)}`}>
                      {getCategoryLabel(couponDetail.coupon.category)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      couponDetail.coupon.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {couponDetail.coupon.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{couponDetail.coupon.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span><strong>Código:</strong> {couponDetail.coupon.code}</span>
                    <span><strong>Beneficio:</strong> {formatBenefit(couponDetail.coupon)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas de uso */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Registros</p>
                    <p className="text-2xl font-bold text-gray-900">{couponDetail.stats.totalRecords}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Usados</p>
                    <p className="text-2xl font-bold text-gray-900">{couponDetail.stats.used}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Disponibles</p>
                    <p className="text-2xl font-bold text-gray-900">{couponDetail.stats.available}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Expirados</p>
                    <p className="text-2xl font-bold text-gray-900">{couponDetail.stats.expired}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usos máximos por ciclo:</span>
                    <span className="font-medium">{couponDetail.coupon.maxUsesPerCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orden de visualización:</span>
                    <span className="font-medium">{couponDetail.coupon.displayOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requiere Premium:</span>
                    <span className="font-medium">
                      {couponDetail.coupon.requiresPremium ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creado por:</span>
                    <span className="font-medium">{couponDetail.coupon.createdBy.displayName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 block">Válido desde:</span>
                    <span className="font-medium">
                      {new Date(couponDetail.coupon.validFrom).toLocaleString('es-PE')}
                    </span>
                  </div>
                  {couponDetail.coupon.validUntil && (
                    <div>
                      <span className="text-gray-600 block">Válido hasta:</span>
                      <span className="font-medium">
                        {new Date(couponDetail.coupon.validUntil).toLocaleString('es-PE')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 block">Creado:</span>
                    <span className="font-medium">
                      {new Date(couponDetail.coupon.createdAt).toLocaleString('es-PE')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Última actualización:</span>
                    <span className="font-medium">
                      {new Date(couponDetail.coupon.updatedAt).toLocaleString('es-PE')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usos recientes */}
            {couponDetail.recentUsages && couponDetail.recentUsages.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usos Recientes</h3>
                <div className="space-y-3">
                  {couponDetail.recentUsages.map((usage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{usage.user.displayName}</p>
                          <p className="text-sm text-gray-500">{usage.user.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Ciclo #{usage.cycleNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(usage.usedAt).toLocaleString('es-PE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No se pudieron cargar los detalles del cupón</p>
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailsModal;

