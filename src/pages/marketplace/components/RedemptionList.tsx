import React from 'react';
import { Gift, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Redemption {
  id: string;
  userId: string;
  productId: string;
  product: {
    name?: string;
    _id?: string;
  };
  user: {
    id: string;
    name: string;
    phone: string;
  };
  code: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  pointsUsed: number;
  redeemedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
}

interface RedemptionListProps {
  redemptions: Redemption[];
  isLoading: boolean;
  onConfirm: (code: string) => void;
  onMarkDelivered: (code: string) => void;
}

const RedemptionList: React.FC<RedemptionListProps> = ({
  redemptions,
  isLoading,
  onConfirm,
  onMarkDelivered,
}) => {
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Gift className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando canjes...</p>
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay canjes</h3>
        <p className="text-gray-500">Los canjes aparecerán aquí cuando los usuarios canjeen productos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {redemptions.map((redemption) => (
        <div
          key={redemption.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-medium text-gray-900">
                  {redemption.product?.name || 'Producto eliminado'}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    redemption.status
                  )}`}
                >
                  {getStatusIcon(redemption.status)}
                  <span className="ml-1">{redemption.status}</span>
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Usuario: {redemption.user?.name || 'N/A'}</span>
                <span>Código: {redemption.code}</span>
                <span>Puntos: {redemption.pointsUsed}</span>
                <span>Fecha: {formatDate(redemption.redeemedAt)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {redemption.status === 'pending' && (
                <button
                  onClick={() => onConfirm(redemption.code)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  type="button"
                >
                  Confirmar
                </button>
              )}

              {redemption.status === 'confirmed' && (
                <button
                  onClick={() => onMarkDelivered(redemption.code)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  type="button"
                >
                  Marcar Entregado
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RedemptionList;

