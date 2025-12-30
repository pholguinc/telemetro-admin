import React, { useState, useMemo, useCallback } from "react";
import { Plus, RefreshCw, Settings, Gift } from "lucide-react";
import {
  usePremiumStats,
  usePremiumSubscriptions,
  usePaymentConfig,
  useApprovePayment,
  useRejectPayment,
  useActivatePremium,
  useUpdatePaymentConfig,
  useActivatePremiumForm,
  useRejectPaymentForm,
  usePaymentConfigForm,
} from "../../hooks/usePremium";
import type { PremiumSubscription } from "../../models/premium";
import PremiumStats from "./components/PremiumStats";
import SubscriptionFilters from "./components/SubscriptionFilters";
import SubscriptionList from "./components/SubscriptionList";
import ActivatePremiumModal from "./components/ActivatePremiumModal";
import RejectPaymentModal from "./components/RejectPaymentModal";
import PaymentConfigModal from "./components/PaymentConfigModal";
import ProofViewModal from "./components/ProofViewModal";

// Types
type StatusFilter =
  | "all"
  | "active"
  | "pending_payment"
  | "cancelled"
  | "expired";
type PlanFilter = "all" | "monthly" | "quarterly" | "yearly";

const PremiumManagement: React.FC = () => {
  // ============ ESTADOS ============
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");

  // Estados de modales
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPaymentConfigModalOpen, setIsPaymentConfigModalOpen] =
    useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // Estados de selección
  const [subscriptionToReject, setSubscriptionToReject] =
    useState<PremiumSubscription | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  // ============ CUSTOM HOOKS ============
  const {
    formData: activateFormData,
    formSubmitted, // ← AGREGAR
    handleInputChange: handleActivateInputChange,
    handleUserSelect, // ← AGREGAR
    resetForm: resetActivateForm,
    setFormSubmitted: setActivateFormSubmitted,
  } = useActivatePremiumForm();

  const {
    formData: rejectFormData,
    handleInputChange: handleRejectInputChange,
    setFormData: setRejectFormData,
    resetForm: resetRejectForm,
  } = useRejectPaymentForm();

  // ============ QUERIES ============
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = usePremiumStats();
  const {
    data: subscriptions = [],
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = usePremiumSubscriptions();
  const { data: paymentConfig } = usePaymentConfig();

  // Payment config form
  const {
    formData: paymentConfigFormData,
    handleInputChange: handlePaymentConfigChange,
    resetForm: resetPaymentConfigForm,
    setFormData: setPaymentConfigFormData,
    setFormSubmitted: setPaymentConfigFormSubmitted,
  } = usePaymentConfigForm(paymentConfig);

  // Actualizar formData cuando se carga la config
  React.useEffect(() => {
    if (paymentConfig) {
      setPaymentConfigFormData(paymentConfig);
    }
  }, [paymentConfig, setPaymentConfigFormData]);

  // ============ MUTATIONS ============
  const approveMutation = useApprovePayment();
  const rejectMutation = useRejectPayment();
  const activateMutation = useActivatePremium();
  const updateConfigMutation = useUpdatePaymentConfig();

  // ============ FILTROS ============
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      // Filtro de búsqueda
      if (search) {
        const searchLower = search.toLowerCase();
        const userName =
          typeof subscription.userId === "string" || subscription.userId == null
            ? ""
            : (subscription.userId.displayName || "").toLowerCase();
        const userPhone =
          typeof subscription.userId === "string" || subscription.userId == null
            ? ""
            : (subscription.userId.phone || "").toLowerCase();
        if (
          !userName.includes(searchLower) &&
          !userPhone.includes(searchLower)
        ) {
          return false;
        }
      }

      // Filtro de estado
      if (statusFilter !== "all" && subscription.status !== statusFilter) {
        return false;
      }

      // Filtro de plan
      if (planFilter !== "all" && subscription.plan !== planFilter) {
        return false;
      }

      return true;
    });
  }, [subscriptions, search, statusFilter, planFilter]);

  // ============ HANDLERS ============
  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchSubscriptions();
  }, [refetchStats, refetchSubscriptions]);

  const handleApprove = useCallback(
    async (subscription: PremiumSubscription) => {
      let displayName = "este usuario";
      if (
        typeof subscription.userId !== "string" &&
        subscription.userId &&
        subscription.userId.displayName
      ) {
        displayName = subscription.userId.displayName;
      }
      if (confirm(`¿Aprobar el pago de ${displayName}?`)) {
        await approveMutation.mutateAsync(subscription._id);
      }
    },
    [approveMutation]
  );

  const handleReject = useCallback(
    (subscription: PremiumSubscription) => {
      setSubscriptionToReject(subscription);
      setRejectFormData({ reason: "" });
      setIsRejectModalOpen(true);
    },
    [setRejectFormData]
  );

  const handleConfirmReject = useCallback(async () => {
    if (!subscriptionToReject) return;

    await rejectMutation.mutateAsync({
      subscriptionId: subscriptionToReject._id,
      reason: rejectFormData.reason,
    });

    setIsRejectModalOpen(false);
    setSubscriptionToReject(null);
    resetRejectForm();
  }, [
    subscriptionToReject,
    rejectFormData.reason,
    rejectMutation,
    resetRejectForm,
  ]);

  const handleViewProof = useCallback((url: string) => {
    setProofUrl(url);
    setIsProofModalOpen(true);
  }, []);

  const handleActivateSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setActivateFormSubmitted(true);

      if (!activateFormData.selectedUser) return;

      await activateMutation.mutateAsync({
        userId: activateFormData.selectedUser.id,
        data: {
          plan: activateFormData.plan,
          duration: activateFormData.duration,
        },
      });

      setIsActivateModalOpen(false);
      resetActivateForm();
    },
    [
      activateFormData,
      activateMutation,
      resetActivateForm,
      setActivateFormSubmitted,
    ]
  );

  const handlePaymentConfigSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPaymentConfigFormSubmitted(true);

      await updateConfigMutation.mutateAsync(paymentConfigFormData);

      setIsPaymentConfigModalOpen(false);
      resetPaymentConfigForm();
    },
    [
      paymentConfigFormData,
      updateConfigMutation,
      resetPaymentConfigForm,
      setPaymentConfigFormSubmitted,
    ]
  );

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metro Premium</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra suscripciones, pagos y beneficios premium
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPaymentConfigModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Config. Pagos
          </button>
          <button
            onClick={() => setIsActivateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Gift className="w-4 h-4" />
            Activar Premium
          </button>
          <button
            onClick={handleRefresh}
            disabled={statsLoading || subscriptionsLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                statsLoading || subscriptionsLoading ? "animate-spin" : ""
              }`}
            />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <PremiumStats stats={stats} isLoading={statsLoading} />

      {/* Filtros */}
      <SubscriptionFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        planFilter={planFilter}
        setPlanFilter={setPlanFilter}
      />

      {/* Lista de suscripciones */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Suscripciones ({filteredSubscriptions.length})
          </h2>
        </div>
        <SubscriptionList
          subscriptions={filteredSubscriptions}
          isLoading={subscriptionsLoading}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewProof={handleViewProof}
        />
      </div>

      {/* Modales */}
      <ActivatePremiumModal
        isOpen={isActivateModalOpen}
        onClose={() => {
          setIsActivateModalOpen(false);
          resetActivateForm();
        }}
        onSubmit={handleActivateSubmit}
        formData={activateFormData}
        handleInputChange={handleActivateInputChange}
        handleUserSelect={handleUserSelect}
        formSubmitted={formSubmitted}
        isSubmitting={activateMutation.isPending}
      />

      <RejectPaymentModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSubscriptionToReject(null);
          resetRejectForm();
        }}
        onConfirm={handleConfirmReject}
        subscription={subscriptionToReject}
        reason={rejectFormData.reason}
        setReason={(reason) => setRejectFormData({ reason })}
        isSubmitting={rejectMutation.isPending}
      />

      <PaymentConfigModal
        isOpen={isPaymentConfigModalOpen}
        onClose={() => {
          setIsPaymentConfigModalOpen(false);
          resetPaymentConfigForm();
        }}
        onSubmit={handlePaymentConfigSubmit}
        formData={paymentConfigFormData}
        handleInputChange={handlePaymentConfigChange}
        isSubmitting={updateConfigMutation.isPending}
      />

      <ProofViewModal
        isOpen={isProofModalOpen}
        onClose={() => {
          setIsProofModalOpen(false);
          setProofUrl(null);
        }}
        proofUrl={proofUrl}
      />
    </div>
  );
};

export default PremiumManagement;
