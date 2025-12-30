import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, Calendar, Tag, MapPin } from 'lucide-react';
import { GeographicOffer, OfferDraft } from '../../../hooks/useMarketplace';
import FileUploader from '../../../components/ui/FileUploader';
import MapDrawer from '../../../components/ui/MapDrawer';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAnVuIGNlIC3iT0n1I28sjjDZFrHccziDg';

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editing: GeographicOffer | null;
  draft: OfferDraft;
  formSubmitted: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleLocationChange: (location: { type: 'Point' | 'Polygon'; coordinates: number[] | number[][][] }) => void;
  handleImageUpload: (file: File) => Promise<string>;
  handleRemoveImage: () => void;
}

const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editing,
  draft,
  formSubmitted,
  handleInputChange,
  handleLocationChange,
  handleImageUpload,
  handleRemoveImage,
}) => {
  const categoryOptions = [
    { value: 'food_drink', label: 'Comida y Bebidas' },
    { value: 'entertainment', label: 'Entretenimiento' },
    { value: 'transport', label: 'Transporte' },
    { value: 'services', label: 'Servicios' },
    { value: 'shopping', label: 'Compras' },
    { value: 'health', label: 'Salud' },
    { value: 'education', label: 'Educación' },
    { value: 'other', label: 'Otros' },
  ];

  // Calcular fecha mínima para expiración (hoy)
  const today = new Date().toISOString().split('T')[0];

  // Validación: Verificar si location está definida
  const isLocationValid = draft.location && draft.location.type && draft.location.coordinates;

  return (
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                  <Dialog.Title className="text-xl font-semibold text-white flex items-center space-x-2">
                    <MapPin className="w-6 h-6" />
                    <span>{editing ? 'Editar Oferta Geográfica' : 'Nueva Oferta Geográfica'}</span>
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* Información Básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-blue-600" />
                      <span>Información Básica</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título de la Oferta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={draft.title}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej: 2x1 en pizzas medianas"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={draft.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={draft.description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe la oferta en detalle..."
                      />
                    </div>
                  </div>

                  {/* Información del Comerciante */}
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900">Comerciante</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del Comerciante <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="merchantName"
                          value={draft.merchantName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej: Pizza Hut San Isidro"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dirección (opcional)
                        </label>
                        <input
                          type="text"
                          name="merchantAddress"
                          value={draft.merchantAddress}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Av. Principal 123, San Isidro"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detalles de la Oferta */}
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900">Detalles de la Oferta</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          % de Descuento
                        </label>
                        <input
                          type="number"
                          name="discountPercentage"
                          value={draft.discountPercentage || ''}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código de Descuento
                        </label>
                        <input
                          type="text"
                          name="discountCode"
                          value={draft.discountCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="PROMO2024"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Puntos de Recompensa
                        </label>
                        <input
                          type="number"
                          name="pointsReward"
                          value={draft.pointsReward || ''}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>Fecha de Expiración</span>
                        </label>
                        <input
                          type="date"
                          name="expiresAt"
                          value={draft.expiresAt ? draft.expiresAt.split('T')[0] : ''}
                          onChange={handleInputChange}
                          min={today}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Máximo de Canjes
                        </label>
                        <input
                          type="number"
                          name="maxRedemptions"
                          value={draft.maxRedemptions || ''}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Términos y Condiciones
                      </label>
                      <textarea
                        name="termsAndConditions"
                        value={draft.termsAndConditions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Especifica restricciones, horarios, etc..."
                      />
                    </div>
                  </div>

                  {/* Imagen */}
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900">Imagen de la Oferta</h3>
                    <FileUploader
                      currentFileUrl={draft.imageUrl}
                      onUpload={handleImageUpload}
                      onRemove={handleRemoveImage}
                      accept="image/*"
                      label="Imagen de la oferta"
                    />
                  </div>

                  {/* Mapa */}
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <MapDrawer
                      value={draft.location}
                      onChange={handleLocationChange}
                      apiKey={GOOGLE_MAPS_API_KEY}
                      height="400px"
                    />
                    {formSubmitted && !isLocationValid && (
                      <p className="text-sm text-red-600">
                        ⚠️ Debes dibujar o seleccionar un área geográfica en el mapa
                      </p>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={draft.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Oferta activa (visible para los usuarios)
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editing ? 'Actualizar Oferta' : 'Crear Oferta'}</span>
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default OfferFormModal;

