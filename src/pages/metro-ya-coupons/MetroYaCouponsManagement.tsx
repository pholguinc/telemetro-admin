import React, { useState, useMemo, useCallback } from 'react';
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  useCouponTemplates,
  useCouponGlobalStats,
  useCoupons,
  useCouponDetail,
  useCreateCoupon,
  useUpdateCoupon,
  useToggleCouponStatus,
  useDeleteCoupon,
  useCreateCouponForm,
  useUpdateCouponForm,
} from '../../hooks/useMetroYaCouponsAdmin';
import type { MetroYaCoupon } from '../../models/metro-ya-coupon';
import CouponStats from './components/CouponStats';
import CouponFilters from './components/CouponFilters';
import CouponList from './components/CouponList';
import CreateCouponModal from './components/CreateCouponModal';
import EditCouponModal from './components/EditCouponModal';
import CouponDetailsModal from './components/CouponDetailsModal';

// Types
type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilter = 'all' | 'transport' | 'discount' | 'special' | 'bonus';
type BenefitTypeFilter = 'all' | 'discount_percentage' | 'discount_fixed' | 'free_trip' | 'points_bonus' | 'custom';

const MetroYaCouponsManagement: React.FC = () => {
  // ============ ESTADOS ============
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [benefitTypeFilter, setBenefitTypeFilter] = useState<BenefitTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados de selección
  const [selectedCoupon, setSelectedCoupon] = useState<MetroYaCoupon | null>(null);

  // ============ CUSTOM HOOKS ============
  const { 
    formData: createFormData, 
    handleInputChange: handleCreateInputChange, 
    resetForm: resetCreateForm,
    setFormSubmitted: setCreateFormSubmitted,
    loadTemplate,
    createCoupon
  } = useCreateCouponForm();

  const { 
    formData: editFormData, 
    handleInputChange: handleEditInputChange, 
    resetForm: resetEditForm,
    setFormSubmitted: setEditFormSubmitted 
  } = useUpdateCouponForm(selectedCoupon || undefined);

  // ============ QUERIES ============
  const { data: templates, isLoading: templatesLoading, error: templatesError } = useCouponTemplates();
  const { data: globalStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useCouponGlobalStats();
  
  const filters = useMemo(() => ({
    page: currentPage,
    limit: 20,
    search: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    benefitType: benefitTypeFilter !== 'all' ? benefitTypeFilter : undefined,
    isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
  }), [currentPage, search, categoryFilter, benefitTypeFilter, statusFilter]);

  const { 
    data: couponsData, 
    isLoading: couponsLoading, 
    error: couponsError,
    refetch: refetchCoupons 
  } = useCoupons(filters);

  // Hook para obtener detalles del cupón seleccionado
  const { 
    data: couponDetailData, 
    isLoading: couponDetailLoading, 
    error: couponDetailError 
  } = useCouponDetail(selectedCoupon?.id || '');

  // ============ MUTATIONS ============
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const toggleMutation = useToggleCouponStatus();
  const deleteMutation = useDeleteCoupon();

  // ============ HANDLERS ============
  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchCoupons();
  }, [refetchStats, refetchCoupons]);

  const handleCreate = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleEdit = useCallback((coupon: MetroYaCoupon) => {
    setSelectedCoupon(coupon);
    setIsEditModalOpen(true);
  }, []);

  const handleViewDetails = useCallback((coupon: MetroYaCoupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsModalOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (coupon: MetroYaCoupon) => {
    if (window.confirm(`¿Estás seguro de que quieres ${coupon.isActive ? 'desactivar' : 'activar'} el cupón "${coupon.title}"?`)) {
      await toggleMutation.mutateAsync(coupon.id);
    }
  }, [toggleMutation]);

  const handleDelete = useCallback(async (coupon: MetroYaCoupon) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el cupón "${coupon.title}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteMutation.mutateAsync(coupon.id);
      } catch (error: any) {
        if (error?.response?.data?.code === 'COUPON_HAS_USAGE') {
          alert('No se puede eliminar un cupón que ya ha sido usado. Considere desactivarlo en su lugar.');
        }
      }
    }
  }, [deleteMutation]);

  const handleCreateSubmit = useCallback(async (data: any) => {
    try {
      await createCoupon(data);
      setIsCreateModalOpen(false);
      setSelectedCoupon(null);
      // Refrescar datos después de crear
      handleRefresh();
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  }, [createCoupon, handleRefresh]);

  const handleEditSubmit = useCallback(async (data: any) => {
    if (!selectedCoupon) return;
    
    setEditFormSubmitted(true);
    await updateMutation.mutateAsync({
      couponId: selectedCoupon.id,
      data,
    });
    setIsEditModalOpen(false);
    setSelectedCoupon(null);
    resetEditForm();
  }, [selectedCoupon, updateMutation, resetEditForm, setEditFormSubmitted]);

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cupones Metro Ya</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra todos los cupones y promociones del sistema Metro Ya
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={statsLoading || couponsLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(statsLoading || couponsLoading) ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Cupón
          </button>
        </div>
      </div>

      {/* Error de autenticación */}
      {((statsError as any) || (templatesError as any) || (couponsError as any)) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error de autenticación</h3>
              <p className="text-sm text-red-700 mt-1">
                No se pueden cargar los datos. Por favor, verifica que estés autenticado correctamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <CouponStats stats={globalStats} isLoading={statsLoading} />

      {/* Filtros */}
      <CouponFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={(category: CategoryFilter) => setCategoryFilter(category)}
        benefitTypeFilter={benefitTypeFilter}
        setBenefitTypeFilter={(benefitType: BenefitTypeFilter) => setBenefitTypeFilter(benefitType)}
        statusFilter={statusFilter}
        setStatusFilter={(status: StatusFilter) => setStatusFilter(status)}
      />

      {/* Lista de cupones */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Cupones ({couponsData?.coupons?.length ?? 0})
          </h2>
          {couponsData?.pagination && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>
                Página {couponsData.pagination.page} de {couponsData.pagination.totalPages}
              </span>
              <span>•</span>
              <span>{couponsData.pagination.total} cupones total</span>
            </div>
          )}
        </div>
        <CouponList
          coupons={couponsData?.coupons || []}
          isLoading={couponsLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Paginación */}
      {couponsData?.pagination && couponsData.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              {currentPage} de {couponsData.pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(couponsData.pagination.totalPages, prev + 1))}
              disabled={currentPage === couponsData.pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        onSubmit={handleCreateSubmit}
        formData={createFormData}
        handleInputChange={handleCreateInputChange}
        isSubmitting={createMutation.isPending}
        templates={templates}
        loadTemplate={loadTemplate}
      />

      <EditCouponModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCoupon(null);
          resetEditForm();
        }}
        onSubmit={handleEditSubmit}
        coupon={selectedCoupon}
        formData={editFormData}
        handleInputChange={handleEditInputChange}
        isSubmitting={updateMutation.isPending}
      />

      <CouponDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCoupon(null);
        }}
        couponDetail={couponDetailData || null}
        isLoading={couponDetailLoading}
      />
    </div>
  );
};

export default MetroYaCouponsManagement;
