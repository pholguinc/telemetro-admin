import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useCreateJob, useUpdateJob } from '../../../hooks/useJobs';
import type { Job as ApiJob } from '../../../hooks/useJobs';

// Types
type Job = ApiJob;

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob?: Job | null;
}

const JobFormModal: React.FC<JobFormModalProps> = ({ isOpen, onClose, editingJob }) => {
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    workType: 'Presencial' as 'Presencial' | 'Remoto' | 'Híbrido',
    category: 'Tecnología' as 'Tecnología' | 'Ventas' | 'Administración' | 'Servicios' | 'Construcción' | 'Gastronomía' | 'Salud' | 'Educación' | 'Transporte',
    contactEmail: '',
    salary: '',
    companyLogo: '',
    isUrgent: false,
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    requirementsText: ''
  });

  // Reset form when modal opens/closes or editing job changes
  useEffect(() => {
    if (isOpen) {
      if (editingJob) {
        setFormData({
          title: editingJob.title,
          company: editingJob.company,
          description: editingJob.description,
          location: typeof (editingJob as any).location === 'string' 
            ? (editingJob as any).location 
            : `${(editingJob as any).location?.city || ''}${(editingJob as any).location?.country ? ', ' + (editingJob as any).location.country : ''}`,
          workType: (editingJob as any).type as any,
          category: (editingJob as any).category || 'Tecnología',
          contactEmail: (editingJob as any).contactEmail || '',
          salary: (editingJob as any).salary || '',
          companyLogo: (editingJob as any).companyLogo || '',
          isUrgent: (editingJob as any).isUrgent ?? false,
          isActive: (editingJob as any).isActive ?? true,
          expiresAt: (editingJob as any).expiresAt 
            ? new Date((editingJob as any).expiresAt).toISOString().slice(0, 16) 
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          requirementsText: Array.isArray((editingJob as any).requirements) 
            ? (editingJob as any).requirements.join('\n') 
            : ''
        });
      } else {
        setFormData({
          title: '',
          company: '',
          description: '',
          location: '',
          workType: 'Presencial',
          category: 'Tecnología',
          contactEmail: '',
          salary: '',
          companyLogo: '',
          isUrgent: false,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          requirementsText: ''
        });
      }
    }
  }, [isOpen, editingJob]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requirements = formData.requirementsText
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);

    const payload: any = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      workType: formData.workType,
      category: formData.category,
      contactEmail: formData.contactEmail.trim(),
      salary: formData.salary.trim() || undefined,
      companyLogo: formData.companyLogo.trim() || undefined,
      isUrgent: formData.isUrgent,
      isActive: formData.isActive,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      requirements: requirements.length ? requirements : undefined,
      source: 'internal'
    };

    // Clean undefined values
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    try {
      if (editingJob) {
        await updateJob.mutateAsync({ jobId: editingJob.id, jobData: payload });
      } else {
        await createJob.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isLoading = createJob.isPending || updateJob.isPending;

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    {editingJob ? 'Editar Empleo' : 'Crear Nuevo Empleo'}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                    disabled={isLoading}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Desarrollador Frontend"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: TechCorp"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Describe las responsabilidades y características del puesto..."
                    />
                  </div>

                  {/* Ubicación y modalidad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Lima, Perú"
                      />
                    </div>
                    <div>
                      <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-2">
                        Modalidad <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="workType"
                        name="workType"
                        required
                        value={formData.workType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Presencial">Presencial</option>
                        <option value="Remoto">Remoto</option>
                        <option value="Híbrido">Híbrido</option>
                      </select>
                    </div>
                  </div>

                  {/* Categoría y contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Tecnología">Tecnología</option>
                        <option value="Ventas">Ventas</option>
                        <option value="Administración">Administración</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Construcción">Construcción</option>
                        <option value="Gastronomía">Gastronomía</option>
                        <option value="Salud">Salud</option>
                        <option value="Educación">Educación</option>
                        <option value="Transporte">Transporte</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contacto <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                  </div>

                  {/* Salario y logo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                        Salario
                      </label>
                      <input
                        id="salary"
                        name="salary"
                        type="text"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="S/ 2500 - S/ 3500"
                      />
                    </div>
                    <div>
                      <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700 mb-2">
                        Logo de empresa (URL)
                      </label>
                      <input
                        id="companyLogo"
                        name="companyLogo"
                        type="url"
                        value={formData.companyLogo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://ejemplo.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Fecha de expiración */}
                  <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de expiración <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="expiresAt"
                      name="expiresAt"
                      type="datetime-local"
                      required
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Requisitos */}
                  <div>
                    <label htmlFor="requirementsText" className="block text-sm font-medium text-gray-700 mb-2">
                      Requisitos
                    </label>
                    <textarea
                      id="requirementsText"
                      name="requirementsText"
                      rows={4}
                      value={formData.requirementsText}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Ingresa los requisitos, uno por línea o separados por coma..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separa cada requisito en una nueva línea o con comas
                    </p>
                  </div>

                  {/* Opciones */}
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isUrgent"
                        checked={formData.isUrgent}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Empleo urgente</span>
                    </label>
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Activo</span>
                    </label>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Guardando...' : (editingJob ? 'Actualizar Empleo' : 'Crear Empleo')}
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

export default JobFormModal;




