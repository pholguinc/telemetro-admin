import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ExternalLink } from 'lucide-react';

interface ProofViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proofUrl: string | null;
}

const ProofViewModal: React.FC<ProofViewModalProps> = ({
  isOpen,
  onClose,
  proofUrl,
}) => {
  if (!proofUrl) return null;

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
          <div className="fixed inset-0 bg-black bg-opacity-75" />
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    Comprobante de Pago
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Abrir en nueva pestaña"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={proofUrl}
                    alt="Comprobante de pago"
                    className="w-full h-auto object-contain max-h-[70vh]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-64">
                            <div class="text-center">
                              <p class="text-gray-600 mb-4">No se pudo cargar la imagen</p>
                              <a href="${proofUrl}" target="_blank" rel="noopener noreferrer" 
                                 class="text-blue-600 hover:underline">
                                Abrir en nueva pestaña
                              </a>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cerrar
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

export default ProofViewModal;





