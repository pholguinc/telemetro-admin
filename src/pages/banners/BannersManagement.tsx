import React, { useState } from "react";
import {
  Plus,
  Image,
  Eye,
  Edit,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useBanners } from "../../hooks/useBanners";
import { Banner } from "../../models";
import BannerCard from "../../components/banners/BannerCard";
import BannerModal from "../../components/banners/BannerModal";

// Types
interface BannerWithId extends Banner {
  id: string;
}

interface BannerStats {
  total: number;
  active: number;
  draft: number;
  totalViews: number;
  totalClicks: number;
}

type StatusFilter = "all" | "active" | "draft";

const BannersManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<BannerWithId | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: banners = [], isLoading, error, refetch } = useBanners();

  // Filtrar banners
  const filteredBanners = banners.filter((banner: BannerWithId) => {
    const title = banner.title || "";
    const description = banner.description || banner.subtitle || "";
    const status = banner.status || "active";

    const matchesSearch =
      searchTerm === "" ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calcular estadísticas
  const stats: BannerStats = {
    total: banners.length,
    active: banners.filter((b) => (b.status || "active") === "active").length,
    draft: banners.filter((b) => (b.status || "active") === "draft").length,
    totalViews: banners.reduce((sum, b) => sum + (b.impressions || 0), 0),
    totalClicks: banners.reduce((sum, b) => sum + (b.clicks || 0), 0),
  };

  const handleCreateBanner = (): void => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleEditBanner = (banner: BannerWithId): void => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setStatusFilter(e.target.value as StatusFilter);
  };

  const handleRefresh = (): void => {
    refetch();
  };

  const handleClearFilters = (): void => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar banners
          </h3>
          <p className="text-gray-500 mb-4">
            No se pudieron cargar los banners
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
            🎬 Gestión de Banners
          </h1>
          <p className="text-gray-600 mt-2">
            Crea y gestiona banners para tu aplicación móvil
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={isLoading}
            type="button"
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleCreateBanner}
            className="btn-primary flex items-center space-x-2"
            type="button"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Banner</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Banners</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Borradores</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.draft}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Edit className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vistas</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.totalViews >= 1000
                  ? `${(stats.totalViews / 1000).toFixed(1)}K`
                  : stats.totalViews}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clics</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {stats.totalClicks >= 1000
                  ? `${(stats.totalClicks / 1000).toFixed(1)}K`
                  : stats.totalClicks}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar banners..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="input-field pl-10 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="input-field w-auto"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="draft">Borradores</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Mostrando {filteredBanners.length} de {banners.length} banners
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando banners...</p>
          </div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="text-center py-12">
          {banners.length === 0 ? (
            // No hay banners en absoluto
            <div>
              <Image className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                ¡Crea tu primer banner!
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Los banners son una excelente manera de promocionar contenido y
                mantener a tus usuarios comprometidos.
              </p>
              <button
                onClick={handleCreateBanner}
                className="btn-primary flex items-center space-x-2 mx-auto"
                type="button"
              >
                <Plus className="h-5 w-5" />
                <span>Crear Primer Banner</span>
              </button>
            </div>
          ) : (
            // Hay banners pero no coinciden con los filtros
            <div>
              <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron banners
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta cambiar los filtros o el término de búsqueda.
              </p>
              <button
                onClick={handleClearFilters}
                className="btn-secondary"
                type="button"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      ) : (
        // Grid de banners
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner: BannerWithId, index: number) => (
            <BannerCard
              key={banner._id || banner.id || index}
              banner={banner}
              onEdit={handleEditBanner}
            />
          ))}

          {/* Card para crear nuevo banner */}
          {searchTerm === "" && statusFilter === "all" && (
            <div
              onClick={handleCreateBanner}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group min-h-[300px]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCreateBanner();
                }
              }}
            >
              <Plus className="h-12 w-12 text-gray-400 group-hover:text-gray-600 mb-4 transition-colors" />
              <h3 className="font-medium text-gray-900 mb-2">
                Crear Nuevo Banner
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Sube una imagen o GIF para crear un banner atractivo
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <BannerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        banner={editingBanner}
      />
    </div>
  );
};

export default BannersManagement;
