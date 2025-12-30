import React, { useState, useMemo, useCallback } from 'react';
import { Shield, BarChart, Plus, Edit, Trash2, RefreshCw, Eye, DollarSign } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { 
  useMicroseguros, 
  useMicrosegurosStats, 
  useCreateMicroseguro, 
  useUpdateMicroseguro, 
  useDeleteMicroseguro, 
  useToggleMicroseguroStatus,
  CreateMicroseguroData 
} from '../../hooks/useMicroseguros';
import { buildImageUrl } from '../../config/environment';
import FileUploader from '../../components/ui/FileUploader';
import { MicrosegurosService } from '../../services/MicrosegurosService';

// Types
interface Microseguro {
  _id: string;
  name: string;
  description: string;
  category: string;
  monthlyPrice: number;
  maxCoverage: number;
  benefits: string[];
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MicroseguroDraft {
  name: string;
  description: string;
  category: string;
  monthlyPrice: number;
  maxCoverage: number;
  benefits: string[];
  icon: string;
  color: string;
  isActive: boolean;
}

interface MicrosegurosStats {
  totalMicroseguros: number;
  activeMicroseguros: number;
  totalContracts: number;
  activeContracts: number;
  totalClaims: number;
  pendingClaims: number;
  monthlyRevenue: number;
}

type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilter = 'all' | 'salud' | 'vida' | 'hogar' | 'vehiculo' | 'viaje';

// Constantes para opciones
const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'salud', label: 'Salud' },
  { value: 'vida', label: 'Vida' },
  { value: 'hogar', label: 'Hogar' },
  { value: 'vehiculo', label: 'Vehículo' },
  { value: 'viaje', label: 'Viaje' },
];

const FILTER_CATEGORIES = CATEGORIES.filter(c => c.value !== 'all');

const STATUSES = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

const FORM_STATUSES = STATUSES.filter(s => s.value !== 'all');

const COLORS = [
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'red', label: 'Rojo' },
  { value: 'yellow', label: 'Amarillo' },
  { value: 'purple', label: 'Morado' },
  { value: 'indigo', label: 'Índigo' },
];

// Custom hook para lógica del formulario
const useMicroseguroForm = (initialDraft: MicroseguroDraft, editing: Microseguro | null, onReset: () => void) => {
  const [draft, setDraft] = useState<MicroseguroDraft>(initialDraft);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setDraft(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  }, []);

  const handleBenefitsChange = useCallback((benefits: string[]) => {
    setDraft(prev => ({ ...prev, benefits }));
  }, []);

  const handleIconUpload = async (file: File): Promise<string> => {
    try {
      const response = await MicrosegurosService.uploadFile(file);
      const uploadedUrl = response.data.url;
      if (uploadedUrl.startsWith('data:')) {
        throw new Error('El servidor devolvió datos base64 en lugar de una URL válida');
      }
      setDraft(prev => ({ ...prev, icon: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast.error('Error al subir el ícono');
      throw error;
    }
  };

  const handleRemoveIcon = () => setDraft(prev => ({ ...prev, icon: '' }));

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
    handleBenefitsChange,
    handleIconUpload,
    handleRemoveIcon,
    resetForm
  };
};

// Subcomponente para Stats
const MicrosegurosStatsComponent: React.FC<{ stats: MicrosegurosStats | undefined }> = ({ stats }) => {
  if (!stats) return null;

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'S/ 0.00';
    }
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Microseguros</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMicroseguros}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Activos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeMicroseguros}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Eye className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Contratos</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activeContracts}</p>
            <p className="text-sm text-gray-500">{stats.totalContracts} total</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <BarChart className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {formatCurrency(stats.monthlyRevenue)}
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para Filtros
const MicrosegurosFilters: React.FC<{
  search: string;
  status: StatusFilter;
  category: CategoryFilter;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }> = ({ search, status, category, onSearchChange, onStatusChange, onCategoryChange }) => (
  <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <input
        type="text"
        placeholder="Buscar microseguros..."
        value={search}
        onChange={onSearchChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        aria-label="Buscar microseguros por nombre o descripción"
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
        value={category}
        onChange={onCategoryChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por categoría"
      >
        {CATEGORIES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  </div>
);

// Subcomponente para Lista de Microseguros
const MicrosegurosList: React.FC<{
  microseguros: Microseguro[];
  isLoading: boolean;
  onEdit: (microseguro: Microseguro) => void;
  onToggleStatus: (microseguro: Microseguro) => void;
  onDelete: (microseguro: Microseguro) => void;
}> = ({ microseguros, isLoading, onEdit, onToggleStatus, onDelete }) => {
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'S/ 0.00';
    }
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando microseguros...</p>
      </div>
    );
  }

  if (microseguros.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron microseguros</h3>
        <p className="text-gray-500">Crea tu primer microseguro o ajusta los filtros</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {microseguros.map((microseguro) => (
        <div
          key={microseguro._id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-gray-900">{microseguro.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[microseguro.isActive ? 'active' : 'inactive']}`}>
                  {microseguro.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {microseguro.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{microseguro.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Precio: {formatCurrency(microseguro.monthlyPrice)}/mes</span>
                <span>Cobertura: {formatCurrency(microseguro.maxCoverage)}</span>
                <span>Beneficios: {microseguro.benefits.length}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onEdit(microseguro)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
                type="button"
                aria-label={`Editar microseguro ${microseguro.name}`}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onToggleStatus(microseguro)}
                className={`p-2 rounded-lg transition-colors ${
                  microseguro.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                }`}
                title={microseguro.isActive ? 'Desactivar' : 'Activar'}
                type="button"
                aria-label={`${microseguro.isActive ? 'Desactivar' : 'Activar'} microseguro ${microseguro.name}`}
              >
                {microseguro.isActive ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={() => onDelete(microseguro)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
                type="button"
                aria-label={`Eliminar microseguro ${microseguro.name}`}
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
  microseguroName: string;
}> = ({ isOpen, onClose, onConfirm, microseguroName }) => (
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
                Eliminar Microseguro
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el microseguro &quot;{microseguroName}&quot;? Esta acción no se puede deshacer.
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
const MicroseguroFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  draft: MicroseguroDraft;
  editing: Microseguro | null;
  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBenefitsChange: (benefits: string[]) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleIconUpload: (file: File) => Promise<string>;
  handleRemoveIcon: () => void;
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
  handleBenefitsChange,
  handleSubmit,
  handleIconUpload,
  handleRemoveIcon,
  resetForm,
  isPending,
}) => {
  const [benefitsInput, setBenefitsInput] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name || !draft.description || !draft.category || draft.monthlyPrice <= 0 || draft.maxCoverage <= 0) {
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

  const addBenefit = () => {
    if (benefitsInput.trim()) {
      handleBenefitsChange([...draft.benefits, benefitsInput.trim()]);
      setBenefitsInput('');
    }
  };

  const removeBenefit = (index: number) => {
    const newBenefits = draft.benefits.filter((_, i) => i !== index);
    handleBenefitsChange(newBenefits);
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
                      {editing ? 'Editar Microseguro' : 'Crear Nuevo Microseguro'}
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={draft.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${!draft.name && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Nombre del microseguro"
                          required
                          aria-invalid={!draft.name && formSubmitted ? 'true' : 'false'}
                          aria-describedby="name-error"
                        />
                        {!draft.name && formSubmitted && (
                          <p id="name-error" className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría *
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={draft.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {FILTER_CATEGORIES.map(({ value, label }) => (
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
                        placeholder="Descripción del microseguro..."
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
                        <label htmlFor="monthlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                          Precio Mensual *
                        </label>
                        <input
                          type="number"
                          id="monthlyPrice"
                          name="monthlyPrice"
                          value={draft.monthlyPrice}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${draft.monthlyPrice <= 0 && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                          aria-invalid={draft.monthlyPrice <= 0 && formSubmitted ? 'true' : 'false'}
                          aria-describedby="monthlyPrice-error"
                        />
                        {draft.monthlyPrice <= 0 && formSubmitted && (
                          <p id="monthlyPrice-error" className="text-red-500 text-sm mt-1">Debe ser mayor a 0</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="maxCoverage" className="block text-sm font-medium text-gray-700 mb-2">
                          Cobertura Máxima *
                        </label>
                        <input
                          type="number"
                          id="maxCoverage"
                          name="maxCoverage"
                          value={draft.maxCoverage}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${draft.maxCoverage <= 0 && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                          aria-invalid={draft.maxCoverage <= 0 && formSubmitted ? 'true' : 'false'}
                          aria-describedby="maxCoverage-error"
                        />
                        {draft.maxCoverage <= 0 && formSubmitted && (
                          <p id="maxCoverage-error" className="text-red-500 text-sm mt-1">Debe ser mayor a 0</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <select
                          id="color"
                          name="color"
                          value={draft.color}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {COLORS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <FileUploader
                        accept="image"
                        currentUrl={draft.icon}
                        onUpload={handleIconUpload}
                        onRemove={handleRemoveIcon}
                        label="Ícono del Microseguro"
                        required={false}
                        maxSize={5}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beneficios
                      </label>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={benefitsInput}
                            onChange={(e) => setBenefitsInput(e.target.value)}
                            placeholder="Agregar beneficio..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                          />
                          <button
                            type="button"
                            onClick={addBenefit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Agregar
                          </button>
                        </div>
                        {draft.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {draft.benefits.map((benefit, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                              >
                                {benefit}
                                <button
                                  type="button"
                                  onClick={() => removeBenefit(index)}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
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
                        <span>{isPending ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear Microseguro')}</span>
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
const MicrosegurosManagement: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [editing, setEditing] = useState<Microseguro | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  
  const initialDraft: MicroseguroDraft = {
    name: '',
    description: '',
    category: 'salud',
    monthlyPrice: 0,
    maxCoverage: 0,
    benefits: [],
    icon: '',
    color: 'blue',
    isActive: true
  };
  
  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleBenefitsChange,
    handleIconUpload,
    handleRemoveIcon,
    resetForm
  } = useMicroseguroForm(initialDraft, editing, () => setEditing(null));

  const { data: microsegurosResponse, isLoading, refetch } = useMicroseguros({
    search: search || undefined,
    isActive: status !== 'all' ? status === 'active' : undefined,
    category: category !== 'all' ? category : undefined,
    limit: 50
  });

  // 🔍 DEBUG: Log de la respuesta completa
  console.log('🔍 microsegurosResponse:', microsegurosResponse);
  console.log('🔍 microsegurosResponse type:', typeof microsegurosResponse);
  console.log('🔍 microsegurosResponse keys:', microsegurosResponse ? Object.keys(microsegurosResponse) : 'undefined');

  // La respuesta de useMicroseguros ahora es un objeto con { microseguros: Microseguro[], pagination: any }
  // Asegurar que microseguros siempre sea un array válido
  const microseguros: Microseguro[] = Array.isArray(microsegurosResponse?.microseguros) 
    ? microsegurosResponse.microseguros 
    : [];

  // 🔍 DEBUG: Log del array final
  console.log('🔍 microseguros array:', microseguros);
  console.log('🔍 microseguros length:', microseguros.length);

  const { data: stats } = useMicrosegurosStats();
  const createMicroseguro = useCreateMicroseguro();
  const updateMicroseguro = useUpdateMicroseguro();
  const deleteMicroseguro = useDeleteMicroseguro();
  const toggleStatus = useToggleMicroseguroStatus();

  const filteredMicroseguros = useMemo(() => {
    return microseguros.filter((microseguro: Microseguro) => {
      const matchesSearch = search === '' ||
        microseguro.name.toLowerCase().includes(search.toLowerCase()) ||
        microseguro.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || 
        (status === 'active' && microseguro.isActive) || 
        (status === 'inactive' && !microseguro.isActive);
      const matchesCategory = category === 'all' || microseguro.category === category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [microseguros, search, status, category]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as StatusFilter), []);
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as CategoryFilter), []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      const cleanedData: CreateMicroseguroData = {
        ...draft,
        icon: draft.icon.trim() || undefined,
      };

      if (editing) {
        await updateMicroseguro.mutateAsync({ id: editing._id, data: cleanedData });
        toast.success('Microseguro actualizado con éxito');
        setEditing(null);
      } else {
        await createMicroseguro.mutateAsync(cleanedData);
        toast.success('Microseguro creado con éxito');
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving microseguro:', error);
      toast.error('Error al guardar el microseguro');
    } finally {
      setFormSubmitted(false);
    }
  };

  const handleEdit = (microseguro: Microseguro): void => {
    setEditing(microseguro);
    setDraft({
      name: microseguro.name || '',
      description: microseguro.description || '',
      category: microseguro.category || 'salud',
      monthlyPrice: microseguro.monthlyPrice || 0,
      maxCoverage: microseguro.maxCoverage || 0,
      benefits: microseguro.benefits || [],
      icon: microseguro.icon || '',
      color: microseguro.color || 'blue',
      isActive: microseguro.isActive
    });
    setIsFormModalOpen(true);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [microseguroToDelete, setMicroseguroToDelete] = useState<Microseguro | null>(null);

  const handleDelete = (microseguro: Microseguro): void => {
    setMicroseguroToDelete(microseguro);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (microseguroToDelete) {
      try {
        await deleteMicroseguro.mutateAsync(microseguroToDelete._id);
        toast.success('Microseguro eliminado con éxito');
        refetch();
      } catch (error) {
        console.error('Error deleting microseguro:', error);
        toast.error('Error al eliminar el microseguro');
      }
    }
    setIsDeleteModalOpen(false);
    setMicroseguroToDelete(null);
  };

  const handleToggleStatus = async (microseguro: Microseguro): Promise<void> => {
    try {
      await toggleStatus.mutateAsync({ id: microseguro._id, isActive: !microseguro.isActive });
      toast.success(`Microseguro ${!microseguro.isActive ? 'activado' : 'desactivado'} con éxito`);
      refetch();
    } catch (error) {
      console.error('Error toggling microseguro status:', error);
      toast.error('Error al cambiar el estado del microseguro');
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
          <h1 className="text-3xl font-bold text-gray-900">🛡️ Gestión de Microseguros</h1>
          <p className="text-gray-600 mt-2">Administra los microseguros de tu aplicación</p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isLoading}
          type="button"
          aria-label="Actualizar lista de microseguros"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats */}
      <MicrosegurosStatsComponent stats={stats} />

      {/* Filtros */}
      <MicrosegurosFilters
        search={search}
        status={status}
        category={category}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Lista de Microseguros */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Microseguros ({filteredMicroseguros.length})</h2>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Microseguro</span>
          </button>
        </div>
        <MicrosegurosList
          microseguros={filteredMicroseguros}
          isLoading={isLoading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal de Formulario */}
      <MicroseguroFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        draft={draft}
        editing={editing}
        formSubmitted={formSubmitted}
        setFormSubmitted={setFormSubmitted}
        handleInputChange={handleInputChange}
        handleBenefitsChange={handleBenefitsChange}
        handleSubmit={handleSubmit}
        handleIconUpload={handleIconUpload}
        handleRemoveIcon={handleRemoveIcon}
        resetForm={resetForm}
        isPending={createMicroseguro.isPending || updateMicroseguro.isPending}
      />

      {/* Modal de Eliminación */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        microseguroName={microseguroToDelete?.name || ''}
      />
    </div>
  );
};

export default MicrosegurosManagement;