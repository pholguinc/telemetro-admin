import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Package, Gift } from 'lucide-react';
import type { Redemption } from '../../../models/redemptions';
import type { ConfirmRedemptionFormData } from '../../../hooks/useRedemptionsAdmin';

interface ConfirmRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  redemption: Redemption | null;
  formData: ConfirmRedemptionFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

const ConfirmRedemptionModal: React.FC<ConfirmRedemptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  redemption,
  formData,
  handleInputChange,
  isSubmitting,
}) => {
  // Auto-rellenar el código cuando se abre el modal
  useEffect(() => {
    if (redemption && isOpen) {
      const event = {
        target: {
          name: 'code',
          value: redemption.code,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    }
  }, [redemption, isOpen, handleInputChange]);

  if (!redemption) return null;

  const getProductName = () => {
    if (!redemption.productId || typeof redemption.productId === 'string') {
      return 'Producto';
    }
    return redemption.productId.name;
  };

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
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      Confirmar Canje
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Información del canje */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">{getProductName()}</div>
                      <div className="text-sm text-gray-600">Código: {redemption.code}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Puntos: <span className="font-bold text-blue-600">{redemption.pointsSpent} pts</span>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Código (oculto, auto-rellenado) */}
                  <input
                    type="hidden"
                    name="code"
                    value={formData.code}
                  />

                  {/* Nombre de la Estación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Estación
                    </label>
                    <input
                      type="text"
                      name="stationName"
                      value={formData.stationName}
                      onChange={handleInputChange}
                      placeholder="Ej: Villa El Salvador"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Código de Estación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Estación
                    </label>
                    <input
                      type="text"
                      name="stationCode"
                      value={formData.stationCode}
                      onChange={handleInputChange}
                      placeholder="Ej: VES-01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* ID de Dispositivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID de Dispositivo
                    </label>
                    <input
                      type="text"
                      name="deviceId"
                      value={formData.deviceId}
                      onChange={handleInputChange}
                      placeholder="Ej: DEVICE-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Información */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Al confirmar, el canje pasará a estado "Confirmado" 
                      y podrá ser entregado posteriormente.
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
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Confirmando...' : 'Confirmar Canje'}
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

export default ConfirmRedemptionModal;





