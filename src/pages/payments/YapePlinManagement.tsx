import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, DollarSign, RefreshCw, Search, Filter } from 'lucide-react';
import { useYapePlinPayments, useVerifyPayment, usePaymentConfig, useUpdatePaymentConfig } from '../../hooks/usePayments';

// Types mínimos usados en acciones locales
interface UIPaymentRef { id: string }

type StatusFilter = 'all' | 'pending' | 'completed' | 'failed' | 'cancelled';
type MethodFilter = 'all' | 'yape' | 'plin';

const YapePlinManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');

  const { data: payments = [], isLoading, error, refetch } = useYapePlinPayments({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    paymentMethod: methodFilter !== 'all' ? methodFilter : undefined
  });

  const verifyPayment = useVerifyPayment();
  const { data: config } = usePaymentConfig();
  const updateConfig = useUpdatePaymentConfig();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as StatusFilter);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setMethodFilter(e.target.value as MethodFilter);
  };

  const handleRefresh = (): void => {
    refetch();
  };

  const handleVerifyPayment = async (payment: UIPaymentRef): Promise<void> => {
    try {
      await verifyPayment.mutateAsync({ paymentId: payment.id });
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const formatAmount = (amount: number, currency: string): string => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'yape':
        return 'bg-purple-100 text-purple-700';
      case 'plin':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Calcular estadísticas
  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar pagos</h3>
          <p className="text-gray-500 mb-4">No se pudieron cargar los pagos</p>
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Intentar de nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💳 Pagos Yape/Plin</h1>
          <p className="text-gray-600 mt-2">
            Gestiona pagos y transacciones móviles
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center space-x-2 mt-4 sm:mt-0"
          disabled={isLoading}
          type="button"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pagos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fallidos</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                S/ {stats.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar pagos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input-field pl-10 w-full"
            />
          </div>
          
          <select
            value={methodFilter}
            onChange={handleMethodChange}
            className="input-field w-auto"
          >
            <option value="all">Todos los métodos</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="input-field w-auto"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completados</option>
            <option value="failed">Fallidos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Transacciones ({payments.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando transacciones...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay transacciones
            </h3>
            <p className="text-gray-500">
              Las transacciones de Yape/Plin aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(payment.method)}`}>
                        {payment.method.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>Usuario: {payment.user?.name || 'N/A'}</span>
                      <span>Ref: {payment.reference}</span>
                      <span>Creado: {formatDate(payment.createdAt)}</span>
                      {payment.completedAt && (
                        <span>Completado: {formatDate(payment.completedAt)}</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">{payment.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleVerifyPayment(payment)}
                        className="btn-primary text-sm"
                        type="button"
                      >
                        Verificar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YapePlinManagement;
