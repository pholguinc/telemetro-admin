import React, { useState, useMemo, useCallback, Fragment } from 'react';
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  X,
  Eye,
  Calendar,
  Crown,
  XCircle,
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import {
  useSubscriptions,
  useSubscriptionStats,
  useSubscriptionRevenue,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from '../../hooks/useSubscriptions';
import { buildImageUrl } from '../../config/environment';
import UserSearchDropdown from '../../components/ui/UserSearchDropdown';
import { StreamersService } from '../../services';

// Types
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface Subscription {
  id: string;
  user: User;
  type: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  autoRenew: boolean;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SelectedUser {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface SubscriptionDraft {
  userId: string;
  selectedUser: SelectedUser | null;
  type: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  paymentMethod: 'card' | 'yape' | 'plin' | 'bank_transfer' | 'points';
  autoRenew: boolean;
  transactionId: string;
}

interface SubscriptionStatsLocal {
  total: number;
  active: number;
  cancelled: number;
  expired: number;
  pending: number;
  revenue?: number;
}

type StatusFilter = 'all' | 'active' | 'cancelled' | 'expired' | 'pending';
type TypeFilter = 'all' | 'MetroPremium';

// Constantes para opciones
const SUBSCRIPTION_TYPES = [
  { value: 'MetroPremium', label: 'Metro Premium' },
];

const TYPES = [
  { value: 'all', label: 'Todos los tipos' },
  ...SUBSCRIPTION_TYPES,
];

const STATUSES = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'expired', label: 'Expiradas' },
  { value: 'cancelled', label: 'Canceladas' },
];

const FORM_STATUSES = STATUSES.filter(s => s.value !== 'all');

const CURRENCIES = [
  { value: 'PEN', label: 'Soles (PEN)' },
  { value: 'USD', label: 'Dólares (USD)' },
];

const PAYMENT_METHODS = [
  { value: 'card', label: 'Tarjeta' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'points', label: 'Puntos' },
];

// Custom hook para lógica del formulario
const useSubscriptionForm = (
  initialDraft: SubscriptionDraft,
  editing: Subscription | null,
  onReset: () => void
) => {
  const [draft, setDraft] = useState<SubscriptionDraft>(initialDraft);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setDraft((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? checked
            : type === 'number'
            ? parseFloat(value) || 0
            : value,
      }));
    },
    []
  );

  const handleUserSelect = useCallback(
    (user: SelectedUser | null) => {
      setDraft((prev) => ({
        ...prev,
        selectedUser: user,
        userId: user ? user.id : '',
      }));
    },
    []
  );

  const resetForm = () => {
    setDraft(initialDraft);
    setFormSubmitted(false);
    onReset();
  };

  return {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleUserSelect,
    resetForm,
  };
};

// Subcomponente para Stats
const SubscriptionStatsComponent: React.FC<{ stats: any; revenue: any }> = ({ stats, revenue }) => {
  if (!stats) return null;

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount || 0);
  };

  // Validaciones defensivas para evitar errores
  const safeStats = {
    total: stats.total || 0,
    active: stats.active || 0,
    cancelled: stats.cancelled || 0,
    expired: stats.expired || 0,
    pending: stats.pending || 0,
    revenue: revenue?.total || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Suscripciones</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {safeStats.total}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Activas</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {safeStats.active}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {formatCurrency(safeStats.revenue)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tasa de Renovación</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {safeStats.active > 0 ? Math.round((safeStats.active / safeStats.total) * 100) : 0}%
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para Filtros
const SubscriptionFilters: React.FC<{
  search: string;
  status: StatusFilter;
  type: TypeFilter;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({
  search,
  status,
  type,
  onSearchChange,
  onStatusChange,
  onTypeChange,
}) => (
  <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <input
        type="text"
        placeholder="Buscar suscripciones..."
        value={search}
        onChange={onSearchChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        aria-label="Buscar suscripciones por usuario o ID"
      />
      <select
        value={status}
        onChange={onStatusChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por estado"
      >
        {STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={type}
        onChange={onTypeChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por tipo"
      >
        {TYPES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubscriptionsManagement: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  const initialDraft: SubscriptionDraft = {
    userId: '',
    selectedUser: null,
    type: 'MetroPremium',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
    price: 29.99,
    currency: 'PEN',
    paymentMethod: 'card',
    autoRenew: true,
    transactionId: '',
  };

  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleUserSelect,
    resetForm,
  } = useSubscriptionForm(initialDraft, editing, () => setEditing(null));

  const {
    data: subscriptionsResponse,
    isLoading,
    refetch,
  } = useSubscriptions({
    search,
    status: status !== 'all' ? status : undefined,
    limit: 50,
  });

  const subscriptions: Subscription[] = subscriptionsResponse?.subscriptions || [];
  const { data: stats } = useSubscriptionStats();
  const { data: revenue } = useSubscriptionRevenue();
  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();
  const createSubscription = useCreateSubscription();

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription: Subscription) => {
      const matchesSearch =
        search === '' ||
        subscription.user.name.toLowerCase().includes(search.toLowerCase()) ||
        subscription.user.username.toLowerCase().includes(search.toLowerCase()) ||
        subscription.user.email.toLowerCase().includes(search.toLowerCase()) ||
        (subscription.transactionId && 
         subscription.transactionId.toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus = status === 'all' || subscription.status === status;
      const matchesType = type === 'all' || subscription.type === type;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [subscriptions, search, status, type]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setStatus(e.target.value as StatusFilter),
    []
  );
  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setType(e.target.value as TypeFilter),
    []
  );

  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Convertir a formato date (YYYY-MM-DD)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      const cleanedData = {
        userId: draft.userId.trim(),
        type: draft.type,
        status: draft.status,
        startDate: draft.startDate,
        endDate: draft.endDate,
        price: draft.price,
        currency: draft.currency,
        paymentMethod: draft.paymentMethod,
        autoRenew: draft.autoRenew,
        transactionId: draft.transactionId.trim(),
      };

      if (editing) {
        await updateSubscription.mutateAsync({
          subscriptionId: editing.id,
          subscriptionData: cleanedData,
        });
        toast.success('Suscripción actualizada con éxito');
        setEditing(null);
      } else {
        await createSubscription.mutateAsync(cleanedData);
        toast.success('Suscripción creada con éxito');
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error('Error al guardar la suscripción');
    } finally {
      setFormSubmitted(false);
    }
  };

  const handleEdit = (subscription: Subscription): void => {
    setEditing(subscription);
    
    // Para edición, creamos un usuario seleccionado basado en los datos de la suscripción
    const selectedUser: SelectedUser = {
      id: subscription.user.id,
      displayName: subscription.user.name,
      username: subscription.user.username,
      email: subscription.user.email,
      avatar: '',
      createdAt: subscription.createdAt || '',
    };

    setDraft({
      userId: subscription.user.id,
      selectedUser: selectedUser,
      type: subscription.type,
      status: subscription.status,
      startDate: formatDateForInput(subscription.startDate),
      endDate: formatDateForInput(subscription.endDate),
      price: subscription.price,
      currency: subscription.currency,
      paymentMethod: (subscription as any).paymentMethod || 'card',
      autoRenew: subscription.autoRenew,
      transactionId: subscription.transactionId || '',
    });

    setIsFormModalOpen(true);
  };

  const handleRefresh = () => refetch();

  const handleCreateNew = () => {
    setEditing(null);
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditing(null);
    resetForm();
  };

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);

  const handleCancel = (subscription: Subscription): void => {
    setSubscriptionToCancel(subscription);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (subscriptionToCancel) {
      try {
        await cancelSubscription.mutateAsync(subscriptionToCancel.id);
        toast.success('Suscripción cancelada con éxito');
        refetch();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Error al cancelar la suscripción');
      }
    }
    setIsCancelModalOpen(false);
    setSubscriptionToCancel(null);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'PEN'): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-100 text-gray-700',
      premium: 'bg-purple-100 text-purple-700',
      pro: 'bg-blue-100 text-blue-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const error = false; // Placeholder para error handling

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar suscripciones
          </h3>
          <p className="text-gray-500 mb-4">No se pudieron cargar las suscripciones</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            💳 Gestión de Suscripciones
          </h1>
          <p className="text-gray-600 mt-2">
            Administra suscripciones y planes premium
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isLoading}
          type="button"
          aria-label="Actualizar lista de suscripciones"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats */}
      <SubscriptionStatsComponent stats={stats} revenue={revenue} />

      {/* Filtros */}
      <SubscriptionFilters
        search={search}
        status={status}
        type={type}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onTypeChange={handleTypeChange}
      />

      {/* Lista de Suscripciones */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Suscripciones ({filteredSubscriptions.length})
          </h2>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Suscripción</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando suscripciones...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron suscripciones
            </h3>
            <p className="text-gray-500">
              {subscriptions.length === 0
                ? 'Crea tu primera suscripción'
                : 'Intenta cambiar los filtros'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription: Subscription, index: number) => (
              <div
                key={`subscription-${subscription.id || index}`}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Header de la card */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {subscription.user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          @{subscription.user.username}
                        </p>
                      </div>
                    </div>
                    
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        subscription.status
                      )}`}
                    >
                      {STATUSES.find(s => s.value === subscription.status)?.label || subscription.status}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  {/* Tipo y precio */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                        subscription.type
                      )}`}
                    >
                      {SUBSCRIPTION_TYPES.find(t => t.value === subscription.type)?.label || subscription.type}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(subscription.price, subscription.currency)}
                    </span>
                  </div>

                  {/* Información de fechas */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Inicio:</span>
                      <span>{formatDate(subscription.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fin:</span>
                      <span>{formatDate(subscription.endDate)}</span>
                    </div>
                    {subscription.transactionId && (
                      <div className="flex items-center justify-between">
                        <span>ID Transacción:</span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {subscription.transactionId.slice(-8)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Auto-renovación */}
                  {subscription.autoRenew && (
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Auto-renovación activa</span>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleCancel(subscription)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar"
                          type="button"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      <SubscriptionFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        draft={draft}
        setDraft={setDraft}
        editing={editing}
        formSubmitted={formSubmitted}
        setFormSubmitted={setFormSubmitted}
        handleInputChange={handleInputChange}
        handleUserSelect={handleUserSelect}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        isPending={createSubscription.isPending || updateSubscription.isPending}
      />

      {/* Modal de Cancelación */}
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancel}
        subscription={subscriptionToCancel}
      />
    </div>
  );
};

// Modal de Confirmación de Cancelación
const CancelConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscription: Subscription | null;
}> = ({ isOpen, onClose, onConfirm, subscription }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Cancelar Suscripción
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres cancelar la suscripción de &quot;
                  {subscription?.user.name}&quot;? Esta acción no se puede deshacer y el usuario perderá acceso a los beneficios premium.
                </p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={onConfirm}
                >
                  Cancelar Suscripción
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// Modal de Formulario para Suscripciones
const SubscriptionFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  draft: SubscriptionDraft;
  setDraft: React.Dispatch<React.SetStateAction<SubscriptionDraft>>;
  editing: Subscription | null;
  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleUserSelect: (user: SelectedUser | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  isPending: boolean;
}> = ({
  isOpen,
  onClose,
  draft,
  setDraft,
  editing,
  formSubmitted,
  setFormSubmitted,
  handleInputChange,
  handleUserSelect,
  handleSubmit,
  resetForm,
  isPending,
}) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !draft.userId ||
      !draft.type ||
      !draft.startDate ||
      !draft.endDate ||
      draft.price <= 0 ||
      (!editing && !draft.selectedUser)
    ) {
      setFormSubmitted(true);
      toast.error('Por favor, completa todos los campos requeridos.');
      return;
    }
    await handleSubmit(e);
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  {/* Header del Modal */}
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {editing ? 'Editar Suscripción' : 'Crear Nueva Suscripción'}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Cerrar modal"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-6">
                    {/* Selección de Usuario - Solo para crear nuevas suscripciones */}
                    {!editing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar Usuario *
                        </label>
                        <UserSearchDropdown
                          selectedUser={draft.selectedUser}
                          onUserSelect={handleUserSelect}
                          placeholder="Buscar usuario por nombre, username o email..."
                          error={!draft.selectedUser && formSubmitted}
                        />
                        {!draft.selectedUser && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Debes seleccionar un usuario</p>
                        )}
                      </div>
                    )}

                    {/* Información del Usuario - Solo mostrar cuando hay usuario seleccionado o editando */}
                    {(draft.selectedUser || editing) && (
                      <>
                        {editing && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Usuario
                            </label>
                            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {draft.selectedUser?.displayName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {draft.selectedUser?.displayName || 'Usuario'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    @{draft.selectedUser?.username || 'username'} • {draft.selectedUser?.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label
                              htmlFor="type"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Tipo de Suscripción *
                            </label>
                            <select
                              id="type"
                              name="type"
                              value={draft.type}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {SUBSCRIPTION_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="status"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Estado *
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={draft.status}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {FORM_STATUSES.map(({ value, label }) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label
                              htmlFor="startDate"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Fecha de Inicio *
                            </label>
                            <input
                              type="date"
                              id="startDate"
                              name="startDate"
                              value={draft.startDate}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2 border ${
                                !draft.startDate && formSubmitted
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              required
                            />
                            {!draft.startDate && formSubmitted && (
                              <p className="text-red-500 text-sm mt-1">Requerido</p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="endDate"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Fecha de Finalización *
                            </label>
                            <input
                              type="date"
                              id="endDate"
                              name="endDate"
                              value={draft.endDate}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2 border ${
                                !draft.endDate && formSubmitted
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              required
                            />
                            {!draft.endDate && formSubmitted && (
                              <p className="text-red-500 text-sm mt-1">Requerido</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label
                              htmlFor="price"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Precio *
                            </label>
                            <input
                              type="number"
                              id="price"
                              name="price"
                              value={draft.price}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2 border ${
                                draft.price <= 0 && formSubmitted
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              min="0"
                              step="0.01"
                              required
                            />
                            {draft.price <= 0 && formSubmitted && (
                              <p className="text-red-500 text-sm mt-1">Debe ser mayor a 0</p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="currency"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Moneda *
                            </label>
                            <select
                              id="currency"
                              name="currency"
                              value={draft.currency}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {CURRENCIES.map(({ value, label }) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="paymentMethod"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Método de Pago *
                            </label>
                            <select
                              id="paymentMethod"
                              name="paymentMethod"
                              value={draft.paymentMethod}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {PAYMENT_METHODS.map(({ value, label }) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="transactionId"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            ID de Transacción
                          </label>
                          <input
                            type="text"
                            id="transactionId"
                            name="transactionId"
                            value={draft.transactionId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ID de la transacción de pago"
                          />
                        </div>

                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="autoRenew"
                              checked={draft.autoRenew}
                              onChange={handleInputChange}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Auto-renovación activada
                            </span>
                          </label>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end space-x-4">
                      {editing && (
                        <button
                          type="button"
                          onClick={handleClose}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Plus className="h-5 w-5" />
                        )}
                        <span>
                          {isPending
                            ? 'Guardando...'
                            : editing
                            ? 'Actualizar'
                            : 'Crear Suscripción'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SubscriptionsManagement;
