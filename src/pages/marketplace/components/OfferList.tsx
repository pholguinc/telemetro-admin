import React from 'react';
import { Edit2, Trash2, MapPin, Calendar, Tag, Users, AlertCircle } from 'lucide-react';
import { GeographicOffer } from '../../../hooks/useMarketplace';
import SafeImage from '../../../components/common/SafeImage';

interface OfferListProps {
  offers: GeographicOffer[];
  isLoading: boolean;
  onEdit: (offer: GeographicOffer) => void;
  onToggleStatus: (offer: GeographicOffer) => void;
  onDelete: (offer: GeographicOffer) => void;
}

const OfferList: React.FC<OfferListProps> = ({
  offers,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const categoryLabels: Record<string, string> = {
    food_drink: 'Comida y Bebidas',
    entertainment: 'Entretenimiento',
    transport: 'Transporte',
    services: 'Servicios',
    shopping: 'Compras',
    health: 'Salud',
    education: 'Educación',
    other: 'Otros',
  };

  const getLocationTypeLabel = (type: 'Point' | 'Polygon'): string => {
    return type === 'Polygon' ? 'Área dibujada' : 'Punto específico';
  };

  const getLocationIcon = (type: 'Point' | 'Polygon') => {
    return type === 'Polygon' ? '🗺️' : '📍';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Cargando ofertas...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No se encontraron ofertas</p>
        <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros o crea una nueva oferta</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oferta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comerciante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descuento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Canjes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <SafeImage
                        src={offer.imageUrl || ''}
                        alt={offer.title}
                        className="h-12 w-12 rounded-lg object-cover"
                        fallbackText={offer.title.charAt(0)}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {offer.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{offer.merchantName}</div>
                  {offer.merchantAddress && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {offer.merchantAddress}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {categoryLabels[offer.category] || offer.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <span className="mr-1">{getLocationIcon(offer.location.type)}</span>
                    <span>{getLocationTypeLabel(offer.location.type)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {offer.discountPercentage && (
                      <span className="flex items-center text-green-600 font-semibold">
                        <Tag className="w-4 h-4 mr-1" />
                        {offer.discountPercentage}% OFF
                      </span>
                    )}
                    {offer.pointsReward && (
                      <span className="flex items-center text-purple-600 font-semibold">
                        +{offer.pointsReward} pts
                      </span>
                    )}
                    {offer.discountCode && (
                      <span className="text-xs text-gray-500">
                        Código: {offer.discountCode}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {offer.currentRedemptions || 0}
                      {offer.maxRedemptions && ` / ${offer.maxRedemptions}`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus(offer)}
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      offer.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    {offer.isActive ? 'Activa' : 'Inactiva'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(offer)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Editar oferta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(offer)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Eliminar oferta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfferList;




