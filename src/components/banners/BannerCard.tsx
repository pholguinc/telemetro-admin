import React, { useState } from 'react';
import { Edit, Trash2, Eye, MoreVertical, Play, Pause } from 'lucide-react';
import { useUpdateBanner, useDeleteBanner } from '../../hooks/useBanners';
import { Banner } from '../../models';
import { buildImageUrl } from '../../config/environment';
import SafeImage from '../common/SafeImage';

// Types
interface BannerCardProps {
  banner: Banner & { id: string }; // Incluye el id transformado
  onEdit: (banner: Banner & { id: string }) => void;
}

const BannerCard: React.FC<BannerCardProps> = ({ banner, onEdit }) => {
  const [showActions, setShowActions] = useState<boolean>(false);

  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const toggleStatus = async (): Promise<void> => {
    const newStatus = banner.status === 'active' ? 'draft' : 'active';
    try {
      await updateBanner.mutateAsync({
        id: banner._id || banner.id,
        data: { status: newStatus }
      });
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      try {
        await deleteBanner.mutateAsync(banner._id || banner.id);
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num || num === 0) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleImageError = (): void => {
    console.warn('Error loading banner image:', banner.imageUrl);
  };

  const handleEditClick = (): void => {
    onEdit(banner);
  };

  const handleActionsToggle = (): void => {
    setShowActions(!showActions);
  };

  const handleMenuEditClick = (): void => {
    onEdit(banner);
    setShowActions(false);
  };

  const handleMenuToggleStatus = (): void => {
    toggleStatus();
    setShowActions(false);
  };

  const handleMenuDelete = (): void => {
    handleDelete();
    setShowActions(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Imagen del banner */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <SafeImage
          src={buildImageUrl(banner.imageUrl)}
          alt={banner.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        
        {/* Overlay con acciones rápidas */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={handleEditClick}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
              title="Editar banner"
              type="button"
            >
              <Edit className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={toggleStatus}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
              title={banner.status === 'active' ? 'Pausar banner' : 'Activar banner'}
              type="button"
            >
              {banner.status === 'active' ? (
                <Pause className="h-4 w-4 text-gray-700" />
              ) : (
                <Play className="h-4 w-4 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            banner.status === 'active' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}>
            {banner.status === 'active' ? '🟢 Activo' : '🟡 Borrador'}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título y menú */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1 mr-2">
            {banner.title}
          </h3>
          
          <div className="relative">
            <button
              onClick={handleActionsToggle}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
              aria-label="Más opciones"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleMenuEditClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  type="button"
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Editar
                </button>
                
                <button
                  onClick={handleMenuToggleStatus}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  type="button"
                >
                  {banner.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-3" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-3" />
                      Activar
                    </>
                  )}
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={handleMenuDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  type="button"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        {banner.description && banner.description !== banner.title && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {banner.description}
          </p>
        )}

        {/* Estadísticas */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {formatNumber(banner.impressions)} vistas
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              {formatNumber(banner.clicks)} clics
            </span>
          </div>
          
          {banner.clicks && banner.impressions && banner.clicks > 0 && banner.impressions > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              CTR: {((banner.clicks / banner.impressions) * 100).toFixed(1)}%
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Creado: {formatDate(banner.createdAt)}
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={handleEditClick}
              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
              title="Editar"
              type="button"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={toggleStatus}
              className={`p-1 rounded transition-colors ${
                banner.status === 'active'
                  ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                  : 'text-green-600 hover:text-green-800 hover:bg-green-50'
              }`}
              title={banner.status === 'active' ? 'Pausar' : 'Activar'}
              type="button"
            >
              {banner.status === 'active' ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
              title="Eliminar"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;
