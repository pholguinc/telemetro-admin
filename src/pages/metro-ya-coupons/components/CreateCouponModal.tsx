import React, { useState } from 'react';
import { X, Plus, Info } from 'lucide-react';
import type { CreateMetroYaCouponRequest, MetroYaCouponTemplate } from '../../../models/metro-ya-coupon';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMetroYaCouponRequest) => void;
  formData: CreateMetroYaCouponRequest;
  handleInputChange: (field: keyof CreateMetroYaCouponRequest, value: any) => void;
  isSubmitting: boolean;
  templates?: MetroYaCouponTemplate[];
  loadTemplate?: (template: MetroYaCouponTemplate) => void;
}

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  handleInputChange,
  isSubmitting,
  templates = [],
  loadTemplate,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const benefitTypes = [
    { value: 'discount_percentage', label: 'Descuento por porcentaje' },
    { value: 'discount_fixed', label: 'Descuento fijo' },
    { value: 'free_trip', label: 'Viaje gratis' },
    { value: 'points_bonus', label: 'Bonus de puntos' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const categories = [
    { value: 'transport', label: 'Transporte' },
    { value: 'discount', label: 'Descuentos' },
    { value: 'special', label: 'Especiales' },
    { value: 'bonus', label: 'Bonificaciones' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTemplateSelect = (template: MetroYaCouponTemplate) => {
    if (loadTemplate) {
      loadTemplate(template);
    }
    setShowTemplates(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Cupón</h3>
              <p className="text-sm text-gray-500">Configura los detalles del cupón Metro Ya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Templates Section */}
        {templates.length > 0 && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              <Info className="w-4 h-4" />
              <span>Usar plantilla predefinida</span>
            </button>
            
            {showTemplates && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.key}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{template.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{template.title}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código del Cupón *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="VIAJE-GRATIS-2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Solo letras, números y guiones. Se convertirá a mayúsculas.
              </p>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Viaje Gratis"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Un viaje completamente gratis en cualquier línea del metro"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono
              </label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="🎫"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Beneficio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Beneficio *
              </label>
              <select
                value={formData.benefitType}
                onChange={(e) => handleInputChange('benefitType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                {benefitTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campos específicos según el tipo de beneficio */}
            {formData.benefitType === 'discount_percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage || ''}
                    onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value))}
                    placeholder="20"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                </div>
              </div>
            )}

            {formData.benefitType === 'discount_fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de Descuento *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">S/</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountAmount || ''}
                    onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value))}
                    placeholder="5.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {formData.benefitType === 'points_bonus' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puntos Bonus *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pointsBonus || ''}
                  onChange={(e) => handleInputChange('pointsBonus', parseInt(e.target.value))}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Usos máximos por ciclo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usos Máximos por Ciclo
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUsesPerCycle || 1}
                onChange={(e) => handleInputChange('maxUsesPerCycle', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Orden de visualización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden de Visualización
              </label>
              <input
                type="number"
                min="0"
                value={formData.displayOrder || 0}
                onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fechas de validez */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válido Desde
              </label>
              <input
                type="datetime-local"
                value={formData.validFrom || ''}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válido Hasta
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil || ''}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Cupón'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCouponModal;



