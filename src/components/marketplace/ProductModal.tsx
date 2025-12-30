import React, { useState, useEffect } from 'react';
import { X, Upload, Package, Tag, DollarSign, Hash, Clock, Image } from 'lucide-react';
import { MarketplaceProduct } from '../../models';
import FileUpload from '../common/FileUpload';
import SafeImage from '../common/SafeImage';
import { buildImageUrl } from '../../config/environment';
import { imageService } from '../../services/ImageService';
import toast from 'react-hot-toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: ProductFormData) => void;
  product?: MarketplaceProduct | null;
  isLoading?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  provider: string;
  isActive: boolean;
  validityMinutes?: number;
}

const CATEGORIES = [
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Físico' },
  { value: 'premium', label: 'Premium' },
  { value: 'food', label: 'Comida' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'services', label: 'Servicios' },
  { value: 'other', label: 'Otro' }
];

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: 'digital',
    pointsCost: 0,
    stock: 0,
    imageUrl: '',
    provider: '',
    isActive: true,
    validityMinutes: undefined
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'digital',
        pointsCost: product.pointsCost || 0,
        stock: product.stock || 0,
        imageUrl: product.imageUrl || '',
        provider: product.provider || '',
        isActive: product.isActive ?? true,
        validityMinutes: product.validityMinutes
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'digital',
        pointsCost: 0,
        stock: 0,
        imageUrl: '',
        provider: '',
        isActive: true,
        validityMinutes: undefined
      });
    }
    setErrors({});
    setSelectedFile(null);
  }, [product, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileSelect = async (file: File | null) => {
    setSelectedFile(file);
    
    if (file) {
      setUploadingImage(true);
      try {
        // Subir imagen al servidor
        const imageUrl = await imageService.uploadImage(file);
        setFormData(prev => ({
          ...prev,
          imageUrl
        }));
        toast.success('Imagen subida exitosamente');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Error al subir la imagen');
        // Usar URL temporal como fallback
        const tempUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          imageUrl: tempUrl
        }));
      } finally {
        setUploadingImage(false);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        imageUrl: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.pointsCost <= 0) {
      newErrors.pointsCost = 'El costo en puntos debe ser mayor a 0' as any;
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo' as any;
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'El proveedor es requerido';
    }

    if (formData.category === 'digital' && (!formData.validityMinutes || formData.validityMinutes <= 0)) {
      newErrors.validityMinutes = 'Los productos digitales requieren tiempo de validez' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = { ...formData };
    
    // Si no es digital, remover validityMinutes
    if (formData.category !== 'digital') {
      delete submitData.validityMinutes;
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Editar Producto' : 'Crear Producto'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Imagen del producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="h-4 w-4 inline mr-2" />
              Imagen del Producto
            </label>
            
            {/* Mostrar imagen actual si existe */}
            {formData.imageUrl && !selectedFile && (
              <div className="mb-4">
                <div className="relative inline-block">
                  <SafeImage
                    src={buildImageUrl(formData.imageUrl)}
                    alt="Imagen actual"
                    className="w-32 h-32 object-cover rounded-lg border"
                    fallbackClassName="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg border"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Imagen actual del producto</p>
              </div>
            )}
            
            <FileUpload
              onFileSelect={handleFileSelect}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            />
            
            {uploadingImage && (
              <div className="flex items-center space-x-2 mt-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Subiendo imagen...</span>
              </div>
            )}
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 inline mr-2" />
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Ej: Descuento 20% en Pizza Hut"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-2" />
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                disabled={isLoading}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Describe el producto, términos y condiciones..."
              disabled={isLoading}
            />
          </div>

          {/* Costo y Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Costo en Puntos *
              </label>
              <input
                type="number"
                name="pointsCost"
                value={formData.pointsCost}
                onChange={handleInputChange}
                min="1"
                className={`input-field ${errors.pointsCost ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.pointsCost && (
                <p className="text-red-500 text-sm mt-1">{errors.pointsCost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4 inline mr-2" />
                Stock Disponible *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className={`input-field ${errors.stock ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>

            {formData.category === 'digital' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Validez (minutos) *
                </label>
                <input
                  type="number"
                  name="validityMinutes"
                  value={formData.validityMinutes || ''}
                  onChange={handleInputChange}
                  min="1"
                  className={`input-field ${errors.validityMinutes ? 'border-red-500' : ''}`}
                  placeholder="Ej: 1440 (24 horas)"
                  disabled={isLoading}
                />
                {errors.validityMinutes && (
                  <p className="text-red-500 text-sm mt-1">{errors.validityMinutes}</p>
                )}
              </div>
            )}
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor *
            </label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleInputChange}
              className={`input-field ${errors.provider ? 'border-red-500' : ''}`}
              placeholder="Ej: Pizza Hut, Spotify, Netflix..."
              disabled={isLoading}
            />
            {errors.provider && (
              <p className="text-red-500 text-sm mt-1">{errors.provider}</p>
            )}
          </div>

          {/* Estado activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Producto activo (visible para los usuarios)
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingImage}
              className="btn-primary disabled:opacity-50 flex items-center space-x-2"
            >
              {(isLoading || uploadingImage) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                {uploadingImage ? 'Subiendo imagen...' : 
                 isLoading ? 'Guardando...' : 
                 `${product ? 'Actualizar' : 'Crear'} Producto`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
