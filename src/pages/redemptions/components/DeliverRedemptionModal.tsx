import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle, Gift } from 'lucide-react';
import type { Redemption } from '../../../models/redemptions';
import type { DeliverRedemptionFormData } from '../../../hooks/useRedemptionsAdmin';

interface DeliverRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  redemption: Redemption | null;
  formData: DeliverRedemptionFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

const DeliverRedemptionModal: React.FC<DeliverRedemptionModalProps> = ({
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

  const getUserName = () => {
    if (!redemption.userId || typeof redemption.userId === 'string') {
      return 'Usuario';
    }
    return redemption.userId.displayName || 'Usuario';
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
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      Marcar como Entregado
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
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">{getProductName()}</div>
                      <div className="text-sm text-gray-600">Código: {redemption.code}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Usuario: <span className="font-semibold">{getUserName()}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Puntos: <span className="font-bold text-blue-600">{redemption.pointsSpent} pts</span>
                  </div>
                  {redemption.station && (
                    <div className="text-sm text-gray-600 mt-2">
                      Estación: <span className="font-semibold">{redemption.station.name}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Código (oculto, auto-rellenado) */}
                  <input
                    type="hidden"
                    name="code"
                    value={formData.code}
                  />

                  {/* Confirmación */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Atención:</strong> ¿Confirmas que el producto ha sido entregado al usuario?
                      Esta acción no se puede deshacer.
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
                      {isSubmitting ? 'Procesando...' : 'Marcar Entregado'}
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

export default DeliverRedemptionModal;





