import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

// Types
interface FilePreview {
  url: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept = "image/*,.gif", 
  maxSize = 30 * 1024 * 1024, // 30MB
  className = "" 
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`);
      return false;
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato no válido. Use JPG, PNG, GIF o WEBP.');
      return false;
    }

    return true;
  };

  const handleFile = (file: File): void => {
    if (!validateFile(file)) {
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setPreview({
          url: e.target.result as string,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    };
    reader.readAsDataURL(file);

    // Notificar al componente padre
    onFileSelect(file);
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearPreview = (): void => {
    setPreview(null);
    setError(null);
    onFileSelect(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadAreaClick = (): void => {
    if (!preview) {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      fileInput?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de subida */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive 
            ? 'border-primary-400 bg-primary-50 scale-105' 
            : preview 
              ? 'border-green-300 bg-green-50' 
              : error 
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${!preview ? 'cursor-pointer' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {!preview ? (
          <>
            <div className={`mx-auto w-12 h-12 mb-4 ${error ? 'text-red-400' : 'text-gray-400'}`}>
              {error ? <AlertCircle className="w-full h-full" /> : <Upload className="w-full h-full" />}
            </div>
            
            <h3 className={`text-lg font-medium mb-2 ${error ? 'text-red-700' : 'text-gray-900'}`}>
              {error ? 'Error en el archivo' : 'Sube tu imagen o GIF'}
            </h3>
            
            <p className={`text-sm mb-4 ${error ? 'text-red-600' : 'text-gray-500'}`}>
              {error || 'Arrastra y suelta aquí, o haz clic para seleccionar'}
            </p>
            
            <div className="text-xs text-gray-400">
              <p>Formatos: JPG, PNG, GIF, WEBP</p>
              <p>Tamaño máximo: {Math.round(maxSize / (1024 * 1024))}MB</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview.url}
                alt="Preview"
                className="max-w-full max-h-48 rounded-lg shadow-md"
              />
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  clearPreview();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <FileImage className="w-4 h-4" />
                <span className="font-medium">{preview.name}</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <span>{formatFileSize(preview.size)}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                  ✓ Listo para subir
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
