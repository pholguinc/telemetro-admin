import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Package, Tag, DollarSign, Hash, Clock } from 'lucide-react';
import FileUploader from '../../../components/ui/FileUploader';

export interface ProductDraft {
  name: string;
  description: string;
  category: 'digital' | 'physical' | 'premium' | 'food' | 'entertainment' | 'services' | 'other';
  pointsCost: number;
  stock: number;
  imageUrl: string;
  provider: string;
  isActive: boolean;
  validityMinutes?: number;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  provider?: string;
  isActive?: boolean;
  validityMinutes?: number;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ProductDraft;
  editing: Product | null;
  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleImageUpload: (file: File) => Promise<string>;
  handleRemoveImage: () => void;
  resetForm: () => void;
  isPending: boolean;
}

const CATEGORIES = [
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Físico' },
  { value: 'premium', label: 'Premium' },
  { value: 'food', label: 'Comida' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'services', label: 'Servicios' },
  { value: 'other', label: 'Otro' },
];

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  draft,
  editing,
  formSubmitted,
  setFormSubmitted,
  handleInputChange,
  handleSubmit,
  handleImageUpload,
  handleRemoveImage,
  resetForm,
  isPending,
}) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (
      !draft.name ||
      !draft.provider ||
      draft.pointsCost <= 0 ||
      draft.stock < 0 ||
      (draft.category === 'digital' && (!draft.validityMinutes || draft.validityMinutes <= 0))
    ) {
      setFormSubmitted(true);
      return;
    }
    
    await handleSubmit(e);
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
                      {editing ? 'Editar Producto' : 'Crear Nuevo Producto'}
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
                    {/* Imagen del Producto */}
                    <div>
                      <FileUploader
                        accept="image"
                        currentUrl={draft.imageUrl}
                        onUpload={handleImageUpload}
                        onRemove={handleRemoveImage}
                        label="Imagen del Producto"
                        required={false}
                        maxSize={10}
                        className="w-full"
                      />
                    </div>

                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          <Package className="h-4 w-4 inline mr-2" />
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={draft.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${
                            !draft.name && formSubmitted ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Ej: Descuento 20% en Pizza Hut"
                          required
                          aria-invalid={!draft.name && formSubmitted ? 'true' : 'false'}
                          aria-describedby="name-error"
                        />
                        {!draft.name && formSubmitted && (
                          <p id="name-error" className="text-red-500 text-sm mt-1">
                            Requerido
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                          <Tag className="h-4 w-4 inline mr-2" />
                          Categoría *
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={draft.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {CATEGORIES.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={draft.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Describe el producto, términos y condiciones..."
                      />
                    </div>

                    {/* Proveedor */}
                    <div>
                      <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor *
                      </label>
                      <input
                        type="text"
                        id="provider"
                        name="provider"
                        value={draft.provider}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${
                          !draft.provider && formSubmitted ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Ej: Pizza Hut, Spotify, Netflix..."
                        required
                        aria-invalid={!draft.provider && formSubmitted ? 'true' : 'false'}
                        aria-describedby="provider-error"
                      />
                      {!draft.provider && formSubmitted && (
                        <p id="provider-error" className="text-red-500 text-sm mt-1">
                          Requerido
                        </p>
                      )}
                    </div>

                    {/* Costo, Stock y Validez */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="pointsCost" className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="h-4 w-4 inline mr-2" />
                          Costo en Puntos *
                        </label>
                        <input
                          type="number"
                          id="pointsCost"
                          name="pointsCost"
                          value={draft.pointsCost}
                          onChange={handleInputChange}
                          min="1"
                          className={`w-full px-4 py-2 border ${
                            draft.pointsCost <= 0 && formSubmitted ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          required
                          aria-invalid={draft.pointsCost <= 0 && formSubmitted ? 'true' : 'false'}
                          aria-describedby="pointsCost-error"
                        />
                        {draft.pointsCost <= 0 && formSubmitted && (
                          <p id="pointsCost-error" className="text-red-500 text-sm mt-1">
                            Debe ser mayor a 0
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                          <Hash className="h-4 w-4 inline mr-2" />
                          Stock Disponible *
                        </label>
                        <input
                          type="number"
                          id="stock"
                          name="stock"
                          value={draft.stock}
                          onChange={handleInputChange}
                          min="0"
                          className={`w-full px-4 py-2 border ${
                            draft.stock < 0 && formSubmitted ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          required
                          aria-invalid={draft.stock < 0 && formSubmitted ? 'true' : 'false'}
                          aria-describedby="stock-error"
                        />
                        {draft.stock < 0 && formSubmitted && (
                          <p id="stock-error" className="text-red-500 text-sm mt-1">
                            No puede ser negativo
                          </p>
                        )}
                      </div>

                      {draft.category === 'digital' && (
                        <div>
                          <label htmlFor="validityMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="h-4 w-4 inline mr-2" />
                            Validez (minutos) *
                          </label>
                          <input
                            type="number"
                            id="validityMinutes"
                            name="validityMinutes"
                            value={draft.validityMinutes || ''}
                            onChange={handleInputChange}
                            min="1"
                            className={`w-full px-4 py-2 border ${
                              (!draft.validityMinutes || draft.validityMinutes <= 0) && formSubmitted
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Ej: 1440 (24 horas)"
                            required={draft.category === 'digital'}
                            aria-invalid={
                              (!draft.validityMinutes || draft.validityMinutes <= 0) && formSubmitted
                                ? 'true'
                                : 'false'
                            }
                            aria-describedby="validityMinutes-error"
                          />
                          {(!draft.validityMinutes || draft.validityMinutes <= 0) && formSubmitted && (
                            <p id="validityMinutes-error" className="text-red-500 text-sm mt-1">
                              Requerido para productos digitales
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Estado Activo */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={draft.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Producto activo (visible para los usuarios)
                      </label>
                    </div>

                    {/* Botones */}
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
                        <span>{isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Producto'}</span>
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

export default ProductFormModal;




