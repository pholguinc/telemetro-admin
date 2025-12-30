import React, { useState, useEffect } from 'react';
import { X, Video, FileText, Tag, Clock, Upload, Play } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import { imageService } from '../../services/ImageService';
import toast from 'react-hot-toast';

interface Clip {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  views: number;
  likes: number;
  comments: number;
  shares: number;
  isFeatured: boolean;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  tags?: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clipData: ClipFormData) => void;
  clip?: Clip | null;
  isLoading?: boolean;
}

export interface ClipFormData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  category: string;
  tags: string[];
  status: 'active' | 'inactive' | 'pending';
}

const CATEGORIES = [
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'education', label: 'Educación' },
  { value: 'sports', label: 'Deportes' },
  { value: 'music', label: 'Música' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'comedy', label: 'Comedia' },
  { value: 'lifestyle', label: 'Estilo de vida' },
  { value: 'news', label: 'Noticias' },
  { value: 'other', label: 'Otro' }
];

const ClipModal: React.FC<ClipModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clip,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ClipFormData>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    category: 'entertainment',
    tags: [],
    status: 'pending'
  });

  const [errors, setErrors] = useState<Partial<ClipFormData>>({});
  const [tagInput, setTagInput] = useState<string>('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState<boolean>(false);

  useEffect(() => {
    if (clip) {
      setFormData({
        title: clip.title || '',
        description: clip.description || '',
        videoUrl: clip.videoUrl || '',
        thumbnailUrl: clip.thumbnailUrl || '',
        duration: clip.duration || 0,
        category: clip.category || 'entertainment',
        tags: clip.tags || [],
        status: clip.status || 'pending'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        duration: 0,
        category: 'entertainment',
        tags: [],
        status: 'pending'
      });
    }
    setErrors({});
    setTagInput('');
  }, [clip, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof ClipFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleThumbnailUpload = async (file: File | null) => {
    if (file) {
      setUploadingThumbnail(true);
      try {
        const imageUrl = await imageService.uploadImage(file);
        setFormData(prev => ({
          ...prev,
          thumbnailUrl: imageUrl
        }));
        toast.success('Thumbnail subido exitosamente');
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
        toast.error('Error al subir thumbnail');
        // Usar URL temporal como fallback
        const tempUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          thumbnailUrl: tempUrl
        }));
      } finally {
        setUploadingThumbnail(false);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        thumbnailUrl: ''
      }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClipFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'La URL del video es requerida';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'La duración debe ser mayor a 0 segundos' as any;
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {clip ? 'Editar Clip' : 'Crear Clip'}
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
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="h-4 w-4 inline mr-2" />
                Título del Clip *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Ej: Tutorial de React Hooks"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Duración (segundos) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Describe el contenido del clip..."
              disabled={isLoading}
            />
          </div>

          {/* URL del video */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Play className="h-4 w-4 inline mr-2" />
              URL del Video *
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              className={`input-field ${errors.videoUrl ? 'border-red-500' : ''}`}
              placeholder="https://example.com/video.mp4"
              disabled={isLoading}
            />
            {errors.videoUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="h-4 w-4 inline mr-2" />
              Thumbnail del Clip
            </label>
            
            {formData.thumbnailUrl && (
              <div className="mb-4">
                <div className="relative inline-block">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-32 h-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Thumbnail actual</p>
              </div>
            )}
            
            <FileUpload
              onFileSelect={handleThumbnailUpload}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            />
            
            {uploadingThumbnail && (
              <div className="flex items-center space-x-2 mt-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Subiendo thumbnail...</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="input-field flex-1"
                placeholder="Agregar tag..."
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary"
                disabled={isLoading || !tagInput.trim()}
              >
                Agregar
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="input-field"
              disabled={isLoading}
            >
              <option value="pending">Pendiente</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
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
              disabled={isLoading || uploadingThumbnail}
              className="btn-primary disabled:opacity-50 flex items-center space-x-2"
            >
              {(isLoading || uploadingThumbnail) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                {uploadingThumbnail ? 'Subiendo thumbnail...' : 
                 isLoading ? 'Guardando...' : 
                 `${clip ? 'Actualizar' : 'Crear'} Clip`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClipModal;

