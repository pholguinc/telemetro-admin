import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image, Video, File, AlertCircle } from 'lucide-react';
import { buildImageUrl } from '../../config/environment';

interface FileUploaderProps {
  accept: 'image' | 'video' | 'audio' | 'both';
  currentUrl?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  label: string;
  required?: boolean;
  maxSize?: number; // en MB
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  currentUrl,
  onUpload,
  onRemove,
  label,
  required = false,
  maxSize = 10,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>(currentUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar preview con currentUrl cuando cambie (para edición)
  useEffect(() => {
    setPreview(currentUrl || '');
  }, [currentUrl]);

  const getAcceptTypes = () => {
    switch (accept) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      case 'both':
        return 'image/*,video/*';
      default:
        return '*/*';
    }
  };

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo es muy grande. Máximo ${maxSize}MB permitido.`;
    }

    // Validar tipo
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (accept === 'image' && !isImage) {
      return 'Solo se permiten archivos de imagen.';
    }

    if (accept === 'video' && !isVideo) {
      return 'Solo se permiten archivos de video.';
    }

    if (accept === 'audio' && !isAudio) {
      return 'Solo se permiten archivos de audio.';
    }

    if (accept === 'both' && !isImage && !isVideo) {
      return 'Solo se permiten archivos de imagen o video.';
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    // Validar archivo
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);

    try {
      // Crear preview local temporal SOLO para mostrar mientras se sube
      const reader = new FileReader();
      reader.onload = (e) => {
        // Solo mostrar preview temporal si aún estamos subiendo
        if (uploading) {
          setPreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Subir archivo al servidor
      const uploadedUrl = await onUpload(file);
      
      // Verificar que la URL del servidor no sea base64
      if (uploadedUrl.startsWith('data:')) {
        throw new Error('La función onUpload devolvió datos base64 en lugar de una URL válida');
      }
      
      // IMPORTANTE: Usar SOLO la URL del servidor, nunca el base64
      setPreview(uploadedUrl);
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Error al subir el archivo');
      setPreview(currentUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Simular selección de archivo
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const getFileIcon = () => {
    if (!preview) return <Upload className="h-8 w-8 text-gray-400" />;
    
    if (preview.includes('video') || preview.endsWith('.mp4') || preview.endsWith('.webm')) {
      return <Video className="h-8 w-8 text-blue-500" />;
    }
    
    if (preview.includes('audio') || preview.endsWith('.mp3') || preview.endsWith('.wav') || preview.endsWith('.ogg')) {
      return <File className="h-8 w-8 text-purple-500" />;
    }
    
    return <Image className="h-8 w-8 text-green-500" />;
  };

  const renderPreview = () => {
    if (!preview) return null;

    const isVideo = preview.includes('video') || preview.endsWith('.mp4') || preview.endsWith('.webm');
    const isAudio = preview.includes('audio') || preview.endsWith('.mp3') || preview.endsWith('.wav') || preview.endsWith('.ogg');
    const fullUrl = preview.startsWith('http') ? preview : buildImageUrl(preview);

    return (
      <div className="relative">
        {isVideo ? (
          <video
            src={fullUrl}
            className="w-full h-32 object-cover rounded-lg"
            controls
            preload="metadata"
          />
        ) : isAudio ? (
          <div className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <File className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">Archivo de Audio</span>
            </div>
            <audio
              src={fullUrl}
              className="w-full"
              controls
              preload="metadata"
            />
          </div>
        ) : (
          <img
            src={fullUrl}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              console.error('Error loading image:', fullUrl);
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw5MyA1NEw5OSA0OEwxMDUgNTRMMTEzIDQ2VjgySDg3VjQ4WiIgZmlsbD0iI0Q1RDlERiIvPgo8L3N2Zz4K';
            }}
          />
        )}
        
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          title="Eliminar archivo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        renderPreview()
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer ${
            uploading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptTypes()}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            ) : (
              getFileIcon()
            )}
            
            <div className="text-sm text-gray-600">
              {uploading ? (
                <span>Subiendo archivo...</span>
              ) : (
                <>
                  <span className="font-medium text-blue-600">Haz clic para subir</span>
                  <span> o arrastra y suelta</span>
                </>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {accept === 'image' && 'PNG, JPG, GIF hasta '}
              {accept === 'video' && 'MP4, WebM hasta '}
              {accept === 'audio' && 'MP3, WAV, OGG hasta '}
              {accept === 'both' && 'Imágenes o videos hasta '}
              {maxSize}MB
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

