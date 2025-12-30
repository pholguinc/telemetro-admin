import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { useCreateCourse, useUpdateCourse, useEducationCategories } from '../../hooks/useEducation';
import toast from 'react-hot-toast';

// Types
interface Instructor {
  name: string;
  bio: string;
  avatarUrl: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface Course {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  thumbnailUrl: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  instructor: Instructor;
  lessons: Lesson[];
  tags: string[];
}

interface CourseFormData {
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  thumbnailUrl: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  instructor: Instructor;
  lessons: Lesson[];
  tags: string[];
  lessonsCount: number; // Número de lecciones planificadas
  estimatedDuration: number; // Duración estimada en minutos
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
}

interface Category {
  name: string;
  courseCount: number;
  totalEnrollments: number;
  averageRating: number;
  averagePrice: number;
  freeCourses: number;
  paidCourses: number;
}

const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, course = null }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    shortDescription: '',
    longDescription: '',
    category: 'technology',
    difficulty: 'beginner',
    price: 0,
    thumbnailUrl: '',
    status: 'draft',
    isFeatured: false,
    instructor: {
      name: '',
      bio: '',
      avatarUrl: ''
    },
    lessons: [],
    tags: [],
    lessonsCount: 1,
    estimatedDuration: 60
  });

  const [currentTag, setCurrentTag] = useState<string>('');

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useEducationCategories();
  
  // Debug para ver qué está pasando con las categorías
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const categories: Category[] = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
  const isEditing = !!course;
  const isLoading = createCourse.isPending || updateCourse.isPending;

  useEffect(() => {
    if (course && isOpen) {
      setFormData({
        title: course.title || '',
        shortDescription: course.shortDescription || '',
        longDescription: course.longDescription || '',
        category: course.category || 'technology',
        difficulty: course.difficulty || 'beginner',
        price: course.price || 0,
        thumbnailUrl: course.thumbnailUrl || '',
        status: course.status || 'draft',
        isFeatured: course.isFeatured || false,
        instructor: {
          name: course.instructor?.name || '',
          bio: course.instructor?.bio || '',
          avatarUrl: course.instructor?.avatarUrl || ''
        },
        lessons: course.lessons || [],
        tags: course.tags || [],
        lessonsCount: course.lessonsCount || 1,
        estimatedDuration: course.duration || 60
      });
    } else if (isOpen) {
      // Reset form for new course
      setFormData({
        title: '',
        shortDescription: '',
        longDescription: '',
        category: 'technology',
        difficulty: 'beginner',
        price: 0,
        thumbnailUrl: '',
        status: 'draft',
        isFeatured: false,
        instructor: {
          name: '',
          bio: '',
          avatarUrl: ''
        },
        lessons: [],
        tags: [],
        lessonsCount: 1,
        estimatedDuration: 60
      });
    }
  }, [course, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleAddTag = (): void => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleClose = (): void => {
    onClose();
    setCurrentTag('');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    
    if (!formData.shortDescription.trim()) {
      toast.error('La descripción corta es requerida');
      return;
    }
    
    if (!formData.instructor.name.trim()) {
      toast.error('El nombre del instructor es requerido');
      return;
    }
    
    if (!formData.instructor.bio.trim()) {
      toast.error('La biografía del instructor es requerida');
      return;
    }

    try {
      const courseData = {
        title: formData.title,
        description: formData.longDescription || formData.shortDescription,
        shortDescription: formData.shortDescription,
        category: formData.category,
        difficulty: formData.difficulty, // Backend espera 'difficulty', no 'level'
        duration: Math.max(1, formData.estimatedDuration || 60), // Usar duración estimada
        lessonsCount: Math.max(1, formData.lessonsCount || 1),
        instructor: {
          name: formData.instructor.name || 'Instructor por defecto',
          bio: formData.instructor.bio || 'Instructor experimentado en el área',
          avatarUrl: formData.instructor.avatarUrl
        },
        thumbnailUrl: formData.thumbnailUrl,
        price: formData.price,
        status: formData.status,
        isActive: formData.status === 'published',
        isFeatured: formData.isFeatured,
        tags: formData.tags || []
      };

      console.log('🔍 Sending course data:', courseData);

      if (isEditing && course) {
        await updateCourse.mutateAsync({ 
          courseId: course.id, 
          courseData 
        });
      } else {
        await createCourse.mutateAsync(courseData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? '✏️ Editar Curso' : '📚 Crear Nuevo Curso'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Modifica los detalles del curso' : 'Crea un curso educativo para tu plataforma'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Curso *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ej: Introducción a React"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
                required
                disabled={categoriesLoading}
              >
                <option value="">Selecciona una categoría</option>
                {categoriesLoading ? (
                  <option value="" disabled>Cargando categorías...</option>
                ) : categoriesError ? (
                  <option value="" disabled>Error al cargar categorías</option>
                ) : categories && categories.length > 0 ? (
                  categories.map((category, index) => (
                    <option key={category.name || index} value={category.name}>
                      {category.name} ({category.courseCount} cursos)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay categorías disponibles</option>
                )}
              </select>
            </div>
          </div>

          {/* Descripción corta */}
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Corta *
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              rows={2}
              className="input-field resize-none"
              placeholder="Descripción breve del curso..."
              required
            />
          </div>

          {/* Descripción larga */}
          <div>
            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              value={formData.longDescription}
              onChange={handleInputChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Descripción detallada del curso, objetivos, contenido..."
            />
          </div>

          {/* Configuración del curso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio (S/.)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Configuración del contenido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="lessonsCount" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Lecciones *
              </label>
              <input
                type="number"
                id="lessonsCount"
                name="lessonsCount"
                value={formData.lessonsCount}
                onChange={handleInputChange}
                min="1"
                className="input-field"
                placeholder="1"
                required
              />
            </div>

            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                Duración Estimada (min) *
              </label>
              <input
                type="number"
                id="estimatedDuration"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleInputChange}
                min="1"
                className="input-field"
                placeholder="60"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          {/* Instructor */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Instructor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="instructor.name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Instructor *
                </label>
                <input
                  type="text"
                  id="instructor.name"
                  name="instructor.name"
                  value={formData.instructor.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen del Curso
                </label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="instructor.bio" className="block text-sm font-medium text-gray-700 mb-2">
                Biografía del Instructor *
              </label>
              <textarea
                id="instructor.bio"
                name="instructor.bio"
                value={formData.instructor.bio}
                onChange={handleInputChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Experiencia y credenciales del instructor..."
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="input-field flex-1"
                placeholder="Agregar etiqueta..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar</span>
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Opciones adicionales */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Curso destacado</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>
                {isLoading 
                  ? 'Guardando...' 
                  : (isEditing ? 'Actualizar Curso' : 'Crear Curso')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
