import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle } from 'lucide-react';
import type { PremiumSubscription } from '../../../models/premium';

interface RejectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscription: PremiumSubscription | null;
  reason: string;
  setReason: (reason: string) => void;
  isSubmitting: boolean;
}

const RejectPaymentModal: React.FC<RejectPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscription,
  reason,
  setReason,
  isSubmitting,
}) => {
  if (!subscription) return null;

  const getUserName = () => {
    if (!subscription.userId || typeof subscription.userId === 'string') return 'Usuario';
    return subscription.userId.displayName || 'Usuario';
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    Rechazar Pago
                  </Dialog.Title>
                </div>

                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    ¿Estás seguro de que deseas rechazar el pago de{' '}
                    <span className="font-semibold">{getUserName()}</span>?
                  </p>

                  {/* Campo de motivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo del rechazo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ej: Comprobante ilegible, datos incorrectos..."
                      rows={3}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      <strong>Advertencia:</strong> Esta acción cancelará la suscripción y 
                      enviará una notificación al usuario con el motivo del rechazo.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting || !reason.trim()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Rechazando...' : 'Rechazar Pago'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RejectPaymentModal;

