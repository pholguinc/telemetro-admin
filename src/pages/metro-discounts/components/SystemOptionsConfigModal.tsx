import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Settings, DollarSign, Users } from 'lucide-react';

interface SystemOptionsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  options: Record<string, any>;
  onOptionChange: (key: string, field: string, value: any) => void;
  isSubmitting: boolean;
}

const SystemOptionsConfigModal: React.FC<SystemOptionsConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  options,
  onOptionChange,
  isSubmitting,
}) => {
  const optionKeys = Object.keys(options);

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Configuración de Opciones del Sistema
                    </div>
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Settings className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Configuración de Opciones por Defecto
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Estas son las opciones de descuento que aparecen por defecto en el sistema.
                            Los usuarios pueden canjear estas opciones usando sus puntos.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {optionKeys.map((key) => {
                      const option = options[key];
                      return (
                        <div key={key} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-medium text-gray-900 capitalize">
                              {key.replace(/_/g, ' ')}
                            </h4>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={option.enabled}
                                onChange={(e) => onOptionChange(key, 'enabled', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-700">
                                Habilitado
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Puntos Requeridos
                              </label>
                              <input
                                type="number"
                                value={option.points}
                                onChange={(e) => onOptionChange(key, 'points', Number(e.target.value))}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Porcentaje de Descuento
                              </label>
                              <input
                                type="number"
                                value={option.discount}
                                onChange={(e) => onOptionChange(key, 'discount', Number(e.target.value))}
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={option.premiumOnly}
                                onChange={(e) => onOptionChange(key, 'premiumOnly', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-700">
                                Solo Premium
                              </label>
                            </div>
                          </div>

                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span className="font-medium">Ahorro estimado:</span>
                              <span className="ml-2">
                                Viaje simple: S/ {((2.5 * option.discount) / 100).toFixed(2)} | 
                                Ida y vuelta: S/ {((5.0 * option.discount) / 100).toFixed(2)} | 
                                Pase mensual: S/ {((65.0 * option.discount) / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
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

export default SystemOptionsConfigModal;


