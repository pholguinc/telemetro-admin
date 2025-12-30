import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BannersService as bannersService } from "../services";
import { Banner } from "../models";
import toast from "react-hot-toast";
import { buildImageUrl } from "@/config/environment";

interface CreateBannerData extends Record<string, unknown> {
  title: string;
  subtitle: string;
  description: string;
  type: string;
  status: string;
  imageUrl: string;
  backgroundColor: string;
  textColor: string;
  gradient?: {
    colors: string[];
    direction: string;
  };
  actionType?: string;
  targetAudience?: {
    roles: string[];
    location: string[];
  };
  schedule?: {
    startDate: string;
    endDate: string;
    timezone: string;
  };
  isActive?: boolean;
  priority?: number;
  displayOrder?: number;
}

interface UpdateBannerData extends Partial<CreateBannerData> {}

interface BannerWithId extends Banner {
  id: string;
}

interface UploadImageResponse {
  success: boolean;
  data: {
    imageUrl: string; // ✅ Cambiar de 'url' a 'imageUrl'
    filename?: string;
    sizes?: {
      mobile: string;
      tablet: string;
      desktop: string;
      square: string;
      wide: string;
    };
  };
}

// Hook para obtener todos los banners
export const useBanners = () => {
  return useQuery<BannerWithId[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      try {
        const banners = await bannersService.getAll();

        // Solo transformar _id a id (SIN tocar imageUrl)
        const transformedBanners = banners.map(
          (banner: Banner): BannerWithId => ({
            ...banner,
            id: banner._id || (banner as any).id,
          })
        );

        return transformedBanners;
      } catch (error) {
        console.error("❌ Error in useBanners:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear un banner
export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation<Banner, Error, CreateBannerData>({
    mutationFn: (data: CreateBannerData) => bannersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner creado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al crear banner";
      toast.error(message);
    },
  });
};

// Hook para actualizar un banner
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation<Banner, Error, { id: string; data: UpdateBannerData }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerData }) =>
      bannersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner actualizado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al actualizar banner";
      toast.error(message);
    },
  });
};

// Hook para eliminar un banner
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => bannersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner eliminado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al eliminar banner";
      toast.error(message);
    },
  });
};

// Hook para subir imagen
export const useUploadBannerImage = () => {
  return useMutation<UploadImageResponse, Error, File>({
    mutationFn: (file: File) => bannersService.uploadImage(file),
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Error al subir imagen";
      toast.error(message);
    },
  });
};
