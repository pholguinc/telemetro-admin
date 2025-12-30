import React, { useState, useMemo, useCallback } from "react";
import {
  Music as MusicIcon,
  Brain,
  AlertCircle,
  Loader,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  MusicDraft,
  useRadioAiForm,
  useAdminMusic,
  useUpdateMusic,
  Music,
  useToggleMusicStatus,
  useDeleteMusic,
  useRetryMusic,
  AdminStats,
  useAdminStats,
} from "@/hooks/useRadioAI";
import RadioAiFilters from "./components/RadioAiFilters";
import RadioAiList from "./components/RadioAiList";
import RadioAiStats from "./components/RadioAiStats";
import RadioAiFormModal from "./components/RadioAiFormModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal/DeleteConfirmationModal";

// ========== TYPES ==========
type Tab = "all" | "pending" | "completed" | "failed";
type EmotionFilter = "all" | string;
type StatusFilter = "all" | "processing" | "completed" | "failed";

const RadioAiManagement: React.FC = () => {
  // ========== ESTADOS ==========
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [emotionFilter, setEmotionFilter] = useState<EmotionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState<Music | null>(null);
  const [deleting, setDeleting] = useState<Music | null>(null);
  const [page, setPage] = useState(1);

  // ========== DRAFT INICIAL ==========
  const initialDraft: MusicDraft = {
    title: "",
    subtitle: "",
    emotion: "feliz",
    image_url: "",
  };

  // ========== CUSTOM HOOKS ==========
  const {
    draft,
    setDraft,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    resetForm,
  } = useRadioAiForm(initialDraft, editing, () => setEditing(null));

  // ========== QUERIES ==========
  const queryParams = useMemo(() => {
    const params: Record<string, any> = { page, limit: 20 };
    if (search) params.search = search;
    if (emotionFilter !== "all") params.emotion = emotionFilter;
    if (statusFilter !== "all") params.status = statusFilter;

    // Filtros por tab
    if (activeTab === "pending") params.status = "processing";
    if (activeTab === "completed") params.status = "completed";
    if (activeTab === "failed") params.status = "failed";

    return params;
  }, [page, search, emotionFilter, statusFilter, activeTab]);

  const { data: musicData, isLoading, refetch } = useAdminMusic(queryParams);
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminStats();

  console.log("=== DEBUG STATS ===");
  console.log("Stats data:", stats);
  console.log("Stats loading:", statsLoading);
  console.log("Stats error:", statsError);
  console.log("Stats type:", typeof stats);
  console.log("Stats keys:", stats ? Object.keys(stats) : "undefined");
  console.log("==================");

  // ========== MUTATIONS ==========
  const updateMutation = useUpdateMusic();
  const toggleStatusMutation = useToggleMusicStatus();
  const deleteMutation = useDeleteMusic();
  const retryMutation = useRetryMusic();

  // ========== FILTROS ==========
  const filteredMusic = useMemo(() => {
    if (!musicData?.music) return [];
    return musicData.music;
  }, [musicData]);

  const pagination = musicData?.pagination;

  // ========== HANDLERS ==========
  const handleEdit = useCallback(
    (music: Music) => {
      setEditing(music);
      setDraft({
        title: music.title,
        subtitle: music.subtitle,
        emotion: music.emotion,
        image_url: music.image_url,
      });
      setIsFormModalOpen(true);
    },
    [setDraft]
  );

  const handleDelete = useCallback((music: Music) => {
    setDeleting(music);
    setIsDeleteModalOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    async (id: string) => {
      await toggleStatusMutation.mutateAsync(id);
    },
    [toggleStatusMutation]
  );

  const handleRetry = useCallback(
    async (id: string) => {
      await retryMutation.mutateAsync(id);
    },
    [retryMutation]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!draft.title || !draft.subtitle || !draft.emotion) {
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing._id,
          data: {
            title: draft.title,
            subtitle: draft.subtitle,
            emotion: draft.emotion,
            image_url: draft.image_url,
          },
        });
      }
      handleCloseFormModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting._id);
    setIsDeleteModalOpen(false);
    setDeleting(null);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditing(null);
    resetForm();
    setFormSubmitted(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleting(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // ========== ESTADÍSTICAS CALCULADAS ==========
  const tabStats = useMemo(() => {
    if (!stats) return { all: 0, pending: 0, completed: 0, failed: 0 };

    const statusDist = stats.statusDistribution || [];
    const pending =
      statusDist.find((s: any) => s._id === "processing")?.count || 0;
    const completed =
      statusDist.find((s: any) => s._id === "completed")?.count || 0;
    const failed = statusDist.find((s: any) => s._id === "failed")?.count || 0;

    return {
      all: stats.totalMusic || 0,
      pending,
      completed,
      failed,
    };
  }, [stats]);

  // ========== EMOCIONES DISPONIBLES ==========
  const emotions = [
    "feliz",
    "alegre",
    "contento",
    "enojado",
    "furioso",
    "frustrado",
    "triste",
    "melancólico",
    "deprimido",
    "ansioso",
    "estresado",
    "nostálgico",
    "relajado",
    "calmado",
    "zen",
    "energético",
    "motivado",
    "activo",
    "romántico",
    "amoroso",
    "tierno",
    "épico",
    "heroico",
    "grandioso",
  ];

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MusicIcon className="h-8 w-8 mr-3" />
              Gestión RADIO.ai
            </h1>
            <p className="text-purple-100 mt-2">
              Administración de música generada por inteligencia artificial
            </p>
          </div>
          <Brain className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats */}
      <RadioAiStats stats={stats} />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Todas
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs bg-gray-100">
                {tabStats.all}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "pending"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pendientes
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs bg-yellow-100">
                {tabStats.pending}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "completed"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completadas
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs bg-green-100">
                {tabStats.completed}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("failed")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "failed"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Fallidas
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs bg-red-100">
                {tabStats.failed}
              </span>
            </button>
          </nav>
        </div>

        {/* Filters */}
        <RadioAiFilters
          search={search}
          setSearch={setSearch}
          emotionFilter={emotionFilter}
          setEmotionFilter={setEmotionFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          emotions={emotions}
          activeTab={activeTab}
        />

        {/* List */}
        <RadioAiList
          music={filteredMusic}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onRetry={handleRetry}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <RadioAiFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmit}
        editing={editing}
        draft={draft}
        formSubmitted={formSubmitted}
        handleInputChange={handleInputChange}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        emotions={emotions}
        isSubmitting={updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={deleting?.title || ""}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default RadioAiManagement;
