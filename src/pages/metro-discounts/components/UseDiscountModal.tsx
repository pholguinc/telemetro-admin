import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle, Ticket } from 'lucide-react';
import type { MetroDiscount } from '../../../models/metro-discount';
import type { UseDiscountFormData } from '../../../hooks/useMetroDiscount';

interface UseDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  discount: MetroDiscount | null;
  formData: UseDiscountFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

const UseDiscountModal: React.FC<UseDiscountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  discount,
  formData,
  handleInputChange,
  isSubmitting,
}) => {
  if (!discount) return null;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Ticket className="w-6 h-6 text-blue-600" />
                    </div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      Usar Descuento
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Información del descuento */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {discount.discountCode}
                    </div>
                    <div className="text-lg font-semibold text-blue-600 mb-2">
                      {discount.discountValue}% de descuento
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="line-through">S/ {discount.originalPrice.toFixed(2)}</span>
                      {' → '}
                      <span className="font-bold text-green-600">S/ {discount.finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* ID del Operador */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID del Operador
                    </label>
                    <input
                      type="text"
                      name="operatorId"
                      value={formData.operatorId}
                      onChange={handleInputChange}
                      placeholder="Ej: OP001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Estación donde se usó */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estación
                    </label>
                    <input
                      type="text"
                      name="stationUsed"
                      value={formData.stationUsed}
                      onChange={handleInputChange}
                      placeholder="Ej: Villa El Salvador"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Advertencia */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Atención:</strong> Esta acción marcará el descuento como usado y no se puede revertir.
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
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isSubmitting ? 'Procesando...' : 'Usar Descuento'}
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

export default UseDiscountModal;








