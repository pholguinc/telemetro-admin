import React, { useState, useMemo, useCallback, Fragment } from "react";
import {
  PlayCircle,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Star,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  X,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import {
  useClips,
  useUpdateClip,
  useDeleteClip,
  useFeatureClip,
  useCreateClip,
  useClipStats,
} from "../../hooks/useClips";
import { buildImageUrl } from "../../config/environment";
import FileUploader from "../../components/ui/FileUploader";
import { ClipsService } from "../../services";

// Types
interface Clip {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string; // Para compatibilidad
  youtubeUrl?: string; // Campo real del backend
  youtubeId?: string;
  thumbnailUrl?: string;
  duration: number;
  userId?: string;
  user?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  creator?: {
    name: string;
    channel: string;
    avatarUrl?: string;
  };
  views: number;
  likes: number;
  comments: number;
  shares: number;
  isFeatured: boolean;
  status: "draft" | "active" | "paused" | "reported" | "removed";
  hashtags?: string[];
  category?: string;
  quality?: "low" | "medium" | "high" | "hd";
  isVertical?: boolean;
  priority?: number;
  createdAt: string;
  updatedAt: string;
}

interface ClipDraft {
  title: string;
  description: string;
  category: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  duration: number;
  creator: {
    name: string;
    channel: string;
    avatarUrl?: string;
  };
  status: "draft" | "active" | "paused" | "reported" | "removed";
  isVertical: boolean;
  quality: "low" | "medium" | "high" | "hd";
  hashtags: string[];
  priority: number;
  isFeatured: boolean;
}

interface ClipStatsLocal {
  total: number;
  active: number;
  pending: number;
  featured: number;
  metrics: {
    totalViews: number;
    totalLikes: number;
    averageEngagement: string;
  };
  topPerforming: Clip[];
}

type StatusFilter =
  | "all"
  | "draft"
  | "active"
  | "paused"
  | "reported"
  | "removed";
type CategoryFilter =
  | "all"
  | "comedy"
  | "music"
  | "dance"
  | "food"
  | "travel"
  | "news"
  | "sports"
  | "education";

// Constantes para opciones
const CLIP_CATEGORIES = [
  { value: "comedy", label: "Comedia" },
  { value: "music", label: "Música" },
  { value: "dance", label: "Baile" },
  { value: "food", label: "Comida" },
  { value: "travel", label: "Viajes" },
  { value: "news", label: "Noticias" },
  { value: "sports", label: "Deportes" },
  { value: "education", label: "Educación" },
];

const CATEGORIES = [
  { value: "all", label: "Todas las categorías" },
  ...CLIP_CATEGORIES,
];

const STATUSES = [
  { value: "all", label: "Todos los estados" },
  { value: "draft", label: "Borradores" },
  { value: "active", label: "Activos" },
  { value: "paused", label: "Pausados" },
  { value: "reported", label: "Reportados" },
  { value: "removed", label: "Removidos" },
];

const FORM_STATUSES = STATUSES.filter((s) => s.value !== "all");

// Custom hook para lógica del formulario
const useClipForm = (
  initialDraft: ClipDraft,
  editing: Clip | null,
  onReset: () => void
) => {
  const [draft, setDraft] = useState<ClipDraft>(initialDraft);
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
          type === "checkbox"
            ? checked
            : type === "number"
            ? parseFloat(value) || 0
            : value,
      }));
    },
    []
  );

  const handleTagsChange = useCallback((tags: string[]) => {
    setDraft((prev) => ({ ...prev, tags }));
  }, []);

  const handleThumbnailUpload = async (file: File): Promise<string> => {
    try {
      // Usar el servicio de ads para upload (reutilizar infraestructura existente)
      const { AdsService } = await import("../../services");
      const response = await AdsService.uploadFile(file);
      const uploadedUrl = response.data.url;

      if (uploadedUrl.startsWith("data:")) {
        throw new Error(
          "El servidor devolvió datos base64 en lugar de una URL válida"
        );
      }

      setDraft((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Error al subir la imagen");
      throw error;
    }
  };

  const handleRemoveThumbnail = () =>
    setDraft((prev) => ({ ...prev, thumbnailUrl: "" }));

  const handleVideoUpload = async (file: File): Promise<string> => {
    try {
      // Usar el servicio de ads para upload de videos
      const { AdsService } = await import("../../services");
      const response = await AdsService.uploadFile(file);
      const uploadedUrl = response.data.url;

      if (uploadedUrl.startsWith("data:")) {
        throw new Error(
          "El servidor devolvió datos base64 en lugar de una URL válida"
        );
      }

      // Generar un youtubeId único basado en el nombre del archivo
      const youtubeId = `clip_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      setDraft((prev) => ({
        ...prev,
        youtubeUrl: uploadedUrl,
        youtubeId: youtubeId,
      }));
      return uploadedUrl;
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Error al subir el video");
      throw error;
    }
  };

  const handleRemoveVideo = () =>
    setDraft((prev) => ({ ...prev, youtubeUrl: "" }));

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
    handleTagsChange,
    handleThumbnailUpload,
    handleRemoveThumbnail,
    handleVideoUpload,
    handleRemoveVideo,
    resetForm,
  };
};

// Subcomponente para Stats
const ClipStatsComponent: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return null;

  const formatNumber = (num: number | undefined): string => {
    if (!num) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Validaciones defensivas para evitar errores
  const safeStats = {
    total: stats.total || stats.clips?.total || 0,
    active: stats.active || stats.clips?.active || 0,
    pending: stats.pending || stats.clips?.pending || 0,
    featured: stats.featured || stats.clips?.featured || 0,
    totalViews: stats.metrics?.totalViews || stats.engagement?.totalViews || 0,
    totalLikes: stats.metrics?.totalLikes || stats.engagement?.totalLikes || 0,
    averageEngagement: stats.metrics?.averageEngagement || "0",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Clips</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {safeStats.total}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <PlayCircle className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Activos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {safeStats.active}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Visualizaciones</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {formatNumber(safeStats.totalViews)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Eye className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Engagement</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {safeStats.averageEngagement}%
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Heart className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para Filtros
const ClipFilters: React.FC<{
  search: string;
  status: StatusFilter;
  category: CategoryFilter;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({
  search,
  status,
  category,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}) => (
  <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <input
        type="text"
        placeholder="Buscar clips..."
        value={search}
        onChange={onSearchChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        aria-label="Buscar clips por título o descripción"
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
        value={category}
        onChange={onCategoryChange}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filtrar por categoría"
      >
        {CATEGORIES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// Componente para Tags Input con chips
const TagsInput: React.FC<{
  label: string;
  placeholder: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  chipColor?: "blue" | "purple";
}> = ({ label, placeholder, tags, onTagsChange, chipColor = "blue" }) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onTagsChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const chipStyles = {
    blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Chips de tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors ${chipStyles[chipColor]}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-2 p-0.5 rounded-full transition-colors hover:bg-opacity-20 hover:bg-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ClipsManagement: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [editing, setEditing] = useState<Clip | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  const initialDraft: ClipDraft = {
    title: "",
    description: "",
    category: "comedy",
    youtubeId: "",
    youtubeUrl: "",
    thumbnailUrl: "",
    duration: 30,
    creator: {
      name: "",
      channel: "",
      avatarUrl: "",
    },
    status: "draft",
    isVertical: true,
    quality: "medium",
    hashtags: [],
    priority: 1,
    isFeatured: false,
  };

  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleTagsChange,
    handleThumbnailUpload,
    handleRemoveThumbnail,
    handleVideoUpload,
    handleRemoveVideo,
    resetForm,
  } = useClipForm(initialDraft, editing, () => setEditing(null));

  const {
    data: clipsResponse,
    isLoading,
    refetch,
  } = useClips({
    search,
    status: status !== "all" ? status : undefined,
    category: category !== "all" ? category : undefined,
    limit: 50,
  });

  const clips: Clip[] = clipsResponse || [];
  const { data: stats } = useClipStats();
  const updateClip = useUpdateClip();
  const deleteClip = useDeleteClip();
  const featureClip = useFeatureClip();
  const createClip = useCreateClip();

  const filteredClips = useMemo(() => {
    return clips.filter((clip: Clip) => {
      const matchesSearch =
        search === "" ||
        clip.title.toLowerCase().includes(search.toLowerCase()) ||
        (clip.description &&
          clip.description.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = status === "all" || clip.status === status;
      const matchesCategory = category === "all" || clip.category === category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [clips, search, status, category]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setStatus(e.target.value as StatusFilter),
    []
  );
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setCategory(e.target.value as CategoryFilter),
    []
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormSubmitted(true);

    // 🔍🔍🔍 LOGS CRÍTICOS DE DEBUG 🔍🔍🔍
    console.log("═══════════════════════════════════");
    console.log("📋 DRAFT COMPLETO:", draft);
    console.log("📹 youtubeUrl en draft:", draft.youtubeUrl);
    console.log("🆔 youtubeId en draft:", draft.youtubeId);
    console.log("═══════════════════════════════════");

    try {
      const cleanedData = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        youtubeId: draft.youtubeId,
        youtubeUrl: draft.youtubeUrl,
        thumbnailUrl:
          draft.thumbnailUrl ||
          "https://via.placeholder.com/640x360.png?text=No+Thumbnail",
        duration: draft.duration,
        creator: {
          name: draft.creator.name.trim() || "Usuario Anónimo",
          channel: draft.creator.channel.trim() || "Canal Desconocido",
          avatarUrl: draft.creator.avatarUrl?.trim() || undefined,
        },
        status: draft.status,
        isVertical: draft.isVertical,
        quality: draft.quality,
        hashtags: draft.hashtags,
        priority: draft.priority,
        isFeatured: draft.isFeatured,
      };

      console.log("🧹 CLEANED DATA youtubeUrl:", cleanedData.youtubeUrl);
      console.log("📦 CLEANED DATA COMPLETO:", cleanedData);

      // Eliminar campos undefined
      (Object.keys(cleanedData) as Array<keyof typeof cleanedData>).forEach(
        (key) => {
          if ((cleanedData as any)[key] === undefined) {
            delete (cleanedData as any)[key];
          }
        }
      );

      console.log("═══════════════════════════════════");
      console.log("📤 DATOS FINALES youtubeUrl:", cleanedData.youtubeUrl);
      console.log("📤 DATOS FINALES COMPLETOS:", cleanedData);
      console.log("═══════════════════════════════════");

      if (editing) {
        console.log("✏️ MODO EDICIÓN - Enviando a ID:", editing.id);
        await updateClip.mutateAsync({ id: editing.id, data: cleanedData });
        toast.success("Clip actualizado con éxito");
        setEditing(null);
      } else {
        console.log("➕ MODO CREACIÓN - Creando nuevo clip");
        await createClip.mutateAsync(cleanedData);
        toast.success("Clip creado con éxito");
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error("❌ Error saving clip:", error);
      toast.error("Error al guardar el clip");
    } finally {
      setFormSubmitted(false);
    }
  };

  const handleEdit = (clip: Clip): void => {
    setEditing(clip);
    setDraft({
      title: clip.title || "",
      description: clip.description || "",
      category: clip.category || "comedy",
      youtubeId: clip.youtubeId || "",
      youtubeUrl: clip.youtubeUrl || clip.videoUrl || "", // ✅ Usar youtubeUrl del backend
      thumbnailUrl: clip.thumbnailUrl || "",
      duration: clip.duration || 30,
      creator: {
        name: clip.creator?.name || clip.user?.name || "",
        channel: clip.creator?.channel || `@${clip.user?.username}` || "",
        avatarUrl: clip.creator?.avatarUrl || clip.user?.avatar || "",
      },
      status: clip.status,
      isVertical: clip.isVertical ?? true,
      quality: clip.quality || "medium",
      hashtags: clip.hashtags || [],
      priority: clip.priority || 1,
      isFeatured: clip.isFeatured || false,
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
  const [clipToDelete, setClipToDelete] = useState<Clip | null>(null);

  const handleDelete = (clip: Clip): void => {
    setClipToDelete(clip);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (clipToDelete) {
      try {
        await deleteClip.mutateAsync(clipToDelete.id);
        toast.success("Clip eliminado con éxito");
        refetch();
      } catch (error) {
        console.error("Error deleting clip:", error);
        toast.error("Error al eliminar el clip");
      }
    }
    setIsDeleteModalOpen(false);
    setClipToDelete(null);
  };

  const handleToggleFeature = async (clip: Clip): Promise<void> => {
    try {
      await featureClip.mutateAsync({
        id: clip.id,
        featured: !clip.isFeatured,
      });
    } catch (error) {
      console.error("Error toggling feature:", error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "reported":
        return "bg-orange-100 text-orange-700";
      case "removed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const error = false; // Placeholder para error handling

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar clips
          </h3>
          <p className="text-gray-500 mb-4">No se pudieron cargar los clips</p>
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
            🎬 Gestión de Clips
          </h1>
          <p className="text-gray-600 mt-2">
            Administra videos cortos y contenido de usuarios
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isLoading}
          type="button"
          aria-label="Actualizar lista de clips"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats */}
      <ClipStatsComponent stats={stats} />

      {/* Filtros */}
      <ClipFilters
        search={search}
        status={status}
        category={category}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Lista de Clips */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Clips ({filteredClips.length})
          </h2>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Clip</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clips...</p>
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="text-center py-8">
            <PlayCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron clips
            </h3>
            <p className="text-gray-500">
              {clips.length === 0
                ? "Crea tu primer clip"
                : "Intenta cambiar los filtros"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip: Clip, index: number) => (
              <div
                key={`clip-${clip.id || index}`}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {clip.thumbnailUrl ? (
                    <img
                      src={buildImageUrl(clip.thumbnailUrl)}
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <PlayCircle className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  {/* Duración */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(clip.duration)}
                  </div>

                  {/* Badge de destacado */}
                  {clip.isFeatured && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full">
                        ⭐ Destacado
                      </span>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        clip.status
                      )}`}
                    >
                      {clip.status}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {clip.title}
                  </h3>

                  {clip.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {clip.description}
                    </p>
                  )}

                  {/* Usuario */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">
                        {clip.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      @{clip.user?.username || "usuario"}
                    </span>
                  </div>

                  {/* Estadísticas */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {formatNumber(clip.views)}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {formatNumber(clip.likes)}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {formatNumber(clip.comments)}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(clip)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDelete(clip)}
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
      <ClipFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        draft={draft}
        setDraft={setDraft}
        editing={editing}
        formSubmitted={formSubmitted}
        setFormSubmitted={setFormSubmitted}
        handleInputChange={handleInputChange}
        handleTagsChange={handleTagsChange}
        handleSubmit={handleSubmit}
        handleThumbnailUpload={handleThumbnailUpload}
        handleRemoveThumbnail={handleRemoveThumbnail}
        handleVideoUpload={handleVideoUpload}
        handleRemoveVideo={handleRemoveVideo}
        resetForm={resetForm}
        isPending={createClip.isPending || updateClip.isPending}
      />

      {/* Modal de Eliminación */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        clipTitle={clipToDelete?.title || ""}
      />
    </div>
  );
};

// Modal de Confirmación de Eliminación
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clipTitle: string;
}> = ({ isOpen, onClose, onConfirm, clipTitle }) => (
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
                Eliminar Clip
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el clip &quot;
                  {clipTitle}&quot;? Esta acción no se puede deshacer.
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

// Modal de Formulario para Clips
const ClipFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  draft: ClipDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClipDraft>>;
  editing: Clip | null;
  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleTagsChange: (tags: string[]) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleThumbnailUpload: (file: File) => Promise<string>;
  handleRemoveThumbnail: () => void;
  handleVideoUpload: (file: File) => Promise<string>;
  handleRemoveVideo: () => void;
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
  handleTagsChange,
  handleSubmit,
  handleThumbnailUpload,
  handleRemoveThumbnail,
  handleVideoUpload,
  handleRemoveVideo,
  resetForm,
  isPending,
}) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !draft.title ||
      !draft.description ||
      !draft.youtubeUrl ||
      !draft.creator.name ||
      !draft.creator.channel ||
      draft.duration <= 0
    ) {
      setFormSubmitted(true);
      toast.error("Por favor, completa todos los campos requeridos.");
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
                      {editing ? "Editar Clip" : "Crear Nuevo Clip"}
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
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Título del clip"
                          required
                        />
                        {!draft.title && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Categoría *
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={draft.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {CLIP_CATEGORIES.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
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
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                        placeholder="Descripción del clip..."
                        required
                      />
                      {!draft.description && formSubmitted && (
                        <p className="text-red-500 text-sm mt-1">Requerido</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FileUploader
                          accept="video"
                          currentUrl={draft.youtubeUrl}
                          onUpload={async (file: File) => {
                            console.log(
                              "📹 Iniciando upload de video:",
                              file.name
                            );

                            const newUrl = await handleVideoUpload(file);

                            console.log("✅ Video subido exitosamente");
                            console.log("🔗 Nueva URL:", newUrl);
                            console.log(
                              "📋 Draft ANTES de forzar actualización:",
                              draft.youtubeUrl
                            );

                            // ⚠️ FORZAR actualización del estado
                            setDraft((prev) => {
                              const updated = {
                                ...prev,
                                youtubeUrl: newUrl,
                                youtubeId: `clip_${Date.now()}_${Math.random()
                                  .toString(36)
                                  .substr(2, 9)}`,
                              };
                              console.log(
                                "🔄 Draft DESPUÉS de actualizar:",
                                updated.youtubeUrl
                              );
                              return updated;
                            });

                            return newUrl;
                          }}
                          onRemove={() => {
                            console.log("🗑️ Removiendo video del draft");
                            console.log(
                              "📋 Draft antes de remover:",
                              draft.youtubeUrl
                            );
                            handleRemoveVideo();
                          }}
                          label="Video del Clip *"
                          required={true}
                          maxSize={100}
                          className="w-full"
                        />
                        {!draft.youtubeUrl && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
                      </div>

                      <div>
                        <FileUploader
                          accept="image"
                          currentUrl={draft.thumbnailUrl}
                          onUpload={handleThumbnailUpload}
                          onRemove={handleRemoveThumbnail}
                          label="Thumbnail (Opcional)"
                          required={false}
                          maxSize={5}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="duration"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Duración (segundos) *
                        </label>
                        <input
                          type="number"
                          id="duration"
                          name="duration"
                          value={draft.duration}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${
                            draft.duration <= 0 && formSubmitted
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="30"
                          min="1"
                          max="180"
                          required
                        />
                        {draft.duration <= 0 && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">
                            Debe ser mayor a 0
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="quality"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Calidad
                        </label>
                        <select
                          id="quality"
                          name="quality"
                          value={draft.quality}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="hd">HD</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="creatorName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Nombre del Creador *
                        </label>
                        <input
                          type="text"
                          id="creatorName"
                          name="creatorName"
                          value={draft.creator.name}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              creator: {
                                ...prev.creator,
                                name: e.target.value,
                              },
                            }))
                          }
                          className={`w-full px-4 py-2 border ${
                            !draft.creator.name && formSubmitted
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Nombre del creador"
                          required
                        />
                        {!draft.creator.name && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="creatorChannel"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Canal del Creador *
                        </label>
                        <input
                          type="text"
                          id="creatorChannel"
                          name="creatorChannel"
                          value={draft.creator.channel}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              creator: {
                                ...prev.creator,
                                channel: e.target.value,
                              },
                            }))
                          }
                          className={`w-full px-4 py-2 border ${
                            !draft.creator.channel && formSubmitted
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="@nombrecanal"
                          required
                        />
                        {!draft.creator.channel && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          htmlFor="priority"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Prioridad (1-10)
                        </label>
                        <input
                          type="number"
                          id="priority"
                          name="priority"
                          value={draft.priority}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>

                    <div>
                      <TagsInput
                        label="Hashtags"
                        placeholder="Agregar hashtag..."
                        tags={draft.hashtags}
                        onTagsChange={(hashtags) =>
                          setDraft((prev) => ({ ...prev, hashtags }))
                        }
                        chipColor="purple"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            Destacar clip
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="isVertical"
                            checked={draft.isVertical}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Video vertical
                          </span>
                        </label>
                      </div>
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
                            ? "Guardando..."
                            : editing
                            ? "Actualizar"
                            : "Crear Clip"}
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

export default ClipsManagement;
