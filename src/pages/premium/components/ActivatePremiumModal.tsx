import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Gift } from 'lucide-react';
import type { ActivatePremiumFormData, User } from '../../../hooks/usePremium';
import UserSearchDropdown from '@/components/ui/UserSearchDropdown';

interface ActivatePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ActivatePremiumFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleUserSelect: (user: User | null) => void;
  formSubmitted: boolean;
  isSubmitting: boolean;
}

const ActivatePremiumModal: React.FC<ActivatePremiumModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  handleInputChange,
  handleUserSelect,
  formSubmitted,
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      Activar Premium
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* ID de Usuario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Usuario <span className="text-red-500">*</span>
                    </label>
                    <UserSearchDropdown
                      selectedUser={formData.selectedUser}
                      onUserSelect={handleUserSelect}
                      placeholder="Buscar usuario por nombre, username o email..."
                      error={!formData.selectedUser && formSubmitted}
                    />
                    {!formData.selectedUser && formSubmitted && (
                      <p className="text-red-500 text-sm mt-1">Debes seleccionar un usuario</p>
                    )}
                  </div>

                  {/* Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="monthly">Mensual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (meses) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Entre 1 y 12 meses
                    </p>
                  </div>

                  {/* Información */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      <strong>Nota:</strong> Esta acción activará Premium de forma gratuita para el usuario. 
                      Se enviará una notificación automática.
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
                      disabled={isSubmitting || !formData.selectedUser}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Activando...' : 'Activar Premium'}
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

export default ActivatePremiumModal;

