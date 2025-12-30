import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface OfferDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  offerTitle: string;
}

const OfferDeleteModal: React.FC<OfferDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  offerTitle,
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
                Eliminar Oferta
              </Dialog.Title>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar la oferta &quot;{offerTitle}&quot;? Esta acción no se
                  puede deshacer.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">⚠️ Nota:</span> No podrás eliminar esta oferta si tiene canjes registrados.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={onConfirm}
                >
                  Eliminar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

export default OfferDeleteModal;




