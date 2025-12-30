import React, { useState, useMemo, useCallback } from 'react';
import { RefreshCw, Settings, DollarSign, Download, Plus, Users, Cog, Star } from 'lucide-react';
import {
  useMetroDiscountStats,
  useMetroDiscounts,
  useMetroPricing,
  useUseDiscount,
  useUpdatePricing,
  useExportDiscounts,
  useDiscountForm,
  usePricingForm,
  useCustomDiscountOptions,
  useUsers,
  useSystemDiscountOptions,
  useCreateDiscountOption,
  useUpdateDiscountOption,
  useDeleteDiscountOption,
  useToggleDiscountOption,
  useToggleUserPremium,
  useUpdateSystemDiscountOptions,
  useDiscountOptionForm,
  useSystemOptionsForm,
} from '../../hooks/useMetroDiscount';
import type { MetroDiscount, MetroDiscountOption, User } from '../../models/metro-discount';
import MetroDiscountStats from './components/MetroDiscountStats';
import DiscountFilters from './components/DiscountFilters';
import DiscountList from './components/DiscountList';
import UseDiscountModal from './components/UseDiscountModal';
import PricingConfigModal from './components/PricingConfigModal';
import CustomDiscountOptionsList from './components/CustomDiscountOptionsList';
import UsersList from './components/UsersList';
import SystemOptionsConfigModal from './components/SystemOptionsConfigModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import CustomDiscountOptionFormModal from './components/CustomDiscountOptionFormModal';

// Types
type StatusFilter = 'all' | 'used' | 'unused' | 'expired';
type TripTypeFilter = 'all' | 'single' | 'round_trip' | 'monthly_pass';
type Tab = 'discounts' | 'options' | 'users' | 'system';
type PremiumStatusFilter = 'all' | 'premium' | 'regular';

const MetroDiscountsManagement: React.FC = () => {
  // ============ ESTADOS ============
  const [activeTab, setActiveTab] = useState<Tab>('discounts');
  
  // Estados para descuentos
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tripTypeFilter, setTripTypeFilter] = useState<TripTypeFilter>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // Estados para opciones personalizadas
  const [optionsSearch, setOptionsSearch] = useState<string>('');
  const [optionsStatusFilter, setOptionsStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Estados para usuarios
  const [usersSearch, setUsersSearch] = useState<string>('');
  const [premiumStatusFilter, setPremiumStatusFilter] = useState<PremiumStatusFilter>('all');
  const [usersPage, setUsersPage] = useState(1);

  // Estados de modales
  const [isUseDiscountModalOpen, setIsUseDiscountModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isCustomOptionModalOpen, setIsCustomOptionModalOpen] = useState(false);
  const [isSystemOptionsModalOpen, setIsSystemOptionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estados de selección
  const [selectedDiscount, setSelectedDiscount] = useState<MetroDiscount | null>(null);
  const [selectedOption, setSelectedOption] = useState<MetroDiscountOption | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ name: string; type: string } | null>(null);

  // ============ CUSTOM HOOKS ============
  const { 
    formData: useDiscountFormData, 
    handleInputChange: handleUseDiscountInputChange, 
    resetForm: resetUseDiscountForm,
    setFormSubmitted: setUseDiscountFormSubmitted 
  } = useDiscountForm();

  // Form hooks para nuevas funcionalidades
  const { 
    formData: customOptionFormData, 
    handleInputChange: handleCustomOptionInputChange, 
    resetForm: resetCustomOptionForm,
    setFormSubmitted: setCustomOptionFormSubmitted,
    setFormData: setCustomOptionFormData
  } = useDiscountOptionForm();

  const { 
    formData: systemOptionsFormData, 
    handleInputChange: handleSystemOptionsInputChange, 
    resetForm: resetSystemOptionsForm,
    setFormSubmitted: setSystemOptionsFormSubmitted,
    setFormData: setSystemOptionsFormData
  } = useSystemOptionsForm();

  // ============ QUERIES ============
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useMetroDiscountStats();
  
  const filters = useMemo(() => ({
    page,
    limit,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  }), [page, limit, statusFilter, search]);

  const { 
    data: discountsData, 
    isLoading: discountsLoading, 
    refetch: refetchDiscounts 
  } = useMetroDiscounts(filters);

  const { data: pricingData } = useMetroPricing();

  // Nuevas queries
  const optionsFilters = useMemo(() => ({
    search: optionsSearch || undefined,
    status: optionsStatusFilter !== 'all' ? optionsStatusFilter : undefined,
  }), [optionsSearch, optionsStatusFilter]);

  const { 
    data: customOptionsData, 
    isLoading: customOptionsLoading, 
    refetch: refetchCustomOptions 
  } = useCustomDiscountOptions(optionsFilters);

  const usersFilters = useMemo(() => ({
    search: usersSearch || undefined,
    premiumStatus: premiumStatusFilter !== 'all' ? premiumStatusFilter : undefined,
    page: usersPage,
    limit: 20,
  }), [usersSearch, premiumStatusFilter, usersPage]);

  const { 
    data: usersData, 
    isLoading: usersLoading, 
    refetch: refetchUsers 
  } = useUsers(usersFilters);

  const { data: systemOptionsData } = useSystemDiscountOptions();

  // Pricing form
  const { 
    formData: pricingFormData, 
    handleInputChange: handlePricingChange, 
    resetForm: resetPricingForm,
    setFormSubmitted: setPricingFormSubmitted,
    setFormData: setPricingFormData
  } = usePricingForm(pricingData?.pricing);

  // Actualizar formData cuando se carga el pricing
  React.useEffect(() => {
    if (pricingData?.pricing) {
      setPricingFormData(pricingData.pricing);
    }
  }, [pricingData, setPricingFormData]);

  // ============ MUTATIONS ============
  const useDiscountMutation = useUseDiscount();
  const updatePricingMutation = useUpdatePricing();
  const exportMutation = useExportDiscounts();

  // Nuevas mutations
  const createOptionMutation = useCreateDiscountOption();
  const updateOptionMutation = useUpdateDiscountOption();
  const deleteOptionMutation = useDeleteDiscountOption();
  const toggleOptionMutation = useToggleDiscountOption();
  const toggleUserPremiumMutation = useToggleUserPremium();
  const updateSystemOptionsMutation = useUpdateSystemDiscountOptions();

  // ============ FILTROS ============
  const filteredDiscounts = useMemo(() => {
    if (!discountsData?.discounts) return [];
    
    return discountsData.discounts.filter((discount) => {
      // Filtro de tipo de viaje
      if (tripTypeFilter !== 'all' && discount.tripType !== tripTypeFilter) {
        return false;
      }

      return true;
    });
  }, [discountsData, tripTypeFilter]);

  // ============ HANDLERS ============
  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchDiscounts();
  }, [refetchStats, refetchDiscounts]);

  const handleUseDiscount = useCallback((discount: MetroDiscount) => {
    setSelectedDiscount(discount);
    setIsUseDiscountModalOpen(true);
  }, []);

  const handleUseDiscountSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscount) return;

    setUseDiscountFormSubmitted(true);

    await useDiscountMutation.mutateAsync({
      code: selectedDiscount.discountCode,
      data: {
        operatorId: useDiscountFormData.operatorId || undefined,
        stationUsed: useDiscountFormData.stationUsed || undefined,
      },
    });

    setIsUseDiscountModalOpen(false);
    setSelectedDiscount(null);
    resetUseDiscountForm();
  }, [selectedDiscount, useDiscountFormData, useDiscountMutation, resetUseDiscountForm, setUseDiscountFormSubmitted]);

  const handlePricingSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingFormSubmitted(true);

    await updatePricingMutation.mutateAsync(pricingFormData);

    setIsPricingModalOpen(false);
    resetPricingForm();
  }, [pricingFormData, updatePricingMutation, resetPricingForm, setPricingFormSubmitted]);

  const handleExport = useCallback(async () => {
    await exportMutation.mutateAsync({
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  }, [statusFilter, exportMutation]);

  // ========== NUEVOS HANDLERS ==========

  // Handlers para opciones personalizadas
  const handleCreateOption = useCallback(() => {
    setSelectedOption(null);
    resetCustomOptionForm();
    setIsCustomOptionModalOpen(true);
  }, [resetCustomOptionForm]);

  const handleEditOption = useCallback((option: MetroDiscountOption) => {
    setSelectedOption(option);
    setCustomOptionFormData({
      discountType: option.discountType,
      discountValue: option.discountValue,
      pointsRequired: option.pointsRequired,
      cantidad_disponible: option.cantidad_disponible,
      fecha_expiracion: option.fecha_expiracion,
      premiumOnly: option.premiumOnly,
      description: option.description,
      enabled: option.enabled,
    });
    setIsCustomOptionModalOpen(true);
  }, [setCustomOptionFormData]);

  const handleDeleteOption = useCallback((option: MetroDiscountOption) => {
    setDeleteItem({ name: option.discountType, type: 'opción de descuento' });
    setSelectedOption(option);
    setIsDeleteModalOpen(true);
  }, []);

  const handleToggleOption = useCallback((option: MetroDiscountOption) => {
    toggleOptionMutation.mutate(option._id);
  }, [toggleOptionMutation]);

  const handleCustomOptionSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomOptionFormSubmitted(true);

    if (selectedOption) {
      await updateOptionMutation.mutateAsync({
        id: selectedOption._id,
        data: customOptionFormData,
      });
    } else {
      await createOptionMutation.mutateAsync(customOptionFormData);
    }

    setIsCustomOptionModalOpen(false);
    setSelectedOption(null);
    resetCustomOptionForm();
  }, [selectedOption, customOptionFormData, updateOptionMutation, createOptionMutation, resetCustomOptionForm, setCustomOptionFormSubmitted]);

  // Handlers para usuarios
  const handleToggleUserPremium = useCallback((user: User) => {
    toggleUserPremiumMutation.mutate({
      userId: user._id,
      premium: !user.hasMetroPremium,
    });
  }, [toggleUserPremiumMutation]);

  // Handlers para opciones del sistema
  const handleSystemOptionsSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSystemOptionsFormSubmitted(true);

    await updateSystemOptionsMutation.mutateAsync(systemOptionsFormData);

    setIsSystemOptionsModalOpen(false);
    resetSystemOptionsForm();
  }, [systemOptionsFormData, updateSystemOptionsMutation, resetSystemOptionsForm, setSystemOptionsFormSubmitted]);

  // Handler para eliminar
  const handleDeleteConfirm = useCallback(async () => {
    if (selectedOption) {
      await deleteOptionMutation.mutateAsync(selectedOption._id);
    }
    setIsDeleteModalOpen(false);
    setDeleteItem(null);
    setSelectedOption(null);
  }, [selectedOption, deleteOptionMutation]);

  // Actualizar formData cuando se cargan las opciones del sistema
  React.useEffect(() => {
    if (systemOptionsData?.discountOptions) {
      setSystemOptionsFormData(systemOptionsData.discountOptions);
    }
  }, [systemOptionsData, setSystemOptionsFormData]);

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Descuentos Metro</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra descuentos, precios y configuraciones del sistema Metro
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'discounts' && (
            <>
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Config. Precios
              </button>
              <button
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exportMutation.isPending ? 'Exportando...' : 'Exportar CSV'}
              </button>
            </>
          )}
          {activeTab === 'options' && (
            <button
              onClick={handleCreateOption}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Opción
            </button>
          )}
          {activeTab === 'system' && (
            <button
              onClick={() => setIsSystemOptionsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
            >
              <Cog className="w-4 h-4" />
              Config. Sistema
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={statsLoading || discountsLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(statsLoading || discountsLoading) ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'discounts', label: 'Descuentos', icon: Download },
            { id: 'options', label: 'Opciones Personalizadas', icon: Plus },
            { id: 'users', label: 'Usuarios Premium', icon: Users },
            { id: 'system', label: 'Configuración Sistema', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Stats - Solo mostrar en tab de descuentos */}
      {activeTab === 'discounts' && (
        <MetroDiscountStats stats={stats} isLoading={statsLoading} />
      )}

      {/* Contenido por tab */}
      {activeTab === 'discounts' && (
        <>
          {/* Filtros */}
          <DiscountFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            tripTypeFilter={tripTypeFilter}
            setTripTypeFilter={setTripTypeFilter}
          />

          {/* Lista de descuentos */}
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Descuentos ({filteredDiscounts.length})
              </h2>
              {discountsData?.pagination && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {discountsData.pagination.page} de {discountsData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(discountsData.pagination.totalPages, p + 1))}
                    disabled={page >= discountsData.pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
            <DiscountList
              discounts={filteredDiscounts}
              isLoading={discountsLoading}
              onUseDiscount={handleUseDiscount}
            />
          </div>
        </>
      )}

      {activeTab === 'options' && (
        <>
          {/* Filtros para opciones */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  value={optionsSearch}
                  onChange={(e) => setOptionsSearch(e.target.value)}
                  placeholder="Buscar por tipo o descripción..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={optionsStatusFilter}
                  onChange={(e) => setOptionsStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de opciones personalizadas */}
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Opciones Personalizadas ({customOptionsData?.options?.length || 0})
              </h2>
            </div>
            <CustomDiscountOptionsList
              options={customOptionsData?.options || []}
              isLoading={customOptionsLoading}
              onEdit={handleEditOption}
              onDelete={handleDeleteOption}
              onToggle={handleToggleOption}
            />
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          {/* Filtros para usuarios */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Buscar por nombre o teléfono..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Premium
                </label>
                <select
                  value={premiumStatusFilter}
                  onChange={(e) => setPremiumStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos</option>
                  <option value="premium">Premium</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de usuarios */}
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Usuarios ({usersData?.users?.length || 0})
              </h2>
              {usersData?.pagination && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {usersData.pagination.page} de {usersData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setUsersPage(p => Math.min(usersData.pagination.totalPages, p + 1))}
                    disabled={usersPage >= usersData.pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
            <UsersList
              users={usersData?.users || []}
              isLoading={usersLoading}
              onTogglePremium={handleToggleUserPremium}
            />
          </div>
        </>
      )}

      {activeTab === 'system' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Configuración del Sistema
            </h3>
            <p className="text-gray-500 mb-4">
              Gestiona las opciones de descuento por defecto del sistema
            </p>
            <button
              onClick={() => setIsSystemOptionsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Cog className="w-4 h-4" />
              Configurar Opciones
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <UseDiscountModal
        isOpen={isUseDiscountModalOpen}
        onClose={() => {
          setIsUseDiscountModalOpen(false);
          setSelectedDiscount(null);
          resetUseDiscountForm();
        }}
        onSubmit={handleUseDiscountSubmit}
        discount={selectedDiscount}
        formData={useDiscountFormData}
        handleInputChange={handleUseDiscountInputChange}
        isSubmitting={useDiscountMutation.isPending}
      />

      <PricingConfigModal
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          resetPricingForm();
        }}
        onSubmit={handlePricingSubmit}
        pricing={pricingFormData}
        onPriceChange={handlePricingChange}
        isSubmitting={updatePricingMutation.isPending}
      />
      <CustomDiscountOptionFormModal
        isOpen={isCustomOptionModalOpen}
        onClose={() => {
          setIsCustomOptionModalOpen(false);
          setSelectedOption(null);
          resetCustomOptionForm();
        }}
        onSubmit={handleCustomOptionSubmit}
        editing={selectedOption}
        formData={customOptionFormData}
        handleInputChange={handleCustomOptionInputChange}
        isSubmitting={createOptionMutation.isPending || updateOptionMutation.isPending}
      />

      <SystemOptionsConfigModal
        isOpen={isSystemOptionsModalOpen}
        onClose={() => {
          setIsSystemOptionsModalOpen(false);
          resetSystemOptionsForm();
        }}
        onSubmit={handleSystemOptionsSubmit}
        options={systemOptionsFormData}
        onOptionChange={handleSystemOptionsInputChange}
        isSubmitting={updateSystemOptionsMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteItem(null);
          setSelectedOption(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deleteItem?.name || ''}
        itemType={deleteItem?.type || ''}
        isDeleting={deleteOptionMutation.isPending}
      />
    </div>
  );
};

export default MetroDiscountsManagement;
