import React from 'react';
import { CheckCircle, XCircle, Clock, Calendar, CreditCard, User, Phone, Mail, FileText, Eye } from 'lucide-react';
import type { PremiumSubscription } from '../../../models/premium';

interface SubscriptionListProps {
  subscriptions: PremiumSubscription[];
  isLoading: boolean;
  onApprove: (subscription: PremiumSubscription) => void;
  onReject: (subscription: PremiumSubscription) => void;
  onViewProof: (proofUrl: string) => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  isLoading,
  onApprove,
  onReject,
  onViewProof,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay suscripciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron suscripciones con los filtros aplicados
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: 'Activa', color: 'bg-green-100 text-green-800' },
      pending_payment: { label: 'Pago Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status as keyof typeof badges] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const plans = {
      monthly: { label: 'Mensual', color: 'bg-blue-100 text-blue-800' },
      quarterly: { label: 'Trimestral', color: 'bg-purple-100 text-purple-800' },
      yearly: { label: 'Anual', color: 'bg-indigo-100 text-indigo-800' },
    };
    const planInfo = plans[plan as keyof typeof plans] || { label: plan, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo.color}`}>
        {planInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUserInfo = (subscription: PremiumSubscription) => {
    if (!subscription.userId || typeof subscription.userId === 'string') {
      return { displayName: 'Usuario', phone: '-', email: '-' };
    }
    return {
      displayName: subscription.userId.displayName || 'Usuario',
      phone: subscription.userId.phone || '-',
      email: subscription.userId.email || '-',
    };
  };

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
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comprobante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => {
              const userInfo = getUserInfo(subscription);
              return (
                <tr key={subscription._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-purple-100">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userInfo.displayName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {userInfo.phone}
                        </div>
                        {userInfo.email !== '-' && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {userInfo.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPlanBadge(subscription.plan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscription.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.price > 0 ? `S/ ${subscription.price.toFixed(2)}` : 'Gratis'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {subscription.paymentMethod === 'admin' ? 'Manual' : subscription.paymentMethod.toUpperCase()}
                    </div>
                    {subscription.paymentReference && (
                      <div className="text-xs text-gray-500">{subscription.paymentReference}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subscription.paymentProof ? (
                      <button
                        onClick={() => onViewProof(subscription.paymentProof!)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Comprobante
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin comprobante</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(subscription.startDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Hasta: {formatDate(subscription.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {subscription.status === 'pending_payment' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onApprove(subscription)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => onReject(subscription)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                    {subscription.status === 'active' && (
                      <span className="text-green-600">✓ Activa</span>
                    )}
                    {subscription.status === 'cancelled' && subscription.cancelReason && (
                      <div className="text-xs text-gray-500">
                        Motivo: {subscription.cancelReason}
                      </div>
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

export default SubscriptionList;

