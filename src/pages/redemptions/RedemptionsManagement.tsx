import React, { useState, useMemo, useCallback } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import {
  useRedemptionStats,
  useRedemptions,
  useConfirmRedemption,
  useDeliverRedemption,
  useExportRedemptions,
  useConfirmRedemptionForm,
  useDeliverRedemptionForm,
} from '../../hooks/useRedemptionsAdmin';
import type { Redemption } from '../../models/redemptions';
import RedemptionStats from './components/RedemptionStats';
import RedemptionFilters from './components/RedemptionFilters';
import RedemptionList from './components/RedemptionList';
import ConfirmRedemptionModal from './components/ConfirmRedemptionModal';
import DeliverRedemptionModal from './components/DeliverRedemptionModal';

// Types
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled';

const RedemptionsManagement: React.FC = () => {
  // ============ ESTADOS ============
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stationCode, setStationCode] = useState<string>('');

  // Estados de modales
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);

  // Estados de selección
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);

  // ============ CUSTOM HOOKS ============
  const { 
    formData: confirmFormData, 
    handleInputChange: handleConfirmInputChange, 
    resetForm: resetConfirmForm,
    setFormSubmitted: setConfirmFormSubmitted 
  } = useConfirmRedemptionForm();

  const { 
    formData: deliverFormData, 
    handleInputChange: handleDeliverInputChange, 
    resetForm: resetDeliverForm,
    setFormSubmitted: setDeliverFormSubmitted 
  } = useDeliverRedemptionForm();

  // ============ QUERIES ============
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useRedemptionStats(stationCode || undefined);
  
  const filters = useMemo(() => ({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
    stationCode: stationCode || undefined,
  }), [statusFilter, search, stationCode]);

  const { 
    data: redemptionsData, 
    isLoading: redemptionsLoading, 
    refetch: refetchRedemptions 
  } = useRedemptions(filters);

  // ============ MUTATIONS ============
  const confirmMutation = useConfirmRedemption();
  const deliverMutation = useDeliverRedemption();
  const exportMutation = useExportRedemptions();

  // ============ FILTROS ============
  const filteredRedemptions = useMemo(() => {
    if (!redemptionsData?.redemptions) return [];
    return redemptionsData.redemptions;
  }, [redemptionsData]);

  // ============ HANDLERS ============
  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchRedemptions();
  }, [refetchStats, refetchRedemptions]);

  const handleConfirm = useCallback((redemption: Redemption) => {
    setSelectedRedemption(redemption);
    setIsConfirmModalOpen(true);
  }, []);

  const handleDeliver = useCallback((redemption: Redemption) => {
    setSelectedRedemption(redemption);
    setIsDeliverModalOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRedemption) return;

    setConfirmFormSubmitted(true);

    const station = confirmFormData.stationName && confirmFormData.stationCode ? {
      name: confirmFormData.stationName,
      code: confirmFormData.stationCode,
      deviceId: confirmFormData.deviceId || undefined,
    } : undefined;

    await confirmMutation.mutateAsync({
      code: selectedRedemption.code,
      station,
    });

    setIsConfirmModalOpen(false);
    setSelectedRedemption(null);
    resetConfirmForm();
  }, [selectedRedemption, confirmFormData, confirmMutation, resetConfirmForm, setConfirmFormSubmitted]);

  const handleDeliverSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRedemption) return;

    setDeliverFormSubmitted(true);

    await deliverMutation.mutateAsync({
      code: selectedRedemption.code,
    });

    setIsDeliverModalOpen(false);
    setSelectedRedemption(null);
    resetDeliverForm();
  }, [selectedRedemption, deliverMutation, resetDeliverForm, setDeliverFormSubmitted]);

  const handleExport = useCallback(async () => {
    await exportMutation.mutateAsync({
      stationCode: stationCode || undefined,
    });
  }, [stationCode, exportMutation]);

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Canjes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra todos los canjes y redempciones de productos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exportMutation.isPending ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={statsLoading || redemptionsLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(statsLoading || redemptionsLoading) ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <RedemptionStats stats={stats} isLoading={statsLoading} />

      {/* Filtros */}
      <RedemptionFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        stationCode={stationCode}
        setStationCode={setStationCode}
      />

      {/* Lista de canjes */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Canjes ({filteredRedemptions.length})
          </h2>
        </div>
        <RedemptionList
          redemptions={filteredRedemptions}
          isLoading={redemptionsLoading}
          onConfirm={handleConfirm}
          onDeliver={handleDeliver}
        />
      </div>

      {/* Modales */}
      <ConfirmRedemptionModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedRedemption(null);
          resetConfirmForm();
        }}
        onSubmit={handleConfirmSubmit}
        redemption={selectedRedemption}
        formData={confirmFormData}
        handleInputChange={handleConfirmInputChange}
        isSubmitting={confirmMutation.isPending}
      />

      <DeliverRedemptionModal
        isOpen={isDeliverModalOpen}
        onClose={() => {
          setIsDeliverModalOpen(false);
          setSelectedRedemption(null);
          resetDeliverForm();
        }}
        onSubmit={handleDeliverSubmit}
        redemption={selectedRedemption}
        formData={deliverFormData}
        handleInputChange={handleDeliverInputChange}
        isSubmitting={deliverMutation.isPending}
      />
    </div>
  );
};

export default RedemptionsManagement;
