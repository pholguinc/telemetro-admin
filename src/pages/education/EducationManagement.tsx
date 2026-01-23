import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  Users,
  Award,
  Clock,
  Star,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  PlayCircle,
  TrendingUp
} from 'lucide-react';
import {
  useEducationCourses,
  useEducationStats,
  useFeaturedCourses,
  useEducationCategories,
  useDeleteCourse,
  useUpdateCourse
} from '../../hooks/useEducation';
import CourseModal from '../../components/education/CourseModal';

// Types - Usamos una versión simplificada compatible
interface SimpleCourse {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  lessonsCount?: number;
}

interface EducationStats {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  popularCourses: SimpleCourse[];
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

type CategoryFilter = 'all' | string;
type StatusFilter = 'all' | 'active' | 'inactive';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type PriceFilter = 'all' | 'free' | 'paid';
type SortBy = 'popular' | 'newest' | 'rating' | 'price';

const EducationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<SimpleCourse | null>(null);

  // Queries
  const {
    data: coursesData = [],
    isLoading: coursesLoading,
    refetch: refetchCourses
  } = useEducationCourses({
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
    isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined
  });

  const { data: statsData, isLoading: statsLoading } = useEducationStats();
  const { data: featuredData } = useFeaturedCourses();
  const { data: categoriesData } = useEducationCategories();

  const deleteCourse = useDeleteCourse();
  const updateCourse = useUpdateCourse();

  // Function to map backend course data to frontend format
  const mapCourseData = (backendCourse: any): SimpleCourse => {

    return {
      id: backendCourse._id || backendCourse.id,
      title: backendCourse.title,
      description: backendCourse.description,
      shortDescription: backendCourse.shortDescription || backendCourse.summary,
      longDescription: backendCourse.longDescription || backendCourse.fullDescription || backendCourse.description,
      category: backendCourse.category,
      level: backendCourse.difficulty || backendCourse.level, // Backend uses 'difficulty'
      duration: Number(backendCourse.duration || 0),
      instructor: {
        id: backendCourse.instructor?.id || 'unknown',
        name: backendCourse.instructor?.name || 'Instructor desconocido',
        avatar: backendCourse.instructor?.avatar
      },
      thumbnailUrl: backendCourse.thumbnailUrl,
      trailerVideoUrl: backendCourse.trailerVideoUrl || backendCourse.trailer_video_url || backendCourse.trailer || backendCourse.videoUrl,
      price: Number(backendCourse.price || 0),
      isActive: backendCourse.isActive,
      isFeatured: backendCourse.isFeatured,
      enrollmentCount: Number(backendCourse.enrollmentCount || 0),
      rating: Number(backendCourse.rating?.average || backendCourse.rating || 0),
      reviewCount: Number(backendCourse.rating?.count || backendCourse.reviewCount || 0),
      createdAt: backendCourse.createdAt,
      updatedAt: backendCourse.updatedAt,
      tags: Array.isArray(backendCourse.tags) ? backendCourse.tags : [],
      status: backendCourse.status,
      lessonsCount: backendCourse.lessonsCount
    };
  };

  // Safely extract and map courses array
  const rawCourses = Array.isArray(coursesData)
    ? coursesData
    : Array.isArray((coursesData as any)?.courses)
      ? (coursesData as any).courses
      : Array.isArray((coursesData as any)?.data)
        ? (coursesData as any).data
        : [];

  const courses: SimpleCourse[] = rawCourses.map(mapCourseData);

  const stats: EducationStats | undefined = statsData;
  const featuredCourses: SimpleCourse[] = Array.isArray(featuredData)
    ? featuredData
    : Array.isArray((featuredData as any)?.data)
      ? (featuredData as any).data
      : [];

  const categories: Category[] = Array.isArray((categoriesData as any)?.categories)
    ? (categoriesData as any).categories
    : [];

  // Filtrar y ordenar cursos - Validación adicional
  const filteredCourses = Array.isArray(courses) && courses.length > 0 ? courses.filter((course: SimpleCourse) => {
    // Validar que course es un objeto válido
    if (!course || typeof course !== 'object') {
      console.warn('⚠️ Invalid course object:', course);
      return false;
    }

    const title = course.title || '';
    const description = course.description || '';
    const category = course.category || '';
    const level = course.level || 'beginner';
    const price = course.price || 0;
    const isActive = course.isActive !== undefined ? course.isActive : true;

    const matchesSearch = searchTerm === '' ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? isActive : !isActive);
    const matchesDifficulty = difficultyFilter === 'all' || level === difficultyFilter;
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'free' ? price === 0 : price > 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty && matchesPrice;
  }) : [];

  // Ordenar cursos - Validación adicional
  const sortedCourses = Array.isArray(filteredCourses) ? [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.price - b.price;
      case 'popular':
      default:
        return b.enrollmentCount - a.enrollmentCount;
    }
  }) : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setCategoryFilter(e.target.value as CategoryFilter);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as StatusFilter);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setDifficultyFilter(e.target.value as DifficultyFilter);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as SortBy);
  };

  const handleCreateCourse = (): void => {
    setEditingCourse(null);
    setIsCreateModalOpen(true);
  };

  const handleEditCourse = (course: SimpleCourse): void => {
    setEditingCourse(course);
    setIsCreateModalOpen(true);
  };

  const handleDeleteCourse = async (course: SimpleCourse): Promise<void> => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el curso "${course.title}"?`)) {
      try {
        await deleteCourse.mutateAsync(course.id);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleToggleCourseStatus = async (course: SimpleCourse): Promise<void> => {
    try {
      await updateCourse.mutateAsync({
        courseId: course.id,
        courseData: { isActive: !course.isActive }
      });
    } catch (error) {
      console.error('Error toggling course status:', error);
    }
  };

  const handleCloseModal = (): void => {
    setIsCreateModalOpen(false);
    setEditingCourse(null);
  };

  const handleRefresh = (): void => {
    refetchCourses();
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getDifficultyColor = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPrice = (price: number): string => {
    return price === 0 ? 'Gratis' : `S/ ${price.toFixed(2)}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Si hay error crítico, mostrar mensaje de error
  if (coursesLoading && !courses.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página de educación...</p>
          <p className="text-xs text-gray-500 mt-2">Si esto tarda mucho, revisa la consola para más detalles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Gestión de Educación</h1>
          <p className="text-gray-600 mt-2">
            Administra cursos y contenido educativo
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={coursesLoading}
            type="button"
          >
            <RefreshCw className={`h-5 w-5 ${coursesLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleCreateCourse}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Curso</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cursos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inscripciones</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatNumber(stats.totalEnrollments)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Completación</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.completionRate ? `${stats.completionRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  S/ {formatNumber(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input-field pl-10 w-full"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="input-field w-auto"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category, index) => (
              <option key={category.name || index} value={category.name}>
                {category.name} ({category.courseCount} cursos)
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={handleDifficultyChange}
            className="input-field w-auto"
          >
            <option value="all">Todas las dificultades</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>

          <select
            value={sortBy}
            onChange={handleSortChange}
            className="input-field w-auto"
          >
            <option value="popular">Más populares</option>
            <option value="newest">Más recientes</option>
            <option value="rating">Mejor valorados</option>
            <option value="price">Precio</option>
          </select>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Cursos ({sortedCourses.length})
          </h2>
        </div>

        {coursesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando cursos...</p>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron cursos
            </h3>
            <p className="text-gray-500 mb-4">
              {courses.length === 0 ? 'Crea tu primer curso' : 'Intenta cambiar los filtros'}
            </p>
            {courses.length === 0 && (
              <button
                onClick={handleCreateCourse}
                className="btn-primary flex items-center space-x-2 mx-auto"
                type="button"
              >
                <Plus className="h-5 w-5" />
                <span>Crear Primer Curso</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course: SimpleCourse) => (
              <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
                {/* Imagen del curso */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                      <BookOpen className="h-16 w-16 text-blue-400" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3">
                    {course.isFeatured && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full">
                        ⭐ Destacado
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {course.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {course.trailerVideoUrl && (
                    <a
                      href={course.trailerVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
                      onClick={(e) => e.stopPropagation()}
                      title="Ver trailer del curso"
                    >
                      <PlayCircle className="h-14 w-14 text-white drop-shadow-lg transform scale-95 group-hover:scale-110 transition-transform duration-300" />
                    </a>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1 mr-2">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Metadatos */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(course.level)}`}>
                      {course.level}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(course.duration)}
                    </span>
                  </div>

                  {/* Estadísticas */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollmentCount} estudiantes
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {(typeof course.rating === 'number' ? course.rating : 0).toFixed(1)} ({course.reviewCount})
                    </span>
                  </div>

                  {/* Precio e instructor */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-lg text-gray-900">
                      {formatPrice(course.price)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {course.instructor.name}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-1"
                      type="button"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleToggleCourseStatus(course)}
                      className={`px-3 py-2 rounded-lg transition-colors ${course.isActive
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                        }`}
                      title={course.isActive ? 'Desactivar' : 'Activar'}
                      type="button"
                    >
                      {course.isActive ? '⏸️' : '▶️'}
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Card para crear nuevo curso */}
            {searchTerm === '' && categoryFilter === 'all' && (
              <div
                onClick={handleCreateCourse}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group min-h-[400px]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCreateCourse();
                  }
                }}
              >
                <Plus className="h-12 w-12 text-gray-400 group-hover:text-gray-600 mb-4 transition-colors" />
                <h3 className="font-medium text-gray-900 mb-2">Crear Nuevo Curso</h3>
                <p className="text-sm text-gray-500 text-center">
                  Crea contenido educativo para tu plataforma
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <CourseModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        course={editingCourse as any}
      />
    </div>
  );
};

export default EducationManagement;