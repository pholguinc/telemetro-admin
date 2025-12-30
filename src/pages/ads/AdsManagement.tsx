import React, { useState, useMemo, useCallback } from 'react';
import { Megaphone, BarChart, Plus, Edit, Trash2, RefreshCw, Eye, MousePointer } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { toast } from 'react-toastify';
import { useAds, useAdStats, useCreateAd, useUpdateAd, useDeleteAd, useToggleAdStatus, CreateAdData } from '../../hooks/useAds';
import { buildImageUrl } from '../../config/environment';
import FileUploader from '../../components/ui/FileUploader';
import { AdsService } from '../../services';

// Types (manteniendo los originales)
interface Ad {
  id: string;
  title: string;
  description?: string;
  type: 'banner' | 'interstitial' | 'video' | 'native' | 'fullscreen';
  placement: 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace' | 'profile' | 'streaming' | 'fullscreen';
  imageUrl?: string;
  videoUrl?: string;
  clickUrl?: string;
  destination?: string;
  advertiser?: string;
  status: 'draft' | 'active' | 'paused' | 'expired';
  isActive?: boolean;
  priority?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  totalSpent?: number;
  budget?: number;
  costPerClick?: number;
  schedule?: {
    startDate: string;
    endDate: string;
    timezone?: string;
  };
  createdBy?: {
    id: string;
    displayName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AdDraft {
  title: string;
  type: 'banner' | 'interstitial' | 'video' | 'native' | 'fullscreen';
  placement: 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace' | 'profile' | 'streaming' | 'fullscreen';
  imageUrl: string;
  videoUrl: string;
  clickUrl: string;
  destination: string;
  advertiser: string;
  status: 'draft' | 'active' | 'paused' | 'expired';
  priority: number;
  budget: number;
  costPerClick: number;
  description: string;
  schedule: {
    startDate: string;
    endDate: string;
  };
}

interface AdStats {
  total: number;
  active: number;
  paused: number;
  draft: number;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: string;
  };
  topPerforming: Ad[];
}

type StatusFilter = 'all' | 'draft' | 'active' | 'paused' | 'expired';
type PlacementFilter = 'all' | 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace' | 'profile' | 'streaming' | 'fullscreen';

// Constantes para opciones
const AD_TYPES = [
  { value: 'banner', label: 'Banner' },
  { value: 'interstitial', label: 'Intersticial' },
  { value: 'video', label: 'Video' },
  { value: 'native', label: 'Nativo' },
  { value: 'fullscreen', label: 'Pantalla completa' },
];

const PLACEMENTS = [
  { value: 'all', label: 'Todas las ubicaciones' },
  { value: 'home_top', label: 'Home arriba' },
  { value: 'home_middle', label: 'Home medio' },
  { value: 'home_bottom', label: 'Home abajo' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'profile', label: 'Perfil' },
  { value: 'streaming', label: 'Streaming' },
  { value: 'fullscreen', label: 'Pantalla completa' },
];

const FILTER_PLACEMENTS = PLACEMENTS.filter(p => p.value !== 'all');

const STATUSES = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borradores' },
  { value: 'active', label: 'Activos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'expired', label: 'Expirados' },
];

const FORM_STATUSES = STATUSES.filter(s => s.value !== 'all');

// Custom hook para lógica del formulario
const useAdForm = (initialDraft: AdDraft, editing: Ad | null, onReset: () => void) => {
  const [draft, setDraft] = useState<AdDraft>(initialDraft);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    
    setDraft(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  }, []);

  const handleScheduleChange = useCallback((field: 'startDate' | 'endDate', value: string) => {
    setDraft(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [field]: value }
    }));
  }, []);

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const response = await AdsService.uploadFile(file);
      const uploadedUrl = response.data.url;
      if (uploadedUrl.startsWith('data:')) {
        throw new Error('El servidor devolvió datos base64 en lugar de una URL válida');
      }
      setDraft(prev => ({ ...prev, imageUrl: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      throw error;
    }
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    try {
      const response = await AdsService.uploadFile(file);
      const uploadedUrl = response.data.url;
      if (uploadedUrl.startsWith('data:')) {
        throw new Error('El servidor devolvió datos base64 en lugar de una URL válida');
      }
      setDraft(prev => ({ ...prev, videoUrl: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Error al subir el video');
      throw error;
    }
  };

  const handleRemoveImage = () => setDraft(prev => ({ ...prev, imageUrl: '' }));
  const handleRemoveVideo = () => setDraft(prev => ({ ...prev, videoUrl: '' }));

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
    handleScheduleChange,
    handleImageUpload,
    handleVideoUpload,
    handleRemoveImage,
    handleRemoveVideo,
    resetForm
  };
};

// Subcomponente para Stats
const AdStatsComponent: React.FC<{ stats: AdStats | undefined }> = ({ stats }) => {
  if (!stats) return null;

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Anuncios</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Impresiones</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{formatNumber(stats.metrics.totalImpressions)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CTR</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.metrics.averageCTR}%</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <MousePointer className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
  );
};

// Subcomponente para Filtros
const AdFilters: React.FC<{
  search: string;
  status: StatusFilter;
  placement: PlacementFilter;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPlacementChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ search, status, placement, onSearchChange, onStatusChange, onPlacementChange }) => (
  <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Buscar anuncios..."
            value={search}
        onChange={onSearchChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        aria-label="Buscar anuncios por título o descripción"
          />
          <select
            value={status}
        onChange={onStatusChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por estado"
      >
        {STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
          </select>
          <select
            value={placement}
        onChange={onPlacementChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por ubicación"
      >
        {PLACEMENTS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
          </select>
        </div>
      </div>
);

// Subcomponente para Lista de Anuncios
const AdList: React.FC<{
  ads: Ad[];
  isLoading: boolean;
  onEdit: (ad: Ad) => void;
  onToggleStatus: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
}> = ({ ads, isLoading, onEdit, onToggleStatus, onDelete }) => {
  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    draft: 'bg-gray-100 text-gray-700',
    expired: 'bg-red-100 text-red-700',
  };

  if (isLoading) {
    return (
          <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando anuncios...</p>
          </div>
    );
  }

  if (ads.length === 0) {
    return (
          <div className="text-center py-8">
            <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron anuncios</h3>
        <p className="text-gray-500">Crea tu primer anuncio o ajusta los filtros</p>
          </div>
    );
  }

  return (
          <div className="space-y-4">
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{ad.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[ad.status] || 'bg-gray-100 text-gray-700'}`}>
                        {ad.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {ad.type}
                      </span>
                    </div>
                    {ad.description && (
                      <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatNumber(ad.impressions)} impresiones
                      </span>
                      <span className="flex items-center">
                        <MousePointer className="h-4 w-4 mr-1" />
                        {formatNumber(ad.clicks)} clics
                      </span>
                      {ad.ctr && (
                  <span className="text-blue-600">CTR: {ad.ctr.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
            <div className="flex items-center space-x-2 ml-4">
                    <button
                onClick={() => onEdit(ad)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                      type="button"
                aria-label={`Editar anuncio ${ad.title}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                onClick={() => onToggleStatus(ad)}
                      className={`p-2 rounded-lg transition-colors ${
                  ad.status === 'active' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                }`}
                title={ad.status === 'active' ? 'Pausar' : 'Activar'}
                      type="button"
                aria-label={`${ad.status === 'active' ? 'Pausar' : 'Activar'} anuncio ${ad.title}`}
                    >
                      {ad.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                    <button
                onClick={() => onDelete(ad)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                      type="button"
                aria-label={`Eliminar anuncio ${ad.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
      ))}
          </div>
  );
};

// Subcomponente para Modal de Confirmación de Eliminación
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adTitle: string;
}> = ({ isOpen, onClose, onConfirm, adTitle }) => (
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
                Eliminar Anuncio
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el anuncio &quot;{adTitle}&quot;? Esta acción no se puede deshacer.
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
                  Eliminar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// Subcomponente para Modal de Formulario
const AdFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  draft: AdDraft;
  editing: Ad | null;
  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleScheduleChange: (field: 'startDate' | 'endDate', value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleImageUpload: (file: File) => Promise<string>;
  handleVideoUpload: (file: File) => Promise<string>;
  handleRemoveImage: () => void;
  handleRemoveVideo: () => void;
  resetForm: () => void;
  isPending: boolean;
}> = ({
  isOpen,
  onClose,
  draft,
  editing,
  formSubmitted,
  setFormSubmitted,
  handleInputChange,
  handleScheduleChange,
  handleSubmit,
  handleImageUpload,
  handleVideoUpload,
  handleRemoveImage,
  handleRemoveVideo,
  resetForm,
  isPending,
}) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title || !draft.description || !draft.advertiser || !draft.clickUrl || !draft.schedule.startDate || !draft.schedule.endDate || draft.budget <= 0 || draft.costPerClick <= 0) {
      setFormSubmitted(true);
      toast.error('Por favor, completa todos los campos requeridos.');
      return;
    }
    await handleSubmit(e);
    onClose(); // Cerrar modal después de guardar exitosamente
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
                      {editing ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Cerrar modal"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={draft.title}
                onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${!draft.title && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Título del anuncio"
                required
              aria-invalid={!draft.title && formSubmitted ? 'true' : 'false'}
              aria-describedby="title-error"
              />
            {!draft.title && formSubmitted && (
              <p id="title-error" className="text-red-500 text-sm mt-1">Requerido</p>
            )}
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
              </label>
              <select
                id="type"
                name="type"
                value={draft.type}
                onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AD_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={draft.description}
              onChange={handleInputChange}
              rows={3}
            className={`w-full px-4 py-2 border ${!draft.description && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              placeholder="Descripción del anuncio..."
              required
            aria-invalid={!draft.description && formSubmitted ? 'true' : 'false'}
            aria-describedby="description-error"
            />
          {!draft.description && formSubmitted && (
            <p id="description-error" className="text-red-500 text-sm mt-1">Requerido</p>
          )}
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="placement" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
              </label>
              <select
                id="placement"
                name="placement"
                value={draft.placement}
                onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FILTER_PLACEMENTS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
              </select>
            </div>
            <div>
              <label htmlFor="advertiser" className="block text-sm font-medium text-gray-700 mb-2">
                Anunciante *
              </label>
              <input
                type="text"
                id="advertiser"
                name="advertiser"
                value={draft.advertiser}
                onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${!draft.advertiser && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Nombre del anunciante"
                required
              aria-invalid={!draft.advertiser && formSubmitted ? 'true' : 'false'}
              aria-describedby="advertiser-error"
              />
            {!draft.advertiser && formSubmitted && (
              <p id="advertiser-error" className="text-red-500 text-sm mt-1">Requerido</p>
            )}
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Presupuesto *
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={draft.budget}
                onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${draft.budget <= 0 && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              aria-invalid={draft.budget <= 0 && formSubmitted ? 'true' : 'false'}
              aria-describedby="budget-error"
              />
            {draft.budget <= 0 && formSubmitted && (
              <p id="budget-error" className="text-red-500 text-sm mt-1">Debe ser mayor a 0</p>
            )}
            </div>
            <div>
              <label htmlFor="costPerClick" className="block text-sm font-medium text-gray-700 mb-2">
                Costo por Clic *
              </label>
              <input
                type="number"
                id="costPerClick"
                name="costPerClick"
                value={draft.costPerClick}
                onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${draft.costPerClick <= 0 && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              aria-invalid={draft.costPerClick <= 0 && formSubmitted ? 'true' : 'false'}
              aria-describedby="cpc-error"
              />
            {draft.costPerClick <= 0 && formSubmitted && (
              <p id="cpc-error" className="text-red-500 text-sm mt-1">Debe ser mayor a 0</p>
            )}
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FileUploader
              accept="image"
              currentUrl={draft.imageUrl}
              onUpload={handleImageUpload}
              onRemove={handleRemoveImage}
              label="Imagen del Anuncio *"
              required={true}
              maxSize={10}
              className="w-full"
            />
          </div>
          <div>
            <FileUploader
              accept="video"
              currentUrl={draft.videoUrl}
              onUpload={handleVideoUpload}
              onRemove={handleRemoveVideo}
              label="Video del Anuncio (Opcional)"
              required={false}
              maxSize={50}
              className="w-full"
            />
          </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clickUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL de Clic *
              </label>
              <input
                type="url"
                id="clickUrl"
                name="clickUrl"
                value={draft.clickUrl}
                onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${!draft.clickUrl && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="https://ejemplo.com/destino"
                required
              aria-invalid={!draft.clickUrl && formSubmitted ? 'true' : 'false'}
              aria-describedby="clickUrl-error"
              />
            {!draft.clickUrl && formSubmitted && (
              <p id="clickUrl-error" className="text-red-500 text-sm mt-1">Requerido</p>
            )}
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
              Destino (Opcional)
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={draft.destination}
                onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Página de destino"
              />
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                value={draft.schedule.startDate}
              onChange={(e) => handleScheduleChange('startDate', e.target.value)}
              className={`w-full px-4 py-2 border ${!draft.schedule.startDate && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              aria-invalid={!draft.schedule.startDate && formSubmitted ? 'true' : 'false'}
              aria-describedby="startDate-error"
              />
            {!draft.schedule.startDate && formSubmitted && (
              <p id="startDate-error" className="text-red-500 text-sm mt-1">Requerido</p>
            )}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={draft.schedule.endDate}
              onChange={(e) => handleScheduleChange('endDate', e.target.value)}
              className={`w-full px-4 py-2 border ${!draft.schedule.endDate && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              aria-invalid={!draft.schedule.endDate && formSubmitted ? 'true' : 'false'}
              aria-describedby="endDate-error"
              />
            {!draft.schedule.endDate && formSubmitted && (
              <p id="endDate-error" className="text-red-500 text-sm mt-1">Requerido</p>
            )}
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad (1-10)
              </label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={draft.priority}
                onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
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
                <option key={value} value={value}>{label}</option>
              ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
          {editing && (
              <button
                type="button"
              onClick={resetForm}
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
            <span>{isPending ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear Anuncio')}</span>
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

// Componente Principal
const AdsManagement: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [placement, setPlacement] = useState<PlacementFilter>('all');
  const [editing, setEditing] = useState<Ad | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const initialDraft: AdDraft = {
                    title: '', 
                    type: 'interstitial', 
                    placement: 'home_top', 
                    imageUrl: '', 
                    videoUrl: '', 
                    clickUrl: '', 
                    destination: '',
                    advertiser: '',
                    status: 'draft',
                    priority: 1,
                    budget: 0,
                    costPerClick: 0,
                    description: '',
                    schedule: {
                      startDate: '',
                      endDate: ''
                    }
  };
  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleScheduleChange,
    handleImageUpload,
    handleVideoUpload,
    handleRemoveImage,
    handleRemoveVideo,
    resetForm
  } = useAdForm(initialDraft, editing, () => setEditing(null));

  const { data: adsResponse, isLoading, refetch } = useAds({
    search,
    status: status !== 'all' ? status : undefined,
    placement: placement !== 'all' ? placement : undefined,
    limit: 50
  });
  const ads: Ad[] = adsResponse?.data || [];

  const { data: stats } = useAdStats();
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();
  const toggleStatus = useToggleAdStatus();

  const filteredAds = useMemo(() => {
    return ads.filter((ad: Ad) => {
      const matchesSearch = search === '' ||
        ad.title.toLowerCase().includes(search.toLowerCase()) ||
        (ad.description && ad.description.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = status === 'all' || ad.status === status;
      const matchesPlacement = placement === 'all' || ad.placement === placement;
      return matchesSearch && matchesStatus && matchesPlacement;
    });
  }, [ads, search, status, placement]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as StatusFilter), []);
  const handlePlacementChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setPlacement(e.target.value as PlacementFilter), []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      const cleanedData: CreateAdData = {
        ...draft,
        imageUrl: draft.imageUrl.trim() || undefined,
        videoUrl: draft.videoUrl.trim() || undefined,
        clickUrl: draft.clickUrl.trim() || undefined,
        destination: draft.destination.trim(),
        advertiser: draft.advertiser.trim(),
        placement: draft.placement,
        status: draft.status, // Asegurar que se incluya el status seleccionado
      };

      const schedulePayload: Record<string, string> = {};
      if (draft.schedule.startDate) schedulePayload.startDate = new Date(draft.schedule.startDate).toISOString();
      if (draft.schedule.endDate) schedulePayload.endDate = new Date(draft.schedule.endDate).toISOString();
      if (Object.keys(schedulePayload).length > 0) cleanedData.schedule = schedulePayload;

      // Eliminar campos undefined EXCEPTO status que siempre debe enviarse
      (Object.keys(cleanedData) as Array<keyof CreateAdData>).forEach(key => {
        if (key !== 'status' && (cleanedData as any)[key] === undefined) {
          delete (cleanedData as any)[key];
        }
      });

      if (editing) {
        await updateAd.mutateAsync({ id: editing.id, data: cleanedData });
        toast.success('Anuncio actualizado con éxito');
        setEditing(null);
      } else {
        await createAd.mutateAsync(cleanedData);
        toast.success('Anuncio creado con éxito');
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('Error al guardar el anuncio');
    } finally {
      setFormSubmitted(false);
    }
  };

  const handleEdit = (ad: Ad): void => {
    const formatDateForInput = (dateString: string | undefined): string => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      } catch {
        return '';
      }
    };

    setEditing(ad);
    setDraft({
      title: ad.title || '',
      type: ad.type,
      placement: ad.placement,
      imageUrl: ad.imageUrl || '',
      videoUrl: ad.videoUrl || '',
      clickUrl: ad.clickUrl || '',
      destination: ad.destination || '',
      advertiser: ad.advertiser || '',
      status: ad.status,
      priority: ad.priority || 1,
      budget: ad.budget || 0,
      costPerClick: ad.costPerClick || 0,
      description: ad.description || '',
      schedule: {
        startDate: formatDateForInput(ad.schedule?.startDate),
        endDate: formatDateForInput(ad.schedule?.endDate)
      }
    });
    setIsFormModalOpen(true);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

  const handleDelete = (ad: Ad): void => {
    setAdToDelete(ad);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (adToDelete) {
      try {
        await deleteAd.mutateAsync(adToDelete.id);
        toast.success('Anuncio eliminado con éxito');
        refetch();
      } catch (error) {
        console.error('Error deleting ad:', error);
        toast.error('Error al eliminar el anuncio');
      }
    }
    setIsDeleteModalOpen(false);
    setAdToDelete(null);
  };

  const handleToggleStatus = async (ad: Ad): Promise<void> => {
    let newStatus: 'draft' | 'active' | 'paused' | 'expired';
    switch (ad.status) {
      case 'draft':
        newStatus = 'active';
        break;
      case 'active':
        newStatus = 'paused';
        break;
      case 'paused':
        newStatus = 'active';
        break;
      case 'expired':
        newStatus = 'active';
        break;
      default:
        newStatus = 'active';
    }
    try {
      await toggleStatus.mutateAsync({ id: ad.id, status: newStatus });
      toast.success(`Anuncio ${newStatus === 'active' ? 'activado' : 'pausado'} con éxito`);
      refetch();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      toast.error('Error al cambiar el estado del anuncio');
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📢 Gestión de Anuncios</h1>
          <p className="text-gray-600 mt-2">Administra los anuncios publicitarios de tu aplicación</p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isLoading}
          type="button"
          aria-label="Actualizar lista de anuncios"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
              </button>
      </div>

      {/* Stats */}
      <AdStatsComponent stats={stats} />

      {/* Filtros */}
      <AdFilters
        search={search}
        status={status}
        placement={placement}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onPlacementChange={handlePlacementChange}
      />

      {/* Lista de Anuncios */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Anuncios ({filteredAds.length})</h2>
            <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            type="button"
          >
                <Plus className="h-5 w-5" />
            <span>Crear Anuncio</span>
            </button>
          </div>
        <AdList
          ads={filteredAds}
          isLoading={isLoading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal de Formulario */}
      <AdFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        draft={draft}
        editing={editing}
        formSubmitted={formSubmitted}
        setFormSubmitted={setFormSubmitted}
        handleInputChange={handleInputChange}
        handleScheduleChange={handleScheduleChange}
        handleSubmit={handleSubmit}
        handleImageUpload={handleImageUpload}
        handleVideoUpload={handleVideoUpload}
        handleRemoveImage={handleRemoveImage}
        handleRemoveVideo={handleRemoveVideo}
        resetForm={resetForm}
        isPending={createAd.isPending || updateAd.isPending}
      />

      {/* Modal de Eliminación */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        adTitle={adToDelete?.title || ''}
      />
    </div>
  );
};

export default AdsManagement;