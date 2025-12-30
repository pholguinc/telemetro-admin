import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader, Image as ImageIcon, Music as MusicIcon } from 'lucide-react';
import { Music, MusicDraft } from '@/hooks/useRadioAI';

interface RadioAiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editing: Music | null;
  draft: MusicDraft;
  formSubmitted: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleImageUpload: (url: string) => void;
  handleRemoveImage: () => void;
  emotions: string[];
  isSubmitting: boolean;
}

const RadioAiFormModal: React.FC<RadioAiFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editing,
  draft,
  formSubmitted,
  handleInputChange,
  handleImageUpload,
  handleRemoveImage,
  emotions,
  isSubmitting,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <Dialog.Title className="text-xl font-bold text-white flex items-center">
                    <MusicIcon className="h-6 w-6 mr-2" />
                    {editing ? 'Editar Música' : 'Nueva Música'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="p-6 space-y-6">
                  {/* Información Básica */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MusicIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Información de la Música
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Título */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={draft.title}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            formSubmitted && !draft.title
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="Ej: Alegría Vibrante"
                        />
                        {formSubmitted && !draft.title && (
                          <p className="mt-1 text-sm text-red-600">El título es requerido</p>
                        )}
                      </div>

                      {/* Emoción */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emoción <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="emotion"
                          value={draft.emotion}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent capitalize ${
                            formSubmitted && !draft.emotion
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">Seleccionar emoción</option>
                          {emotions.map((emotion) => (
                            <option key={emotion} value={emotion} className="capitalize">
                              {emotion}
                            </option>
                          ))}
                        </select>
                        {formSubmitted && !draft.emotion && (
                          <p className="mt-1 text-sm text-red-600">La emoción es requerida</p>
                        )}
                      </div>
                    </div>

                    {/* Subtítulo */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtítulo <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="subtitle"
                        value={draft.subtitle}
                        onChange={handleInputChange}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          formSubmitted && !draft.subtitle
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Ej: Una melodía que eleva el espíritu"
                      />
                      {formSubmitted && !draft.subtitle && (
                        <p className="mt-1 text-sm text-red-600">El subtítulo es requerido</p>
                      )}
                    </div>
                  </div>

                  {/* Imagen */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Imagen de Portada
                    </h3>
                    
                    {/* Preview de Imagen */}
                    {draft.image_url && (
                      <div className="mb-4 relative">
                        <img
                          src={draft.image_url}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Input URL de Imagen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de Imagen
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          name="image_url"
                          value={draft.image_url || ''}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {draft.image_url && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Ingresa la URL de una imagen o déjalo vacío para usar la imagen generada automáticamente
                      </p>
                    </div>
                  </div>

                  {/* Información de Solo Lectura */}
                  {editing && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Información del Sistema
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Track ID:</span>
                          <p className="text-gray-900 font-mono text-xs mt-1 break-all">
                            {editing.trackId}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duración:</span>
                          <p className="text-gray-900 mt-1">
                            {Math.floor(editing.duration / 60)}:{(editing.duration % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Estado:</span>
                          <p className="text-gray-900 mt-1 capitalize">{editing.status}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Creado:</span>
                          <p className="text-gray-900 mt-1">
                            {new Date(editing.createdAt).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nota Informativa */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <MusicIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">ℹ️ Nota:</span> Solo puedes editar los metadatos (título, subtítulo, emoción, imagen). 
                          La música ya fue generada y no se puede modificar el audio.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                      {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
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

export default RadioAiFormModal;