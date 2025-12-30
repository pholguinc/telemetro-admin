import React, { useState, useMemo, useCallback, Fragment } from "react";
import {
  Video,
  Users,
  Eye,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Shield,
  Heart,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import {
  useStreamers,
  useStreamerStats,
  useUpdateStreamerStatus,
  useVerifyStreamer,
  useCreateStreamer,
  useUpdateStreamer,
  useDeleteStreamer,
  useChangeStreamerStatus,
  useToggleVerification,
} from "../../hooks/useStreamers";
import { buildImageUrl } from "../../config/environment";
import FileUploader from "../../components/ui/FileUploader";
import UserSearchDropdown from "../../components/ui/UserSearchDropdown";
import { StreamersService } from "../../services";

// Types
interface Streamer {
  id: string;
  userId: string;
  name?: string;
  username?: string;
  user?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  displayName?: string;
  bio?: string;
  category:
    | "gaming"
    | "education"
    | "music"
    | "talk"
    | "sports"
    | "other"
    | "irl";
  status: "active" | "inactive" | "pending" | "suspended" | "banned";
  isLive?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  followerCount?: number;
  totalViews?: number;
  totalStreams?: number;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  monetization?: {
    isEnabled?: boolean;
    donationsEnabled?: boolean;
    subscriptionsEnabled?: boolean;
    pointsPerView?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface SelectedUser {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface StreamerDraft {
  displayName: string;
  bio: string;
  category: "gaming" | "education" | "music" | "talk" | "sports" | "other";
  userId: string;
  selectedUser: SelectedUser | null;
  isActive: boolean;
  socialLinks: {
    twitter: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  monetization: {
    isEnabled: boolean;
    donationsEnabled: boolean;
    subscriptionsEnabled: boolean;
    pointsPerView: number;
  };
}

interface StreamerStatsLocal {
  totalStreamers: number;
  activeStreamers: number;
  liveStreamers: number;
  verifiedStreamers: number;
  metrics: {
    totalFollowers: number;
    totalViews: number;
    averageViewsPerStream: string;
  };
  topPerformers: Streamer[];
}

type StatusFilter = "all" | "active" | "inactive" | "live" | "verified";
type CategoryFilter =
  | "all"
  | "gaming"
  | "education"
  | "music"
  | "talk"
  | "sports"
  | "other";

// Constantes para opciones
const STREAMER_CATEGORIES = [
  { value: "gaming", label: "Gaming" },
  { value: "education", label: "Educación" },
  { value: "music", label: "Música" },
  { value: "talk", label: "Conversación" },
  { value: "sports", label: "Deportes" },
  { value: "other", label: "Otros" },
];

const CATEGORIES = [
  { value: "all", label: "Todas las categorías" },
  ...STREAMER_CATEGORIES,
];

const STATUSES = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "live", label: "En vivo" },
  { value: "verified", label: "Verificados" },
];

const FORM_STATUSES = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

// Custom hook para lógica del formulario
const useStreamerForm = (
  initialDraft: StreamerDraft,
  editing: Streamer | null,
  onReset: () => void
) => {
  const [draft, setDraft] = useState<StreamerDraft>(initialDraft);
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

  const handleSocialLinksChange = useCallback(
    (field: keyof StreamerDraft["socialLinks"], value: string) => {
      setDraft((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value },
      }));
    },
    []
  );

  const handleMonetizationChange = useCallback(
    (field: keyof StreamerDraft["monetization"], value: boolean | number) => {
      setDraft((prev) => ({
        ...prev,
        monetization: { ...prev.monetization, [field]: value },
      }));
    },
    []
  );

  const handleUserSelect = useCallback((user: SelectedUser | null) => {
    setDraft((prev) => ({
      ...prev,
      selectedUser: user,
      userId: user ? user.id : "",
      displayName: user ? user.displayName : prev.displayName,
    }));
  }, []);

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
    handleSocialLinksChange,
    handleMonetizationChange,
    handleUserSelect,
    resetForm,
  };
};

// Subcomponente para Stats
const StreamerStatsComponent: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return null;

  const formatNumber = (num: number | undefined): string => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Validaciones defensivas para evitar errores
  const safeStats = {
    totalStreamers: stats.totalStreamers || 0,
    activeStreamers: stats.activeStreamers || 0,
    liveStreamers: stats.liveStreamers || 0,
    verifiedStreamers: stats.verifiedStreamers || 0,
    totalFollowers: stats.metrics?.totalFollowers || 0,
    totalViews: stats.metrics?.totalViews || 0,
    averageViewsPerStream: stats.metrics?.averageViewsPerStream || "0",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Streamers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {safeStats.totalStreamers}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">En Vivo</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {safeStats.liveStreamers}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Seguidores</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {formatNumber(safeStats.totalFollowers)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Heart className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Verificados</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {safeStats.verifiedStreamers}
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para Filtros
const StreamerFilters: React.FC<{
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
        placeholder="Buscar streamers..."
        value={search}
        onChange={onSearchChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        aria-label="Buscar streamers por nombre o descripción"
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

const StreamersManagement: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [editing, setEditing] = useState<Streamer | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  const initialDraft: StreamerDraft = {
    displayName: "",
    bio: "",
    category: "gaming",
    userId: "",
    selectedUser: null,
    isActive: true,
    socialLinks: {
      twitter: "",
      instagram: "",
      youtube: "",
      tiktok: "",
    },
    monetization: {
      isEnabled: false,
      donationsEnabled: false,
      subscriptionsEnabled: false,
      pointsPerView: 1,
    },
  };

  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleSocialLinksChange,
    handleMonetizationChange,
    handleUserSelect,
    resetForm,
  } = useStreamerForm(initialDraft, editing, () => setEditing(null));

  const {
    data: streamersResponse,
    isLoading,
    refetch,
  } = useStreamers({
    search,
    isActive:
      status === "active" ? true : status === "inactive" ? false : undefined,
    isLive: status === "live" ? true : undefined,
    isVerified: status === "verified" ? true : undefined,
    category: category !== "all" ? category : undefined,
    limit: 50,
  });

  const streamers: Streamer[] = streamersResponse || [];
  const { data: stats } = useStreamerStats();
  const updateStreamer = useUpdateStreamer();
  const deleteStreamer = useDeleteStreamer();
  const verifyStreamer = useVerifyStreamer();
  const createStreamer = useCreateStreamer();
  const updateStatus = useUpdateStreamerStatus();
  const changeStatus = useChangeStreamerStatus();
  const toggleVerification = useToggleVerification();

  const filteredStreamers = useMemo(() => {
    return streamers.filter((streamer: Streamer) => {
      const matchesSearch =
        search === "" ||
        (streamer.displayName || streamer.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (streamer.bio &&
          streamer.bio.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        status === "all" ||
        (status === "active" && streamer.isActive) ||
        (status === "inactive" && !streamer.isActive) ||
        (status === "live" && streamer.isLive) ||
        (status === "verified" && streamer.isVerified);

      const matchesCategory =
        category === "all" || streamer.category === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [streamers, search, status, category]);

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

    try {
      const cleanedData = {
        displayName: draft.displayName.trim(),
        bio: draft.bio.trim(),
        category: draft.category,
        userId: draft.userId.trim(),
        isActive: draft.isActive,
        socialLinks: draft.socialLinks,
        monetization: draft.monetization,
      };

      if (editing) {
        await updateStreamer.mutateAsync({
          streamerId: editing.id,
          streamerData: cleanedData,
        });
        toast.success("Streamer actualizado con éxito");
        setEditing(null);
      } else {
        await createStreamer.mutateAsync(cleanedData);
        toast.success("Streamer creado con éxito");
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error("Error saving streamer:", error);
      toast.error("Error al guardar el streamer");
    } finally {
      setFormSubmitted(false);
    }
  };

  const handleEdit = (streamer: Streamer): void => {
    setEditing(streamer);

    // Para edición, creamos un usuario seleccionado basado en los datos del streamer
    const selectedUser: SelectedUser = {
      id: streamer.userId,
      displayName: streamer.displayName || streamer.name || "",
      username: streamer.username || streamer.user?.username || "",
      email: "Sin email", // Los streamers existentes no tienen email disponible en esta interfaz
      avatar: streamer.user?.avatar,
      createdAt: streamer.createdAt || "",
    };

    setDraft({
      displayName: streamer.displayName || streamer.name || "",
      bio: streamer.bio || "",
      category:
        (streamer.category === "irl" ? "other" : streamer.category) || "gaming",
      userId: streamer.userId || "",
      selectedUser: selectedUser,
      isActive: streamer.isActive ?? true,
      socialLinks: {
        twitter: streamer.socialLinks?.twitter || "",
        instagram: streamer.socialLinks?.instagram || "",
        youtube: streamer.socialLinks?.youtube || "",
        tiktok: streamer.socialLinks?.tiktok || "",
      },
      monetization: {
        isEnabled: streamer.monetization?.isEnabled ?? false,
        donationsEnabled: streamer.monetization?.donationsEnabled ?? false,
        subscriptionsEnabled:
          streamer.monetization?.subscriptionsEnabled ?? false,
        pointsPerView: streamer.monetization?.pointsPerView ?? 1,
      },
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
  const [streamerToDelete, setStreamerToDelete] = useState<Streamer | null>(
    null
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [streamerToChangeStatus, setStreamerToChangeStatus] =
    useState<Streamer | null>(null);

  const handleDelete = (streamer: Streamer): void => {
    setStreamerToDelete(streamer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (streamerToDelete) {
      try {
        await deleteStreamer.mutateAsync(streamerToDelete.id);
        toast.success("Streamer eliminado con éxito");
        refetch();
      } catch (error) {
        console.error("Error deleting streamer:", error);
        toast.error("Error al eliminar el streamer");
      }
    }
    setIsDeleteModalOpen(false);
    setStreamerToDelete(null);
  };

  const handleVerify = async (streamerId: string): Promise<void> => {
    try {
      await verifyStreamer.mutateAsync(streamerId);
      // El toast y refetch se manejan en el hook
    } catch (error) {
      console.error("Error verifying streamer:", error);
    }
  };

  const handleToggleVerification = async (
    streamerId: string,
    currentIsVerified: boolean
  ): Promise<void> => {
    try {
      await toggleVerification.mutateAsync({
        streamerId,
        isVerified: !currentIsVerified,
      });
      // El toast y refetch se manejan en el hook
    } catch (error) {
      console.error("Error toggling verification:", error);
    }
  };

  const handleToggleStatus = async (
    streamerId: string,
    isActive: boolean
  ): Promise<void> => {
    try {
      await updateStatus.mutateAsync({ streamerId, isActive: !isActive });
      // El toast y refetch se manejan en el hook
    } catch (error) {
      console.error("Error updating streamer status:", error);
    }
  };

  const handleChangeStatus = async (
    streamerId: string,
    newStatus: string,
    reason?: string
  ): Promise<void> => {
    try {
      await changeStatus.mutateAsync({ streamerId, status: newStatus, reason });
      // El toast y refetch se manejan en el hook
    } catch (error) {
      console.error("Error changing streamer status:", error);
    }
  };

  const handleOpenStatusModal = (streamer: Streamer): void => {
    setStreamerToChangeStatus(streamer);
    setIsStatusModalOpen(true);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      gaming: "bg-purple-100 text-purple-700",
      education: "bg-blue-100 text-blue-700",
      music: "bg-pink-100 text-pink-700",
      talk: "bg-green-100 text-green-700",
      sports: "bg-orange-100 text-orange-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      pending: "bg-yellow-100 text-yellow-700",
      suspended: "bg-orange-100 text-orange-700",
      banned: "bg-red-100 text-red-700",
    };
    return colors[status] || colors.inactive;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
      suspended: "Suspendido",
      banned: "Baneado",
    };
    return labels[status] || "Inactivo";
  };

  const error = false; // Placeholder para error handling

  if (error) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar streamers
          </h3>
          <p className="text-gray-500 mb-4">
            No se pudieron cargar los streamers
          </p>
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
            🎥 Gestión de Streamers
          </h1>
          <p className="text-gray-600 mt-2">
            Administra streamers y creadores de contenido
          </p>
              </div>
        <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isLoading}
          type="button"
          aria-label="Actualizar lista de streamers"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </button>
          </div>
          
      {/* Stats */}
      <StreamerStatsComponent stats={stats} />

      {/* Filtros */}
      <StreamerFilters
        search={search}
        status={status}
        category={category}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Lista de Streamers */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Streamers ({filteredStreamers.length})
          </h2>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Streamer</span>
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando streamers...</p>
          </div>
        ) : filteredStreamers.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron streamers
            </h3>
            <p className="text-gray-500">
              {streamers.length === 0
                ? "Crea tu primer streamer"
                : "Intenta cambiar los filtros"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStreamers.map((streamer: Streamer, index: number) => (
              <div
                key={`streamer-${streamer.id || index}`}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Avatar y Estado */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center relative">
                      <span className="text-white font-bold">
                          {(
                            streamer.displayName ||
                            streamer.name ||
                            streamer.user?.name ||
                            "S"
                          ).charAt(0)}
                      </span>
                        {streamer.isLive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {streamer.displayName ||
                              streamer.name ||
                              streamer.user?.name ||
                              "Sin nombre"}
                        </h3>
                          {streamer.isVerified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        </div>
                        <p className="text-sm text-gray-600">
                          @
                          {streamer.user?.username ||
                            streamer.username ||
                            "sin_username"}
                        </p>
                      </div>
                    </div>

                    {streamer.isLive && (
                          <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full animate-pulse">
                            🔴 EN VIVO
                          </span>
                        )}
                      </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  {/* Categoría y Estado */}
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(
                        streamer.category
                      )}`}
                    >
                      {STREAMER_CATEGORIES.find(
                        (c) => c.value === streamer.category
                      )?.label || streamer.category}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        streamer.status
                      )}`}
                    >
                      {getStatusLabel(streamer.status)}
                      </span>
                  </div>

                  {/* Bio */}
                  {streamer.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {streamer.bio}
                    </p>
                  )}

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {formatNumber(streamer.followerCount || 0)} seguidores
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {formatNumber(streamer.totalViews || 0)} vistas
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(streamer)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDelete(streamer)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                        <button
                        onClick={() =>
                          handleToggleVerification(
                            streamer.id,
                            streamer.isVerified || false
                          )
                        }
                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                          streamer.isVerified
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                          type="button"
                        >
                        {streamer.isVerified
                          ? "Quitar Verificación"
                          : "Verificar"}
                        </button>

                      <button
                        onClick={() => handleOpenStatusModal(streamer)}
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                        type="button"
                      >
                        Cambiar Estado
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
      <StreamerFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        draft={draft}
        setDraft={setDraft}
        editing={editing}
        formSubmitted={formSubmitted}
        setFormSubmitted={setFormSubmitted}
        handleInputChange={handleInputChange}
        handleSocialLinksChange={handleSocialLinksChange}
        handleMonetizationChange={handleMonetizationChange}
        handleUserSelect={handleUserSelect}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        isPending={createStreamer.isPending || updateStreamer.isPending}
      />

      {/* Modal de Eliminación */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        streamerName={
          streamerToDelete?.displayName ||
          streamerToDelete?.name ||
          "este streamer"
        }
      />

      {/* Modal de Cambio de Estado */}
      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStreamerToChangeStatus(null);
        }}
        streamer={streamerToChangeStatus}
        onChangeStatus={handleChangeStatus}
        isPending={changeStatus.isPending}
      />
    </div>
  );
};

// Modal de Confirmación de Eliminación
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  streamerName: string;
}> = ({ isOpen, onClose, onConfirm, streamerName }) => (
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
                Eliminar Streamer
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar al streamer &quot;
                  {streamerName}&quot;? Esta acción no se puede deshacer.
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

// Modal de Formulario para Streamers
const StreamerFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  draft: StreamerDraft;
  setDraft: React.Dispatch<React.SetStateAction<StreamerDraft>>;
  editing: Streamer | null;
  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSocialLinksChange: (
    field: keyof StreamerDraft["socialLinks"],
    value: string
  ) => void;
  handleMonetizationChange: (
    field: keyof StreamerDraft["monetization"],
    value: boolean | number
  ) => void;
  handleUserSelect: (user: SelectedUser | null) => void;
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
  handleSocialLinksChange,
  handleMonetizationChange,
  handleUserSelect,
  handleSubmit,
  resetForm,
  isPending,
}) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !draft.displayName ||
      !draft.userId ||
      !draft.bio ||
      (!editing && !draft.selectedUser)
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
                      {editing ? "Editar Streamer" : "Crear Nuevo Streamer"}
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
                    {/* Selección de Usuario - Solo para crear nuevos streamers */}
                    {!editing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar Usuario *
                        </label>
                        <UserSearchDropdown
                          selectedUser={draft.selectedUser}
                          onUserSelect={handleUserSelect}
                          placeholder="Buscar usuario por nombre, username o email..."
                          error={!draft.selectedUser && formSubmitted}
                        />
                        {!draft.selectedUser && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">
                            Debes seleccionar un usuario
                          </p>
                        )}
          </div>
                    )}

                    {/* Información del Usuario - Solo mostrar cuando hay usuario seleccionado o editando */}
                    {(draft.selectedUser || editing) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="displayName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Nombre para mostrar *
                          </label>
                          <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={draft.displayName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border ${
                              !draft.displayName && formSubmitted
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Nombre del streamer"
                            required
                          />
                          {!draft.displayName && formSubmitted && (
                            <p className="text-red-500 text-sm mt-1">
                              Requerido
                            </p>
        )}
      </div>

                        {editing && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Usuario Asociado
                            </label>
                            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {draft.selectedUser?.displayName?.charAt(
                                      0
                                    ) || "U"}
                                  </span>
    </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {draft.selectedUser?.displayName ||
                                      "Usuario"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    @
                                    {draft.selectedUser?.username || "username"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Biografía - Siempre mostrar cuando hay usuario seleccionado o editando */}
                    {(draft.selectedUser || editing) && (
                      <div>
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Biografía *
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={draft.bio}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full px-4 py-2 border ${
                            !draft.bio && formSubmitted
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                          placeholder="Descripción del streamer..."
                          required
                        />
                        {!draft.bio && formSubmitted && (
                          <p className="text-red-500 text-sm mt-1">Requerido</p>
                        )}
                      </div>
                    )}

                    {/* Categoría y Estado - Siempre mostrar cuando hay usuario seleccionado o editando */}
                    {(draft.selectedUser || editing) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {STREAMER_CATEGORIES.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="isActive"
                              checked={draft.isActive}
                              onChange={handleInputChange}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Streamer activo
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Redes Sociales - Siempre mostrar cuando hay usuario seleccionado o editando */}
                    {(draft.selectedUser || editing) && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Redes Sociales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Twitter
                            </label>
                            <input
                              type="text"
                              value={draft.socialLinks.twitter}
                              onChange={(e) =>
                                handleSocialLinksChange(
                                  "twitter",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="@usuario"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Instagram
                            </label>
                            <input
                              type="text"
                              value={draft.socialLinks.instagram}
                              onChange={(e) =>
                                handleSocialLinksChange(
                                  "instagram",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="@usuario"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              YouTube
                            </label>
                            <input
                              type="text"
                              value={draft.socialLinks.youtube}
                              onChange={(e) =>
                                handleSocialLinksChange(
                                  "youtube",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Canal de YouTube"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              TikTok
                            </label>
                            <input
                              type="text"
                              value={draft.socialLinks.tiktok}
                              onChange={(e) =>
                                handleSocialLinksChange(
                                  "tiktok",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="@usuario"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Monetización - Siempre mostrar cuando hay usuario seleccionado o editando */}
                    {(draft.selectedUser || editing) && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Configuración de Monetización
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={draft.monetization.isEnabled}
                                onChange={(e) =>
                                  handleMonetizationChange(
                                    "isEnabled",
                                    e.target.checked
                                  )
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Monetización habilitada
                              </span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={draft.monetization.donationsEnabled}
                                onChange={(e) =>
                                  handleMonetizationChange(
                                    "donationsEnabled",
                                    e.target.checked
                                  )
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Donaciones
                              </span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={
                                  draft.monetization.subscriptionsEnabled
                                }
                                onChange={(e) =>
                                  handleMonetizationChange(
                                    "subscriptionsEnabled",
                                    e.target.checked
                                  )
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Suscripciones
                              </span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Puntos por vista
                            </label>
                            <input
                              type="number"
                              value={draft.monetization.pointsPerView}
                              onChange={(e) =>
                                handleMonetizationChange(
                                  "pointsPerView",
                                  parseFloat(e.target.value) || 1
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

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
                            : "Crear Streamer"}
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

// Modal de Cambio de Estado
const ChangeStatusModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  streamer: Streamer | null;
  onChangeStatus: (
    streamerId: string,
    status: string,
    reason?: string
  ) => Promise<void>;
  isPending: boolean;
}> = ({ isOpen, onClose, streamer, onChangeStatus, isPending }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [reason, setReason] = useState<string>("");

  // Actualizar el estado seleccionado cuando se abre el modal
  React.useEffect(() => {
    if (isOpen && streamer) {
      setSelectedStatus(streamer.status || "inactive");
      setReason(streamer.suspensionReason || "");
    }
  }, [isOpen, streamer]);

  const statusOptions = [
    {
      value: "active",
      label: "Activo",
      color: "bg-green-100 text-green-700",
      description: "Streamer completamente activo y verificado",
    },
    {
      value: "inactive",
      label: "Inactivo",
      color: "bg-gray-100 text-gray-700",
      description: "Streamer temporalmente inactivo",
    },
    {
      value: "suspended",
      label: "Suspendido",
      color: "bg-yellow-100 text-yellow-700",
      description: "Suspendido temporalmente (requiere razón)",
    },
    {
      value: "banned",
      label: "Baneado",
      color: "bg-red-100 text-red-700",
      description: "Baneado permanentemente (requiere razón)",
    },
  ];

  const requiresReason =
    selectedStatus === "suspended" || selectedStatus === "banned";

  const handleSubmit = async () => {
    if (!streamer) return;

    if (requiresReason && !reason.trim()) {
      toast.error("La razón es requerida para suspender o banear");
      return;
    }

    await onChangeStatus(
      streamer.id,
      selectedStatus,
      reason.trim() || undefined
    );
    handleClose();
  };

  const handleClose = () => {
    // No resetear aquí porque se hace automáticamente con useEffect cuando se abre
    onClose();
  };

  if (!streamer) return null;

  const currentStatusOption =
    statusOptions.find((opt) => {
      return opt.value === streamer.status;
    }) || statusOptions.find((opt) => opt.value === "inactive");

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                  Cambiar Estado del Streamer
                </Dialog.Title>

                {/* Información del streamer */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {(streamer.displayName || streamer.name || "S").charAt(
                          0
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {streamer.displayName || streamer.name || "Sin nombre"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estado actual:
                        <span
                          className={`ml-1 px-2 py-1 text-xs rounded-full ${currentStatusOption?.color}`}
                        >
                          {currentStatusOption?.label}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selector de estado */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Nuevo Estado
                  </label>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedStatus === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={selectedStatus === option.value}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${option.color}`}
                            >
                              {option.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Campo de razón (requerido para suspended/banned) */}
                {requiresReason && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Explica la razón de la suspensión o baneo..."
                      required
                    />
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending || (requiresReason && !reason.trim())}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>{isPending ? "Cambiando..." : "Cambiar Estado"}</span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default StreamersManagement;
