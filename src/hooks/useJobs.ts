import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobsService as jobsService } from '../services';
import toast from 'react-hot-toast';

// Types for jobs (alineados con backend)
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'Presencial' | 'Remoto' | 'Híbrido';
  salary?: string;
  category:
    | 'Tecnología'
    | 'Ventas'
    | 'Administración'
    | 'Servicios'
    | 'Construcción'
    | 'Gastronomía'
    | 'Salud'
    | 'Educación'
    | 'Transporte';
  requirements?: string[];
  contactEmail?: string;
  companyLogo?: string;
  isUrgent?: boolean;
  isActive: boolean;
  applicants: number;
  views: number;
  createdAt?: string;
  expiresAt: string;
}

interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  job: Job;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  resumeUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationRate: number;
  popularCategories: Array<{
    category: string;
    count: number;
    applications: number;
  }>;
  locationStats: Array<{
    city: string;
    count: number;
  }>;
  salaryRanges: Array<{
    range: string;
    count: number;
  }>;
}

export interface CreateJobData extends Record<string, unknown> {
  title: string;
  company: string;
  description: string;
  location: string;
  workType: 'Presencial' | 'Remoto' | 'Híbrido';
  category:
    | 'Tecnología'
    | 'Ventas'
    | 'Administración'
    | 'Servicios'
    | 'Construcción'
    | 'Gastronomía'
    | 'Salud'
    | 'Educación'
    | 'Transporte';
  contactEmail: string;
  salary?: string;
  companyLogo?: string;
  isUrgent?: boolean;
  isActive?: boolean;
  expiresAt?: string; // ISO string
  source?: 'internal' | 'computrabajo' | 'laborum' | 'indeed' | 'linkedin';
  externalId?: string;
  requirements?: string[];
  coordinates?: { latitude?: number; longitude?: number };
}

export interface UpdateJobData extends Partial<CreateJobData> {}

export interface JobFilters extends Record<string, unknown> {
  category?: Job['category'];
  type?: Job['type'];
  location?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface ApplicationFilters extends Record<string, unknown> {
  jobId?: string;
  userId?: string;
  status?: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Hook para obtener todos los trabajos
export const useJobs = (params: JobFilters = {}) => {
  return useQuery<Job[]>({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const response = await jobsService.getAll(params as any);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un trabajo específico
export const useJob = (jobId: string) => {
  return useQuery<Job>({
    queryKey: ['jobs', jobId],
    queryFn: async () => {
      const response = await jobsService.getById(jobId);
      return response.data;
    },
    enabled: !!jobId,
  });
};

// Hook para estadísticas de trabajos
export const useJobsStats = () => {
  return useQuery<JobStats>({
    queryKey: ['jobs-stats'],
    queryFn: async () => {
      const response = await jobsService.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener aplicaciones
export const useJobApplications = (params: ApplicationFilters = {}) => {
  return useQuery<JobApplication[]>({
    queryKey: ['job-applications', params],
    queryFn: async () => {
      const response = await jobsService.getApplications(params);
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Hook para obtener aplicación específica
export const useJobApplication = (applicationId: string) => {
  return useQuery<JobApplication>({
    queryKey: ['job-applications', applicationId],
    queryFn: async () => {
      const response = await jobsService.getApplication(applicationId);
      return response.data;
    },
    enabled: !!applicationId,
  });
};

// Mutations para gestión de trabajos
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Job, Error, CreateJobData>({
    mutationFn: (jobData: CreateJobData) => jobsService.create(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-stats'] });
      toast.success('Trabajo creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear el trabajo';
      toast.error(message);
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Job, Error, { jobId: string; jobData: UpdateJobData }>({
    mutationFn: ({ jobId, jobData }: { jobId: string; jobData: UpdateJobData }) => 
      jobsService.update(jobId, jobData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.jobId] });
      toast.success('Trabajo actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar el trabajo';
      toast.error(message);
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (jobId: string) => jobsService.delete(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-stats'] });
      toast.success('Trabajo eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar el trabajo';
      toast.error(message);
    },
  });
};

// Hook para activar/desactivar trabajo
export const useToggleJobStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Job, Error, { jobId: string; isActive: boolean }>({
    mutationFn: ({ jobId, isActive }: { jobId: string; isActive: boolean }) => 
      jobsService.toggleStatus(jobId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Estado del trabajo actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar estado del trabajo';
      toast.error(message);
    },
  });
};

// Hook para destacar trabajo
export const useFeatureJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Job, Error, string>({
    mutationFn: (jobId: string) => jobsService.feature(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Trabajo destacado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al destacar trabajo';
      toast.error(message);
    },
  });
};

// Mutations para gestión de aplicaciones
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<JobApplication, Error, { applicationId: string; status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected'; notes?: string }>({
    mutationFn: ({ applicationId, status, notes }: { applicationId: string; status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected'; notes?: string }) => 
      jobsService.updateApplicationStatus(applicationId, status, notes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications', variables.applicationId] });
      toast.success('Estado de aplicación actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar estado de aplicación';
      toast.error(message);
    },
  });
};
