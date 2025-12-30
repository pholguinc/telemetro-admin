import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketplaceService as marketplaceService } from '../services';
import { MarketplaceProduct, MarketplaceList } from '../models';
import toast from 'react-hot-toast';

// Additional types for marketplace operations
interface MarketplaceStats {
  totalProducts: number;
  activeProducts: number;
  totalRedemptions: number;
  pendingRedemptions: number;
  totalRevenue: number;
  popularProducts: MarketplaceProduct[];
}

interface Redemption {
  id: string;
  userId: string;
  productId: string;
  product: MarketplaceProduct;
  user: {
    id: string;
    name: string;
    phone: string;
  };
  code: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  pointsUsed: number;
  redeemedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  expiresAt?: string;
}

export interface GeographicOffer {
  _id: string;
  title: string;
  description: string;
  merchantName: string;
  merchantAddress?: string;
  category: 'food_drink' | 'entertainment' | 'transport' | 'services' | 'shopping' | 'health' | 'education' | 'other';
  discountCode?: string;
  discountPercentage?: number;
  pointsReward?: number;
  expiresAt?: string;
  imageUrl?: string;
  location: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][];
  };
  isActive: boolean;
  termsAndConditions?: string;
  maxRedemptions?: number;
  currentRedemptions?: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateProductData extends Record<string, unknown> {
  name: string;
  description?: string;
  category: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  provider?: string;
  isActive?: boolean;
  validityMinutes?: number;
}

interface UpdateProductData extends Partial<CreateProductData> {}

interface CreateOfferData extends Record<string, unknown> {
  title: string;
  description: string;
  merchantName: string;
  merchantAddress?: string;
  category: string;
  discountCode?: string;
  discountPercentage?: number;
  pointsReward?: number;
  expiresAt?: string;
  imageUrl?: string;
  location: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][];
  };
  isActive?: boolean;
  termsAndConditions?: string;
  maxRedemptions?: number;
}

interface UpdateOfferData extends Partial<CreateOfferData> {}

export interface OfferDraft {
  title: string;
  description: string;
  merchantName: string;
  merchantAddress: string;
  category: 'food_drink' | 'entertainment' | 'transport' | 'services' | 'shopping' | 'health' | 'education' | 'other';
  discountCode: string;
  discountPercentage: number;
  pointsReward: number;
  expiresAt: string;
  imageUrl: string;
  location: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][];
  } | null;
  isActive: boolean;
  termsAndConditions: string;
  maxRedemptions: number;
}

export interface ProductDraft {
  name: string;
  description: string;
  category: 'digital' | 'physical' | 'premium' | 'food' | 'entertainment' | 'services' | 'other';
  pointsCost: number;
  stock: number;
  imageUrl: string;
  provider: string;
  isActive: boolean;
  validityMinutes?: number;
}

interface ProductFilters extends Record<string, unknown> {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface RedemptionFilters extends Record<string, unknown> {
  status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  userId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface OfferFilters extends Record<string, unknown> {
  location?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Custom hook para lógica del formulario de productos
export const useProductForm = (
  initialDraft: ProductDraft,
  editing: MarketplaceProduct | null,
  onReset: () => void
) => {
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setDraft((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
      }));
    },
    []
  );

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const response = await marketplaceService.uploadFile(file);
      const uploadedUrl = response.data.url;
      if (uploadedUrl.startsWith('data:')) {
        throw new Error('El servidor devolvió datos base64 en lugar de una URL válida');
      }
      setDraft((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      throw error;
    }
  };

  const handleRemoveImage = () => setDraft((prev) => ({ ...prev, imageUrl: '' }));

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
    resetForm,
  };
};

// Custom hook para lógica del formulario de ofertas
export const useOfferForm = (
  initialDraft: OfferDraft,
  editing: GeographicOffer | null,
  onReset: () => void
) => {
  const [draft, setDraft] = useState<OfferDraft>(initialDraft);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setDraft((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
      }));
    },
    []
  );

  const handleLocationChange = useCallback(
    (location: { type: 'Point' | 'Polygon'; coordinates: number[] | number[][][] }) => {
      setDraft((prev) => ({ ...prev, location }));
    },
    []
  );

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await marketplaceService.uploadOfferFile(file);
      const uploadedUrl = result.data?.url || result.url;
      
      if (!uploadedUrl) {
        throw new Error('No se recibió URL del servidor');
      }
      
      if (uploadedUrl.startsWith('data:')) {
        throw new Error('El servidor devolvió datos base64 en lugar de una URL válida');
      }
      setDraft((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      throw error;
    }
  };

  const handleRemoveImage = () => setDraft((prev) => ({ ...prev, imageUrl: '' }));

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
    handleLocationChange,
    handleImageUpload,
    handleRemoveImage,
    resetForm,
  };
};

// Hook para obtener todos los productos
export const useMarketplaceProducts = (params: ProductFilters = {}) => {
  return useQuery<MarketplaceProduct[]>({
    queryKey: ['marketplace', 'products', params],
    queryFn: async () => {
      const response = await marketplaceService.getAllProducts(params);
      return response || [];
    },
    staleTime: 10 * 1000, // 10 segundos para desarrollo
  });
};

// Hook para obtener un producto específico
export const useMarketplaceProduct = (productId: string) => {
  return useQuery<MarketplaceProduct>({
    queryKey: ['marketplace', 'products', productId],
    queryFn: async () => {
      const response = await marketplaceService.getProduct(productId);
      return response.data;
    },
    enabled: !!productId,
  });
};

// Hook para estadísticas del marketplace
export const useMarketplaceStats = () => {
  return useQuery<MarketplaceStats>({
    queryKey: ['marketplace', 'stats'],
    queryFn: async () => {
      const response = await marketplaceService.getMarketplaceStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener todos los canjes/redemptions
export const useMarketplaceRedemptions = (params: RedemptionFilters = {}) => {
  return useQuery<Redemption[]>({
    queryKey: ['marketplace', 'redemptions', params],
    queryFn: async () => {
      const response = await marketplaceService.getAllRedemptions(params);
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Hook para obtener un canje específico
export const useMarketplaceRedemption = (redemptionId: string) => {
  return useQuery<Redemption>({
    queryKey: ['marketplace', 'redemptions', redemptionId],
    queryFn: async () => {
      const response = await marketplaceService.getRedemption(redemptionId);
      return response.data;
    },
    enabled: !!redemptionId,
  });
};

// Hook para ofertas geográficas
export const useMarketplaceOffers = (params: OfferFilters = {}) => {
  return useQuery<GeographicOffer[]>({
    queryKey: ['marketplace', 'offers', params],
    queryFn: async () => {
      const response = await marketplaceService.getAllOffers(params);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations para gestión de productos
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<MarketplaceProduct, Error, CreateProductData>({
    mutationFn: (productData: CreateProductData) => 
      marketplaceService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'stats'] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear el producto';
      toast.error(message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<MarketplaceProduct, Error, { productId: string; productData: UpdateProductData }>({
    mutationFn: ({ productId, productData }: { productId: string; productData: UpdateProductData }) => 
      marketplaceService.updateProduct(productId, productData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'products', variables.productId] });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar el producto';
      toast.error(message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (productId: string) => marketplaceService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'stats'] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar el producto';
      toast.error(message);
    },
  });
};

// Mutations para gestión de canjes
export const useConfirmRedemptionByCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Redemption, Error, string>({
    mutationFn: (code: string) => marketplaceService.confirmRedemptionByCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'stats'] });
      toast.success('Canje confirmado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al confirmar el canje';
      toast.error(message);
    },
  });
};

export const useMarkDeliveredByCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Redemption, Error, string>({
    mutationFn: (code: string) => marketplaceService.markDeliveredByCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'stats'] });
      toast.success('Producto marcado como entregado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al marcar como entregado';
      toast.error(message);
    },
  });
};

// Mutations para ofertas geográficas
export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<GeographicOffer, Error, CreateOfferData>({
    mutationFn: (offerData: CreateOfferData) => marketplaceService.createOffer(offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'offers'] });
      toast.success('Oferta creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al crear la oferta';
      toast.error(message);
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<GeographicOffer, Error, { offerId: string; offerData: UpdateOfferData }>({
    mutationFn: ({ offerId, offerData }: { offerId: string; offerData: UpdateOfferData }) => 
      marketplaceService.updateOffer(offerId, offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'offers'] });
      toast.success('Oferta actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al actualizar la oferta';
      toast.error(message);
    },
  });
};

export const useToggleOfferStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<GeographicOffer, Error, string>({
    mutationFn: (offerId: string) => marketplaceService.toggleOfferStatus(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'offers'] });
      toast.success('Estado de la oferta actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al cambiar estado de la oferta';
      toast.error(message);
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (offerId: string) => marketplaceService.deleteOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'offers'] });
      toast.success('Oferta eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Error al eliminar la oferta';
      toast.error(message);
    },
  });
};
