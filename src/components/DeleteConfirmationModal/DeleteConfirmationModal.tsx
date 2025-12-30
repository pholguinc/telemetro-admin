// src/components/shared/DeleteConfirmationModal.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Loader } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string; // ✅ Cambié productName → itemName
  isDeleting?: boolean; // ✅ Agregué loading state
  title?: string; // ✅ Título personalizable
  message?: string; // ✅ Mensaje personalizable
  warning?: string; // ✅ Advertencia personalizable
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false,
  title = 'Eliminar Item',
  message,
  warning,
}) => (
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
                {title}
              </Dialog.Title>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-500">
                  {message || `¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`}
                </p>
                {warning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">⚠️ Nota:</span> {warning}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                  onClick={onConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

export default DeleteConfirmationModal;