import React, { useState, useMemo, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useMarketplaceProducts,
  useMarketplaceStats,
  useMarketplaceRedemptions,
  useMarketplaceOffers,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useConfirmRedemptionByCode,
  useMarkDeliveredByCode,
  useProductForm,
  ProductDraft,
  GeographicOffer,
  OfferDraft,
  useOfferForm,
  useCreateOffer,
  useUpdateOffer,
  useToggleOfferStatus,
  useDeleteOffer,
} from '../../hooks/useMarketplace';
import { MarketplaceProduct } from '../../models';
import MarketplaceStatsComponent from './components/MarketplaceStats';
import MarketplaceFilters from './components/MarketplaceFilters';
import RedemptionList from './components/RedemptionList';
import ProductFormModal from './components/ProductFormModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import OfferStats from './components/OfferStats';
import OfferFilters from './components/OfferFilters';
import OfferList from './components/OfferList';
import OfferFormModal from './components/OfferFormModal';
import OfferDeleteModal from './components/OfferDeleteModal';
import ProductList from './components/ProductList';

// Types
type Tab = 'products' | 'redemptions' | 'offers';
type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilter = 'all' | 'digital' | 'physical' | 'premium' | 'food' | 'entertainment' | 'services' | 'other';
type RedemptionStatusFilter = 'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled';

interface MarketplaceManagementProps {
  initialTab?: Tab;
}

const MarketplaceManagement: React.FC<MarketplaceManagementProps> = ({ initialTab = 'products' }) => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<Tab>(
    ['products', 'redemptions', 'offers'].includes(initialTab) ? initialTab : 'products'
  );
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter | RedemptionStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  
  // Estados para modales de productos
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<MarketplaceProduct | null>(null);

  // Estados para modales de ofertas
  const [isOfferFormModalOpen, setIsOfferFormModalOpen] = useState<boolean>(false);
  const [isOfferDeleteModalOpen, setIsOfferDeleteModalOpen] = useState<boolean>(false);
  const [editingOffer, setEditingOffer] = useState<GeographicOffer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<GeographicOffer | null>(null);

  // Draft inicial para el formulario
  const initialDraft: ProductDraft = {
    name: '',
    description: '',
    category: 'digital',
    pointsCost: 0,
    stock: 0,
    imageUrl: '',
    provider: '',
    isActive: true,
    validityMinutes: undefined,
  };

  // Custom hook para el formulario de productos
  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    resetForm,
  } = useProductForm(initialDraft, editing, () => setEditing(null));

  // Draft inicial para ofertas
  const initialOfferDraft: OfferDraft = {
    title: '',
    description: '',
    merchantName: '',
    merchantAddress: '',
    category: 'food_drink',
    discountCode: '',
    discountPercentage: 0,
    pointsReward: 0,
    expiresAt: '',
    imageUrl: '',
    location: null,
    isActive: true,
    termsAndConditions: '',
    maxRedemptions: 0,
  };

  // Custom hook para el formulario de ofertas
  const {
    draft: offerDraft,
    setDraft: setOfferDraft,
    formSubmitted: offerFormSubmitted,
    setFormSubmitted: setOfferFormSubmitted,
    handleInputChange: handleOfferInputChange,
    handleLocationChange,
    handleImageUpload: handleOfferImageUpload,
    handleRemoveImage: handleOfferRemoveImage,
    resetForm: resetOfferForm,
  } = useOfferForm(initialOfferDraft, editingOffer, () => setEditingOffer(null));

  // Queries - NO filtramos por isActive aquí, lo hacemos en el frontend
  const {
    data: productsData = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useMarketplaceProducts({
    search: search,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    // NO enviamos isActive al backend para obtener TODOS los productos
  });

  const { data: stats } = useMarketplaceStats();
  
  const {
    data: redemptionsData = [],
    isLoading: redemptionsLoading,
    refetch: refetchRedemptions,
  } = useMarketplaceRedemptions({
    status:
      statusFilter !== 'all' && ['pending', 'confirmed', 'delivered', 'cancelled'].includes(statusFilter as string)
        ? (statusFilter as 'pending' | 'confirmed' | 'delivered' | 'cancelled')
        : undefined,
  });
  
  const { data: offersData = [], refetch: refetchOffers } = useMarketplaceOffers();

  // Safely extract arrays
  const products: MarketplaceProduct[] = Array.isArray(productsData) ? productsData : [];
  const redemptions = Array.isArray(redemptionsData) ? redemptionsData : [];
  const offers = Array.isArray(offersData) ? offersData : [];

  // Mutations para productos
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const confirmRedemption = useConfirmRedemptionByCode();
  const markDelivered = useMarkDeliveredByCode();

  // Mutations para ofertas
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const toggleOfferStatus = useToggleOfferStatus();
  const deleteOffer = useDeleteOffer();

  // Productos filtrados (con useMemo para optimización)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? product.isActive : !product.isActive);
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, statusFilter, categoryFilter]);

  // Ofertas filtradas (con useMemo para optimización)
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        search === '' ||
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.description.toLowerCase().includes(search.toLowerCase()) ||
        offer.merchantName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? offer.isActive : !offer.isActive);
      const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [offers, search, statusFilter, categoryFilter]);

  // Handlers
  const handleTabChange = (tab: Tab): void => {
    setActiveTab(tab);
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);
  
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setStatusFilter(e.target.value as StatusFilter | RedemptionStatusFilter),
    []
  );
  
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value as CategoryFilter),
    []
  );

  const handleRefresh = (): void => {
    switch (activeTab) {
      case 'products':
        refetchProducts();
        break;
      case 'redemptions':
        refetchRedemptions();
        break;
      case 'offers':
        refetchOffers();
        break;
    }
  };

  const handleCreateNew = () => {
    setEditing(null);
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleEdit = (product: MarketplaceProduct): void => {
    setEditing(product);
    setDraft({
      name: product.name || '',
      description: product.description || '',
      category: (product.category as any) || 'digital',
      pointsCost: product.pointsCost || 0,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || '',
      provider: product.provider || '',
      isActive: product.isActive ?? true,
      validityMinutes: product.validityMinutes,
    });
    setIsFormModalOpen(true);
  };

  const handleToggleStatus = async (product: MarketplaceProduct): Promise<void> => {
    try {
      await updateProduct.mutateAsync({
        productId: product._id,
        productData: { isActive: !product.isActive },
      });
      refetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleDelete = (product: MarketplaceProduct): void => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct.mutateAsync(productToDelete._id);
        refetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      const cleanedData: any = {
        ...draft,
        imageUrl: draft.imageUrl.trim() || undefined,
      };

      // Si no es digital, remover validityMinutes
      if (draft.category !== 'digital') {
        delete cleanedData.validityMinutes;
      }

      // Eliminar campos undefined
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });

      if (editing) {
        await updateProduct.mutateAsync({ productId: editing._id, productData: cleanedData });
        toast.success('Producto actualizado con éxito');
        setEditing(null);
      } else {
        await createProduct.mutateAsync(cleanedData);
        toast.success('Producto creado con éxito');
      }

      resetForm();
      setIsFormModalOpen(false);
      refetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setFormSubmitted(false);
    }
  };

  // Handlers para ofertas
  const handleCreateOffer = (): void => {
    resetOfferForm();
    setEditingOffer(null);
    setOfferDraft(initialOfferDraft);
    setIsOfferFormModalOpen(true);
  };

  const handleEditOffer = (offer: GeographicOffer): void => {
    setEditingOffer(offer);
    setOfferDraft({
      title: offer.title,
      description: offer.description,
      merchantName: offer.merchantName,
      merchantAddress: offer.merchantAddress || '',
      category: offer.category,
      discountCode: offer.discountCode || '',
      discountPercentage: offer.discountPercentage || 0,
      pointsReward: offer.pointsReward || 0,
      expiresAt: offer.expiresAt ? offer.expiresAt.split('T')[0] : '',
      imageUrl: offer.imageUrl || '',
      location: offer.location,
      isActive: offer.isActive,
      termsAndConditions: offer.termsAndConditions || '',
      maxRedemptions: offer.maxRedemptions || 0,
    });
    setIsOfferFormModalOpen(true);
  };

  const handleToggleOfferStatus = async (offer: GeographicOffer): Promise<void> => {
    try {
      await toggleOfferStatus.mutateAsync(offer._id);
      refetchOffers();
    } catch (error) {
      console.error('Error toggling offer status:', error);
    }
  };

  const handleDeleteOffer = (offer: GeographicOffer): void => {
    setOfferToDelete(offer);
    setIsOfferDeleteModalOpen(true);
  };

  const confirmDeleteOffer = async () => {
    if (offerToDelete) {
      try {
        await deleteOffer.mutateAsync(offerToDelete._id);
        refetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
    setIsOfferDeleteModalOpen(false);
    setOfferToDelete(null);
  };

  const handleSubmitOffer = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setOfferFormSubmitted(true);

    // Validar que location esté definida
    if (!offerDraft.location || !offerDraft.location.type || !offerDraft.location.coordinates) {
      toast.error('Debes dibujar o seleccionar un área geográfica en el mapa');
      return;
    }

    try {
      const cleanedData: any = {
        title: offerDraft.title,
        description: offerDraft.description,
        merchantName: offerDraft.merchantName,
        merchantAddress: offerDraft.merchantAddress || undefined,
        category: offerDraft.category,
        discountCode: offerDraft.discountCode || undefined,
        discountPercentage: offerDraft.discountPercentage || undefined,
        pointsReward: offerDraft.pointsReward || undefined,
        expiresAt: offerDraft.expiresAt || undefined,
        imageUrl: offerDraft.imageUrl || undefined,
        location: offerDraft.location,
        isActive: offerDraft.isActive,
        termsAndConditions: offerDraft.termsAndConditions || undefined,
        maxRedemptions: offerDraft.maxRedemptions || undefined,
      };

      // Eliminar campos undefined
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });

      if (editingOffer) {
        await updateOffer.mutateAsync({ offerId: editingOffer._id, offerData: cleanedData });
        toast.success('Oferta actualizada con éxito');
        setEditingOffer(null);
      } else {
        await createOffer.mutateAsync(cleanedData);
        toast.success('Oferta creada con éxito');
      }

      resetOfferForm();
      setIsOfferFormModalOpen(false);
      refetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error('Error al guardar la oferta');
    } finally {
      setOfferFormSubmitted(false);
    }
  };

  const handleConfirmRedemption = async (code: string): Promise<void> => {
    try {
      await confirmRedemption.mutateAsync(code);
      refetchRedemptions();
    } catch (error) {
      console.error('Error confirming redemption:', error);
    }
  };

  const handleMarkDelivered = async (code: string): Promise<void> => {
    try {
      await markDelivered.mutateAsync(code);
      refetchRedemptions();
    } catch (error) {
      console.error('Error marking as delivered:', error);
    }
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditing(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🛍️ Marketplace</h1>
          <p className="text-gray-600 mt-2">Gestiona productos, canjes y ofertas del marketplace</p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={productsLoading || redemptionsLoading}
          type="button"
          aria-label="Actualizar datos"
        >
          <RefreshCw className={`h-5 w-5 ${productsLoading || redemptionsLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats */}
      <MarketplaceStatsComponent stats={stats} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            📦 Productos
          </button>

          <button
            onClick={() => handleTabChange('redemptions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'redemptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            🎁 Canjes
          </button>

          <button
            onClick={() => handleTabChange('offers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            🗺️ Ofertas Geográficas
          </button>
        </nav>
      </div>

      {/* Filtros */}
      {activeTab === 'products' && (
        <MarketplaceFilters
          search={search}
          status={statusFilter as StatusFilter}
          category={categoryFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {activeTab === 'redemptions' && (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Buscar canjes..."
              value={search}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      )}

      {/* Contenido según tab activo */}
      {activeTab === 'products' && (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Productos ({filteredProducts.length})</h2>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              type="button"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Producto</span>
            </button>
          </div>
          <ProductList
            products={filteredProducts}
            isLoading={productsLoading}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        </div>
      )}

      {activeTab === 'redemptions' && (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Canjes ({redemptions.length})</h2>
          </div>
          <RedemptionList
            redemptions={redemptions}
            isLoading={redemptionsLoading}
            onConfirm={handleConfirmRedemption}
            onMarkDelivered={handleMarkDelivered}
          />
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="space-y-6">
          {/* Stats de Ofertas */}
          <OfferStats
            stats={{
              total: offers.length,
              active: offers.filter((o) => o.isActive).length,
              totalRedemptions: offers.reduce((sum, o) => sum + (o.currentRedemptions || 0), 0),
            }}
          />

          {/* Filtros de Ofertas */}
          <OfferFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter as 'all' | 'active' | 'inactive'}
            setStatusFilter={setStatusFilter as (value: 'all' | 'active' | 'inactive') => void}
            categoryFilter={categoryFilter as any}
            setCategoryFilter={setCategoryFilter as any}
          />

          {/* Header con botón de crear */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Ofertas Geográficas ({filteredOffers.length})
            </h2>
            <button
              onClick={handleCreateOffer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              type="button"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Oferta</span>
            </button>
          </div>

          {/* Lista de Ofertas */}
          <OfferList
            offers={filteredOffers}
            isLoading={false}
            onEdit={handleEditOffer}
            onToggleStatus={handleToggleOfferStatus}
            onDelete={handleDeleteOffer}
          />
        </div>
      )}

      {/* Modal de Formulario */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        draft={draft}
        editing={editing}
        formSubmitted={formSubmitted}
        setFormSubmitted={setFormSubmitted}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        resetForm={resetForm}
        isPending={createProduct.isPending || updateProduct.isPending}
      />

      {/* Modal de Eliminación de Producto */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        productName={productToDelete?.name || ''}
      />

      {/* Modal de Formulario de Oferta */}
      <OfferFormModal
        isOpen={isOfferFormModalOpen}
        onClose={() => {
          setIsOfferFormModalOpen(false);
          setEditingOffer(null);
          resetOfferForm();
        }}
        onSubmit={handleSubmitOffer}
        editing={editingOffer}
        draft={offerDraft}
        formSubmitted={offerFormSubmitted}
        handleInputChange={handleOfferInputChange}
        handleLocationChange={handleLocationChange}
        handleImageUpload={handleOfferImageUpload}
        handleRemoveImage={handleOfferRemoveImage}
      />

      {/* Modal de Eliminación de Oferta */}
      <OfferDeleteModal
        isOpen={isOfferDeleteModalOpen}
        onClose={() => setIsOfferDeleteModalOpen(false)}
        onConfirm={confirmDeleteOffer}
        offerTitle={offerToDelete?.title || ''}
      />
    </div>
  );
};

export default MarketplaceManagement;
