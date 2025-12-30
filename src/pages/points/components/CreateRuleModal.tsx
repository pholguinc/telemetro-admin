import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useCreateRule } from '../../../hooks/usePointsRules';
import { CreateRuleData } from '../../../models/points-rules';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ isOpen, onClose }) => {
  const createRuleMutation = useCreateRule();

  const [formData, setFormData] = useState<CreateRuleData>({
    action: '',
    pointsAwarded: 0,
    dailyLimit: undefined,
    cooldownMinutes: undefined,
    multipliers: {
      premium: 1,
      weekend: 1,
      special: 1,
    },
    description: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar valores opcionales vacíos
    const dataToSend: CreateRuleData = {
      ...formData,
      dailyLimit: formData.dailyLimit || undefined,
      cooldownMinutes: formData.cooldownMinutes || undefined,
    };

    await createRuleMutation.mutateAsync(dataToSend);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      action: '',
      pointsAwarded: 0,
      dailyLimit: undefined,
      cooldownMinutes: undefined,
      multipliers: {
        premium: 1,
        weekend: 1,
        special: 1,
      },
      description: '',
      isActive: true,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Crear Nueva Regla de Puntos
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Acción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acción <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      placeholder="Ej: game_win, daily_login, share_content"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe cuándo se aplica esta regla"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Puntos Otorgados */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puntos Otorgados <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="10000"
                      value={formData.pointsAwarded}
                      onChange={(e) => setFormData({ ...formData, pointsAwarded: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Límite Diario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Límite Diario (opcional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={formData.dailyLimit || ''}
                      onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Veces al día que se puede aplicar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Cooldown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cooldown (minutos)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={formData.cooldownMinutes || ''}
                      onChange={(e) => setFormData({ ...formData, cooldownMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Tiempo mínimo entre aplicaciones"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Multiplicadores */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Multiplicadores</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Premium</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={formData.multipliers?.premium || 1}
                          onChange={(e) => setFormData({
                            ...formData,
                            multipliers: {
                              ...formData.multipliers,
                              premium: parseFloat(e.target.value) || 1
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Fin de Semana</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={formData.multipliers?.weekend || 1}
                          onChange={(e) => setFormData({
                            ...formData,
                            multipliers: {
                              ...formData.multipliers,
                              weekend: parseFloat(e.target.value) || 1
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Especial</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={formData.multipliers?.special || 1}
                          onChange={(e) => setFormData({
                            ...formData,
                            multipliers: {
                              ...formData.multipliers,
                              special: parseFloat(e.target.value) || 1
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estado Activo */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Activar regla inmediatamente
                    </label>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={createRuleMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createRuleMutation.isPending ? 'Creando...' : 'Crear Regla'}
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

export default CreateRuleModal;





