import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EducationService as educationService } from '../services';
import toast from 'react-hot-toast';

// Types for education
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  materials?: Array<{
    type: 'pdf' | 'video' | 'link';
    title: string;
    url: string;
  }>;
  price: number;
  pointsRequired?: number;
  isActive: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview: boolean;
  materials?: Array<{
    type: 'pdf' | 'link';
    title: string;
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  user: {
    id: string;
    name: string;
    email: string;
  };
  progress: number; // percentage
  completedLessons: string[];
  enrolledAt: string;
  completedAt?: string;
  certificateUrl?: string;
}

interface EducationStats {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  popularCourses: Course[];
  categoryStats: Array<{
    category: string;
    count: number;
    enrollments: number;
  }>;
}

interface CreateCourseData extends Record<string, unknown> {
  title: string;
  description: string;
  category: string;
  // Support both level and difficulty for compatibility
  level?: 'beginner' | 'intermediate' | 'advanced';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  // Support both instructorId and instructor object
  instructorId?: string;
  instructor?: {
    name: string;
    bio: string;
    avatarUrl?: string;
  };
  lessonsCount?: number;
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  price: number;
  pointsRequired?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

interface UpdateCourseData extends Partial<CreateCourseData> { }

interface CreateLessonData extends Record<string, unknown> {
  courseId: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview?: boolean;
}

interface UpdateLessonData extends Partial<CreateLessonData> { }

interface CourseFilters extends Record<string, unknown> {
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  isActive?: boolean;
  isFeatured?: boolean;
  instructorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface EnrollmentFilters extends Record<string, unknown> {
  courseId?: string;
  userId?: string;
  completed?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener todos los cursos
export const useEducationCourses = (params: CourseFilters = {}) => {
  return useQuery<Course[]>({
    queryKey: ['education', 'courses', params],
    queryFn: async () => {
      try {
        const response = await educationService.getAllCourses(params);
        return response.data || [];
      } catch (error) {
        console.error('❌ useEducationCourses - Error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un curso específico
export const useEducationCourse = (courseId: string) => {
  return useQuery<Course>({
    queryKey: ['education', 'courses', courseId],
    queryFn: async () => {
      const response = await educationService.getCourse(courseId);
      return response.data;
    },
    enabled: !!courseId,
  });
};

// Hook para obtener lecciones de un curso
export const useCourseLessons = (courseId: string) => {
  return useQuery<Lesson[]>({
    queryKey: ['education', 'courses', courseId, 'lessons'],
    queryFn: async () => {
      const response = await educationService.getCourseLessons(courseId);
      return response.data || [];
    },
    enabled: !!courseId,
  });
};

// Hook para estadísticas de educación
export const useEducationStats = () => {
  return useQuery<EducationStats>({
    queryKey: ['education', 'stats'],
    queryFn: async () => {
      try {
        const response = await educationService.getGeneralStats();
        return response?.data || {
          totalCourses: 0,
          activeCourses: 0,
          totalEnrollments: 0,
          completionRate: 0,
          totalRevenue: 0,
          popularCourses: []
        };
      } catch (error) {
        console.error('❌ useEducationStats - Error:', error);
        // Retornar datos por defecto en caso de error
        return {
          totalCourses: 0,
          activeCourses: 0,
          totalEnrollments: 0,
          completionRate: 0,
          totalRevenue: 0,
          popularCourses: []
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener inscripciones
export const useEnrollments = (params: EnrollmentFilters = {}) => {
  return useQuery<Enrollment[]>({
    queryKey: ['education', 'enrollments', params],
    queryFn: async () => {
      const response = await educationService.getAllEnrollments(params);
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Mutations para gestión de cursos
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, CreateCourseData>({
    mutationFn: (courseData: CreateCourseData) => educationService.createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'stats'] });
      toast.success('Curso creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear el curso';
      toast.error(message);
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, { courseId: string; courseData: UpdateCourseData }>({
    mutationFn: ({ courseId, courseData }: { courseId: string; courseData: UpdateCourseData }) =>
      educationService.updateCourse(courseId, courseData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'courses', variables.courseId] });
      toast.success('Curso actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar el curso';
      toast.error(message);
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (courseId: string) => educationService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'stats'] });
      toast.success('Curso eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar el curso';
      toast.error(message);
    },
  });
};

// Mutations para gestión de lecciones
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation<Lesson, Error, CreateLessonData>({
    mutationFn: (lessonData: CreateLessonData) => educationService.createLesson(lessonData.courseId, lessonData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'courses', data.courseId, 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'courses', data.courseId] });
      toast.success('Lección creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear la lección';
      toast.error(message);
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation<Lesson, Error, { courseId: string; lessonId: string; lessonData: UpdateLessonData }>({
    mutationFn: ({ courseId, lessonId, lessonData }) =>
      educationService.updateLesson(courseId, lessonId, lessonData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'courses', data.courseId, 'lessons'] });
      toast.success('Lección actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar la lección';
      toast.error(message);
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { lessonId: string; courseId: string }>({
    mutationFn: ({ courseId, lessonId }: { lessonId: string; courseId: string }) =>
      educationService.deleteLesson(courseId, lessonId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'courses', variables.courseId, 'lessons'] });
      toast.success('Lección eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar la lección';
      toast.error(message);
    },
  });
};

// Hook para obtener categorías de educación
export const useEducationCategories = () => {
  return useQuery<Array<{
    id: string;
    name: string;
    description?: string;
    courseCount: number;
    isActive: boolean;
  }>>({
    queryKey: ['education-categories'],
    queryFn: async () => {
      const response = await educationService.getCategories?.();
      return response?.data || [
        // Datos por defecto si el servicio no existe
        { id: '1', name: 'Programación', description: 'Cursos de desarrollo de software', courseCount: 15, isActive: true },
        { id: '2', name: 'Diseño', description: 'Cursos de diseño gráfico y UX/UI', courseCount: 8, isActive: true },
        { id: '3', name: 'Marketing', description: 'Cursos de marketing digital', courseCount: 12, isActive: true },
        { id: '4', name: 'Negocios', description: 'Cursos de administración y emprendimiento', courseCount: 10, isActive: true },
        { id: '5', name: 'Idiomas', description: 'Cursos de idiomas extranjeros', courseCount: 6, isActive: true },
        { id: '6', name: 'Salud', description: 'Cursos de salud y bienestar', courseCount: 4, isActive: true },
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: true,
  });
};

// Hook para obtener cursos destacados
export const useFeaturedCourses = () => {
  return useQuery<Course[]>({
    queryKey: ['education', 'courses', { isFeatured: true }],
    queryFn: async () => {
      const response = await educationService.getFeaturedCourses?.() ||
        await educationService.getAllCourses({ isFeatured: true });
      return response?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
