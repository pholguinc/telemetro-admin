import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Users, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useJobs, useJobsStats, useDeleteJob } from '../../hooks/useJobs';
import type { Job as ApiJob } from '../../hooks/useJobs';
import JobFormModal from './components/JobFormModal';

// Types
type Job = ApiJob;

type StatusFilter = 'all' | 'active' | 'inactive' | 'expired';
type CategoryFilter = 'all' | 'Tecnología' | 'Ventas' | 'Administración' | 'Servicios' | 'Construcción' | 'Gastronomía' | 'Salud' | 'Educación' | 'Transporte';

const JobsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { data: jobs = [], isLoading, error, refetch } = useJobs({
    search: searchTerm,
    isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined
  });

  const { data: stats } = useJobsStats();
  const deleteJob = useDeleteJob();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as StatusFilter);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setCategoryFilter(e.target.value as CategoryFilter);
  };

  const handleRefresh = (): void => {
    refetch();
  };

  const handleCreateJob = (): void => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: Job): void => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJob = async (job: Job): Promise<void> => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${job.title}"?`)) {
      try {
        await deleteJob.mutateAsync(job.id);
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const formatSalary = (salary?: string): string => {
    return salary && salary.trim() ? salary : 'No especificado';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Tecnología': 'bg-blue-100 text-blue-700',
      'Ventas': 'bg-green-100 text-green-700',
      'Administración': 'bg-yellow-100 text-yellow-700',
      'Servicios': 'bg-purple-100 text-purple-700',
      'Construcción': 'bg-indigo-100 text-indigo-700',
      'Gastronomía': 'bg-red-100 text-red-700',
      'Salud': 'bg-orange-100 text-orange-700',
      'Educación': 'bg-teal-100 text-teal-700',
      'Transporte': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Presencial': 'bg-green-100 text-green-700',
      'Remoto': 'bg-blue-100 text-blue-700',
      'Híbrido': 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar empleos</h3>
          <p className="text-gray-500 mb-4">No se pudieron cargar los empleos</p>
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Intentar de nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💼 Buscas Chamba?</h1>
          <p className="text-gray-600 mt-2">
            Gestiona ofertas laborales y aplicaciones
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={isLoading}
            type="button"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          
          <button
            onClick={handleCreateJob}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Empleo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeJobs}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aplicaciones</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalApplications}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Aplicación</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {stats.applicationRate ? `${stats.applicationRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Buscar empleos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="input-field flex-1"
          />
          
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="input-field w-auto"
          >
            <option value="all">Todas las categorías</option>
            <option value="technology">Tecnología</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Ventas</option>
            <option value="design">Diseño</option>
            <option value="finance">Finanzas</option>
            <option value="healthcare">Salud</option>
            <option value="education">Educación</option>
            <option value="other">Otros</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="input-field w-auto"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="expired">Expirados</option>
          </select>
        </div>
      </div>

      {/* Lista de empleos */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Empleos ({jobs.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando empleos...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay empleos
            </h3>
            <p className="text-gray-500">
              Las ofertas laborales aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: Job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {/* Logo de la empresa */}
                      {job.companyLogo && (
                        <div className="flex-shrink-0">
                          <img
                            src={job.companyLogo}
                            alt={`Logo de ${job.company}`}
                            className="h-8 w-8 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(job.category)}`}>
                        {job.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(job.type)}`}>
                        {job.type}
                      </span>
                      {job.isUrgent && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          🔥 Urgente
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.company}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatSalary(job.salary as any)}
                      </span>
                      {job.contactEmail && (
                        <span className="flex items-center">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            📧 {job.contactEmail}
                          </span>
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {job.applicants} aplicaciones
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {job.views} vistas
                      </span>
                      {job.createdAt && (<span>Publicado: {formatDate(job.createdAt)}</span>)}
                      <span>Expira: {formatDate(job.expiresAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                      type="button"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingJob={editingJob}
      />
    </div>
  );
};

export default JobsManagement;
