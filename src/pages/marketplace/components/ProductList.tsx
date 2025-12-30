import React from 'react';
import { Package, Edit, Trash2 } from 'lucide-react';
import SafeImage from '../../../components/common/SafeImage';
import { buildImageUrl } from '../../../config/environment';
import { MarketplaceProduct } from '../../../models';

interface ProductListProps {
  products: MarketplaceProduct[];
  isLoading: boolean;
  onEdit: (product: MarketplaceProduct) => void;
  onToggleStatus: (product: MarketplaceProduct) => void;
  onDelete: (product: MarketplaceProduct) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const formatPrice = (price: number): string => {
    return `${price} puntos`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
        <p className="text-gray-500">Crea tu primer producto para el marketplace</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product._id}
          className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
        >
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            {product.imageUrl ? (
              <SafeImage
                src={buildImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-full flex items-center justify-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}

            <div className="absolute top-3 right-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(product.pointsCost)}
              </span>
              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                type="button"
                aria-label={`Editar producto ${product.name}`}
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>

              <button
                onClick={() => onToggleStatus(product)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  product.isActive
                    ? 'text-yellow-600 hover:bg-yellow-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={product.isActive ? 'Desactivar' : 'Activar'}
                type="button"
                aria-label={`${product.isActive ? 'Desactivar' : 'Activar'} producto ${product.name}`}
              >
                {product.isActive ? '⏸️' : '▶️'}
              </button>

              <button
                onClick={() => onDelete(product)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
                type="button"
                aria-label={`Eliminar producto ${product.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;

