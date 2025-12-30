import React from 'react';
import { TrendingUp, Users, Ticket, Award } from 'lucide-react';
import type { MetroYaCouponGlobalStats } from '../../../models/metro-ya-coupon';

interface CouponStatsProps {
  stats: MetroYaCouponGlobalStats | undefined;
  isLoading: boolean;
}

const CouponStats: React.FC<CouponStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats || !stats.stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  const { stats: statsData, topCoupons } = stats;

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cupones</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.totalCoupons}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {statsData.activeCoupons} activos
            </span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-600">
              {statsData.inactiveCoupons} inactivos
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.totalUsages}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {statsData.uniqueUsers} usuarios únicos
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cupones Activos</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.activeCoupons}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {((statsData.activeCoupons / statsData.totalCoupons) * 100).toFixed(1)}% del total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Únicos</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.uniqueUsers}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              Promedio: {(statsData.totalUsages / Math.max(statsData.uniqueUsers, 1)).toFixed(1)} usos/usuario
            </span>
          </div>
        </div>
      </div>

      {/* Top cupones más usados */}
      {topCoupons && topCoupons.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cupones Más Usados</h3>
          <div className="space-y-3">
            {topCoupons.map((item, index) => (
              <div key={item.coupon.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{item.coupon.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.coupon.title}</p>
                    <p className="text-sm text-gray-600">Código: {item.coupon.code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-lg font-bold text-purple-600">{item.totalUses}</span>
                  <span className="text-sm text-gray-500">usos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponStats;
