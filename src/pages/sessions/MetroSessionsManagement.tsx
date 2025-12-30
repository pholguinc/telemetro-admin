import React, { useState, useMemo, useCallback, Fragment } from 'react';
import {
  Music,
  Video,
  Users,
  Activity,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  X,
  Eye,
  Calendar,
  Mic,
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import {
  useSessions,
  useLiveSessions,
  useSessionStats,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
} from '../../hooks/useMetroSessions';
import { buildImageUrl } from '../../config/environment';
import FileUploader from '../../components/ui/FileUploader';

// Types
interface MetroSession {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startsAt: string;
  endsAt?: string;
  artist: string;
  genre: string;
  location?: string;
  duration?: number;
  maxAttendees?: number;
  currentAttendees?: number;
  imageUrl?: string;
  audioUrl?: string;
  isLive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SessionDraft {
  title: string;
  description: string;
  artist: string;
  genre: string;
  location: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startsAt: string;
  endsAt: string;
  duration: number;
  maxAttendees: number;
  imageUrl: string;
  audioUrl: string;
  isFeatured: boolean;
}

interface SessionStats {
  total: number;
  scheduled: number;
  active: number;
  completed: number;
  cancelled: number;
  metrics: {
    totalAttendees: number;
    averageAttendance: string;
    totalDuration: number;
  };
  topPerforming: MetroSession[];
}

type StatusFilter = 'all' | 'scheduled' | 'active' | 'completed' | 'cancelled';
type GenreFilter = 'all' | 'fusion' | 'rock' | 'pop' | 'jazz' | 'classical' | 'electronic';

// Constantes para opciones
const SESSION_GENRES = [
  { value: 'fusion', label: 'Fusión' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Clásica' },
  { value: 'electronic', label: 'Electrónica' },
];

const GENRES = [
  { value: 'all', label: 'Todos los géneros' },
  ...SESSION_GENRES,
];

const STATUSES = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'scheduled', label: 'Programadas' },
  { value: 'active', label: 'En vivo' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

const FORM_STATUSES = STATUSES.filter(s => s.value !== 'all');

// Custom hook para lógica del formulario
const useSessionForm = (
  initialDraft: SessionDraft,
  editing: MetroSession | null,
  onReset: () => void
) => {
  const [draft, setDraft] = useState<SessionDraft>(initialDraft);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setDraft((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? checked
            : type === 'number'
            ? parseFloat(value) || 0
            : value,
      }));
    },
    []
  );

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // Usar el servicio de ads para upload (reutilizar infraestructura existente)
      const { AdsService } = await import('../../services');
      const response = await AdsService.uploadFile(file);
      const uploadedUrl = response.data.url;

      if (uploadedUrl.startsWith('data:')) {
        throw new Error(
          'El servidor devolvió datos base64 en lugar de una URL válida'
        );
      }

      setDraft((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      throw error;
    }
  };

  const handleRemoveImage = () =>
    setDraft((prev) => ({ ...prev, imageUrl: '' }));

  const handleAudioUpload = async (file: File): Promise<string> => {
    try {
      const { AdsService } = await import('../../services');
      const response = await AdsService.uploadFile(file);
      const uploadedUrl = response.data.url;

      if (uploadedUrl.startsWith('data:')) {
        throw new Error(
          'El servidor devolvió datos base64 en lugar de una URL válida'
        );
      }

      setDraft((prev) => ({ ...prev, audioUrl: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Error al subir el audio');
      throw error;
    }
  };

  const handleRemoveAudio = () =>
    setDraft((prev) => ({ ...prev, audioUrl: '' }));

  const resetForm = () => {
    setDraft(initialDraft);
    setFormSubmitted(false);
    onReset();
  };

  return {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAudioUpload,
    handleRemoveAudio,
    resetForm,
  };
};

// Subcomponente para Stats
const SessionStatsComponent: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return null;

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Validaciones defensivas para evitar errores
  const safeStats = {
    total: stats.total || stats.sessions?.total || 0,
    scheduled: stats.scheduled || stats.sessions?.scheduled || 0,
    active: stats.active || stats.sessions?.active || 0,
    completed: stats.completed || stats.sessions?.completed || 0,
    totalAttendees: stats.metrics?.totalAttendees || stats.engagement?.totalAttendees || 0,
    averageAttendance: stats.metrics?.averageAttendance || "0",
    totalDuration: stats.metrics?.totalDuration || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {safeStats.total}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Music className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">En Vivo</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {safeStats.active}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <Video className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Asistentes</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {formatNumber(safeStats.totalAttendees)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Duración Total</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {Math.round(safeStats.totalDuration / 60)}h
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Clock className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para Filtros
const SessionFilters: React.FC<{
  search: string;
  status: StatusFilter;
  genre: GenreFilter;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onGenreChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({
  search,
  status,
  genre,
  onSearchChange,
  onStatusChange,
  onGenreChange,
}) => (
  <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <input
        type="text"
        placeholder="Buscar sesiones..."
        value={search}
        onChange={onSearchChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        aria-label="Buscar sesiones por título o descripción"
      />
      <select
        value={status}
        onChange={onStatusChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por estado"
      >
        {STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={genre}
        onChange={onGenreChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por género"
      >
        {GENRES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const MetroSessionsManagement: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [genre, setGenre] = useState<GenreFilter>('all');
  const [editing, setEditing] = useState<MetroSession | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  const initialDraft: SessionDraft = {
    title: '', 
    description: '', 
    artist: '',
    genre: 'fusion',
    location: '',
    status: 'scheduled',
    startsAt: '',
    endsAt: '',
    duration: 60,
    maxAttendees: 100,
    imageUrl: '',
    audioUrl: '',
    isFeatured: false,
  };

  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAudioUpload,
    handleRemoveAudio,
    resetForm,
  } = useSessionForm(initialDraft, editing, () => setEditing(null));

  const {
    data: sessionsResponse,
    isLoading,
    refetch,
  } = useSessions({
    search,
    status: status !== 'all' ? status : undefined,
    genre: genre !== 'all' ? genre : undefined,
    limit: 50,
  });

  const sessions: MetroSession[] = sessionsResponse || [];
  const { data: stats } = useSessionStats();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const createSession = useCreateSession();

  const filteredSessions = useMemo(() => {
    return sessions.filter((session: MetroSession) => {
      const matchesSearch =
        search === '' ||
        session.title.toLowerCase().includes(search.toLowerCase()) ||
        (session.description &&
          session.description.toLowerCase().includes(search.toLowerCase())) ||
        (session.artist &&
          session.artist.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = status === 'all' || session.status === status;
      const matchesGenre = genre === 'all' || session.genre === genre;
      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [sessions, search, status, genre]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setStatus(e.target.value as StatusFilter),
    []
  );
  const handleGenreChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setGenre(e.target.value as GenreFilter),
    []
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      const cleanedData = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        artist: draft.artist.trim() || 'Artista Anónimo',
        genre: draft.genre,
        location: draft.location.trim() || 'Estación Central',
        status: draft.status,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt, // Incluir aunque el modelo no lo soporte aún
        duration: draft.duration,
        maxAttendees: draft.maxAttendees,
        imageUrl: draft.imageUrl,
        audioUrl: draft.audioUrl, // Incluir aunque el modelo no lo soporte aún
        isFeatured: draft.isFeatured, // Incluir aunque el modelo no lo soporte aún
      };

      if (editing) {
        await updateSession.mutateAsync({ sessionId: editing.id, data: cleanedData });
        toast.success('Sesión actualizada con éxito');
        setEditing(null);
      } else {
        await createSession.mutateAsync(cleanedData);
        toast.success('Sesión creada con éxito');
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Error al guardar la sesión');
    } finally {
      setFormSubmitted(false);
    }
  };

  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Convertir a formato datetime-local (YYYY-MM-DDTHH:MM)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleEdit = (session: MetroSession): void => {
    setEditing(session);
    setDraft({
      title: session.title || '',
      description: session.description || '',
      artist: session.artist || '',
      genre: session.genre || 'fusion',
      location: session.location || '',
      status: session.status,
      startsAt: formatDateForInput(session.startsAt),
      endsAt: formatDateForInput(session.endsAt),
      duration: session.duration || 60,
      maxAttendees: session.maxAttendees || 100,
      imageUrl: session.imageUrl || '',
      audioUrl: session.audioUrl || '',
      isFeatured: session.isFeatured || false,
    });

    setIsFormModalOpen(true);
  };

  const handleRefresh = () => refetch();

  const handleCreateNew = () => {
    setEditing(null);
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditing(null);
    resetForm();
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<MetroSession | null>(null);

  const handleDelete = (session: MetroSession): void => {
    setSessionToDelete(session);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      try {
        await deleteSession.mutateAsync(sessionToDelete.id);
        toast.success('Sesión eliminada con éxito');
        refetch();
      } catch (error) {
        console.error('Error deleting session:', error);
        toast.error('Error al eliminar la sesión');
      }
    }
    setIsDeleteModalOpen(false);
    setSessionToDelete(null);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getGenreColor = (genre: string): string => {
    const colors: Record<string, string> = {
      fusion: 'bg-purple-100 text-purple-700',
      rock: 'bg-red-100 text-red-700',
      pop: 'bg-pink-100 text-pink-700',
      jazz: 'bg-blue-100 text-blue-700',
      classical: 'bg-indigo-100 text-indigo-700',
      electronic: 'bg-green-100 text-green-700',
    };
    return colors[genre] || 'bg-gray-100 text-gray-700';
  };

  const error = false; // Placeholder para error handling

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar sesiones
          </h3>
          <p className="text-gray-500 mb-4">No se pudieron cargar las sesiones</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            🎵 Gestión de Sesiones Metro
          </h1>
          <p className="text-gray-600 mt-2">
            Administra sesiones musicales y eventos del metro
                </p>
              </div>
          <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isLoading}
            type="button"
          aria-label="Actualizar lista de sesiones"
          >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
          </button>
      </div>

      {/* Stats */}
      <SessionStatsComponent stats={stats} />

      {/* Filtros */}
      <SessionFilters
        search={search}
        status={status}
        genre={genre}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onGenreChange={handleGenreChange}
      />

      {/* Lista de Sesiones */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Sesiones ({filteredSessions.length})
          </h2>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Sesión</span>
          </button>
      </div>

        {isLoading ? (
            <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando sesiones...</p>
            </div>
        ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron sesiones
              </h3>
              <p className="text-gray-500">
              {sessions.length === 0
                ? 'Crea tu primera sesión'
                : 'Intenta cambiar los filtros'}
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session: MetroSession, index: number) => (
              <div
                key={`session-${session.id || index}`}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Imagen */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {session.imageUrl ? (
                    <img
                      src={buildImageUrl(session.imageUrl)}
                      alt={session.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <Music className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Estado */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {STATUSES.find(s => s.value === session.status)?.label || session.status}
                        </span>
                      </div>
                      
                  {/* Badge de destacado */}
                  {session.isFeatured && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full">
                        ⭐ Destacado
                      </span>
                    </div>
                  )}

                  {/* Duración */}
                  {session.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {session.duration}min
                      </div>
                  )}
                    </div>
                    
                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {session.title}
                  </h3>
                  
                  {session.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  {/* Información del artista */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Mic className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {session.artist || 'Artista desconocido'}
                    </span>
                  </div>

                  {/* Género y fecha */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getGenreColor(
                        session.genre
                      )}`}
                    >
                      {SESSION_GENRES.find(g => g.value === session.genre)?.label || session.genre}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(session.startsAt)}
                    </span>
                      </div>

                  {/* Estadísticas */}
                  {(session.currentAttendees || session.maxAttendees) && (
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {session.currentAttendees || 0}/{session.maxAttendees || 0} asistentes
                      </span>
                    </div>
                  )}
                    
                  {/* Acciones */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(session)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(session)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Modal de Formulario */}
      <SessionFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        draft={draft}
        setDraft={setDraft}
        editing={editing}
        formSubmitted={formSubmitted}
        setFormSubmitted={setFormSubmitted}
        handleInputChange={handleInputChange}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        handleAudioUpload={handleAudioUpload}
        handleRemoveAudio={handleRemoveAudio}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        isPending={createSession.isPending || updateSession.isPending}
      />

      {/* Modal de Eliminación */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        sessionTitle={sessionToDelete?.title || ''}
      />
    </div>
  );
};

// Modal de Confirmación de Eliminación
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionTitle: string;
}> = ({ isOpen, onClose, onConfirm, sessionTitle }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog className="relative z-50" onClose={onClose}>
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
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Eliminar Sesión
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar la sesión &quot;
                  {sessionTitle}&quot;? Esta acción no se puede deshacer.
            </p>
          </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={onConfirm}
                >
                  Eliminar
                </button>
        </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// Modal de Formulario para Sesiones
const SessionFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  draft: SessionDraft;
  setDraft: React.Dispatch<React.SetStateAction<SessionDraft>>;
  editing: MetroSession | null;
  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleImageUpload: (file: File) => Promise<string>;
  handleRemoveImage: () => void;
  handleAudioUpload: (file: File) => Promise<string>;
  handleRemoveAudio: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  isPending: boolean;
}> = ({
  isOpen,
  onClose,
  draft,
  setDraft,
  editing,
  formSubmitted,
  setFormSubmitted,
  handleInputChange,
  handleImageUpload,
  handleRemoveImage,
  handleAudioUpload,
  handleRemoveAudio,
  handleSubmit,
  resetForm,
  isPending,
}) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !draft.title ||
      !draft.description ||
      !draft.artist ||
      !draft.startsAt
    ) {
      setFormSubmitted(true);
      toast.error('Por favor, completa todos los campos requeridos.');
      return;
    }
    await handleSubmit(e);
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog className="relative z-50" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  {/* Header del Modal */}
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {editing ? 'Editar Sesión' : 'Crear Nueva Sesión'}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Cerrar modal"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={draft.title}
                onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${
                            !draft.title && formSubmitted
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Título de la sesión"
                          required
                        />
                        {!draft.title && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
            </div>

            <div>
                        <label
                          htmlFor="artist"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Artista *
                        </label>
                        <input
                          type="text"
                          id="artist"
                          name="artist"
                          value={draft.artist}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${
                            !draft.artist && formSubmitted
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Nombre del artista"
                          required
                        />
                        {!draft.artist && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={draft.description}
                onChange={handleInputChange}
                rows={3}
                        className={`w-full px-4 py-2 border ${
                          !draft.description && formSubmitted
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                        placeholder="Descripción de la sesión..."
                        required
                      />
                      {!draft.description && formSubmitted && (
                        <p className="text-red-500 text-sm mt-1">Requerido</p>
                      )}
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                        <FileUploader
                          accept="image"
                          currentUrl={draft.imageUrl}
                          onUpload={handleImageUpload}
                          onRemove={handleRemoveImage}
                          label="Imagen de la Sesión"
                          required={false}
                          maxSize={5}
                          className="w-full"
                />
              </div>

              <div>
                        <FileUploader
                          accept="audio"
                          currentUrl={draft.audioUrl}
                          onUpload={handleAudioUpload}
                          onRemove={handleRemoveAudio}
                          label="Audio Preview (Opcional)"
                          required={false}
                          maxSize={10}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label
                          htmlFor="genre"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Género Musical *
                </label>
                        <select
                  id="genre"
                  name="genre"
                  value={draft.genre}
                  onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {SESSION_GENRES.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Estado *
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={draft.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {FORM_STATUSES.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="duration"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Duración (minutos)
                        </label>
                        <input
                          type="number"
                          id="duration"
                          name="duration"
                          value={draft.duration}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max="480"
                />
              </div>
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                        <label
                          htmlFor="startsAt"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Fecha y Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                id="startsAt"
                name="startsAt"
                value={draft.startsAt}
                onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${
                            !draft.startsAt && formSubmitted
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          required
                        />
                        {!draft.startsAt && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
            </div>

                      <div>
                        <label
                          htmlFor="endsAt"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Fecha y Hora de Finalización
                        </label>
                        <input
                          type="datetime-local"
                          id="endsAt"
                          name="endsAt"
                          value={draft.endsAt}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Ubicación
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={draft.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Estación del metro"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="maxAttendees"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Máximo de Asistentes
                        </label>
                        <input
                          type="number"
                          id="maxAttendees"
                          name="maxAttendees"
                          value={draft.maxAttendees}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max="1000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={draft.isFeatured}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Destacar sesión
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end space-x-4">
                      {editing && (
              <button
                type="button"
                          onClick={handleClose}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                          Cancelar
              </button>
                      )}
              <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span>
                          {isPending
                            ? 'Guardando...'
                            : editing
                            ? 'Actualizar'
                            : 'Crear Sesión'}
                </span>
              </button>
            </div>
                  </form>
          </div>
              </Dialog.Panel>
            </Transition.Child>
        </div>
    </div>
      </Dialog>
    </Transition>
  );
};

export default MetroSessionsManagement;
