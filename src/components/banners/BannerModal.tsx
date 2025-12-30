import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import FileUpload from "../common/FileUpload";
import SafeImage from "../common/SafeImage";
import {
  useCreateBanner,
  useUpdateBanner,
  useUploadBannerImage,
} from "../../hooks/useBanners";
import { Banner } from "../../models";
import { buildImageUrl, getBaseDomain } from "../../config/environment";

// Types
interface BannerFormData {
  title: string;
  description?: string;
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: (Banner & { id: string }) | null;
}

interface CreateBannerPayload extends Record<string, unknown> {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  type: string;
  status: string;
  backgroundColor: string;
  textColor: string;
  targetAudience: {
    roles: string[];
    location: string[];
  };
  schedule: {
    startDate: string;
    endDate: string;
    timezone: string;
  };
}

const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  onClose,
  banner = null,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(
    banner?.imageUrl || ""
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const isEditing = !!banner;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    defaultValues: {
      title: banner?.title || "",
      description: banner?.description || banner?.subtitle || "",
    },
  });

  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const uploadImage = useUploadBannerImage();

  useEffect(() => {
    if (isOpen) {
      reset({
        title: banner?.title || "",
        description: banner?.description || banner?.subtitle || "",
      });
      setUploadedImageUrl(banner?.imageUrl || "");
      setSelectedFile(null);
    }
  }, [isOpen, banner, reset]);

  const handleFileSelect = (file: File | null): void => {
    setSelectedFile(file);
  };

  const uploadImageFile = async (): Promise<string> => {
    if (!selectedFile) return uploadedImageUrl;

    setIsUploading(true);
    try {
      const response = await uploadImage.mutateAsync(selectedFile);
      const imageUrl = response.data.imageUrl; // ✅ Cambiar 'url' a 'imageUrl'
      setUploadedImageUrl(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: BannerFormData): Promise<void> => {
    try {
      let imageUrl = uploadedImageUrl;
      if (selectedFile) {
        imageUrl = await uploadImageFile();
      }

      if (!imageUrl) {
        throw new Error("Debe seleccionar una imagen para el banner");
      }

      const fullImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `${getBaseDomain()}${imageUrl}`;

      const bannerData: CreateBannerPayload = {
        title: data.title,
        subtitle: data.description || data.title,
        description:
          data.description || "Banner creado desde panel de administración",
        imageUrl: fullImageUrl, // URL completa
        type: "promotional",
        status: "active",
        backgroundColor: "#FF6B35",
        textColor: "#FFFFFF",
        targetAudience: {
          roles: [],
          location: [],
        },
        schedule: {
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          timezone: "America/Lima",
        },
      };

      if (isEditing && banner) {
        await updateBanner.mutateAsync({ id: banner.id, data: bannerData });
      } else {
        await createBanner.mutateAsync(bannerData);
      }

      handleClose();
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  const handleClose = (): void => {
    onClose();
    reset();
    setSelectedFile(null);
    setUploadedImageUrl("");
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const isSubmitDisabled =
    isSubmitting || isUploading || (!uploadedImageUrl && !selectedFile);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "✏️ Editar Banner" : "🎬 Crear Nuevo Banner"}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditing
                ? "Modifica los detalles del banner"
                : "Crea un banner atractivo para tu app"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título del Banner *
            </label>
            <input
              type="text"
              id="title"
              {...register("title", {
                required: "El título es requerido",
                minLength: {
                  value: 3,
                  message: "El título debe tener al menos 3 caracteres",
                },
              })}
              className={`input-field ${
                errors.title ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="Ej: Promoción Especial de Primavera"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="input-field resize-none"
              placeholder="Descripción adicional del banner..."
            />
          </div>

          {/* Upload de imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Banner *
            </label>

            {/* Mostrar imagen actual si existe */}
            {uploadedImageUrl && !selectedFile && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                <SafeImage
                  src={buildImageUrl(uploadedImageUrl)}
                  alt="Banner actual"
                  className="max-w-full max-h-32 rounded-lg shadow-sm"
                />
              </div>
            )}

            <FileUpload
              onFileSelect={handleFileSelect}
              accept="image/*,.gif"
              maxSize={30 * 1024 * 1024} // 30MB
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting || isUploading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>
                {isSubmitting || isUploading
                  ? isUploading
                    ? "Subiendo..."
                    : "Guardando..."
                  : isEditing
                  ? "Actualizar Banner"
                  : "Crear Banner"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;
