import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, DollarSign } from 'lucide-react';
import type { MetroPricing } from '../../../models/metro-discount';

interface PricingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  pricing: MetroPricing;
  onPriceChange: (tripType: keyof MetroPricing, userType: 'regular' | 'university' | 'school', value: number) => void;
  isSubmitting: boolean;
}

const PricingConfigModal: React.FC<PricingConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pricing,
  onPriceChange,
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      Configuración de Precios
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Viaje Simple */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Viaje Simple</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Regular
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.single_trip.regular}
                            onChange={(e) => onPriceChange('single_trip', 'regular', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Universitario
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.single_trip.university}
                            onChange={(e) => onPriceChange('single_trip', 'university', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Escolar
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.single_trip.school}
                            onChange={(e) => onPriceChange('single_trip', 'school', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ida y Vuelta */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ida y Vuelta</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Regular
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.round_trip.regular}
                            onChange={(e) => onPriceChange('round_trip', 'regular', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Universitario
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.round_trip.university}
                            onChange={(e) => onPriceChange('round_trip', 'university', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Escolar
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.round_trip.school}
                            onChange={(e) => onPriceChange('round_trip', 'school', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pase Mensual */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pase Mensual</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Regular
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.monthly_pass.regular}
                            onChange={(e) => onPriceChange('monthly_pass', 'regular', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Universitario
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.monthly_pass.university}
                            onChange={(e) => onPriceChange('monthly_pass', 'university', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Escolar
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricing.monthly_pass.school}
                            onChange={(e) => onPriceChange('monthly_pass', 'school', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Estos precios se usarán para calcular los descuentos que los usuarios canjean con sus puntos.
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar Precios'}
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

export default PricingConfigModal;








