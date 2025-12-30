import React, { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import imageService from '../../services/ImageService';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * Componente de imagen que maneja automáticamente problemas de CORS
 * Intenta cargar la imagen directamente, y si falla por CORS, usa un proxy
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  onError,
  onLoad
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [finalSrc, setFinalSrc] = useState<string | null>(null);
  const [loadMethod, setLoadMethod] = useState<'direct' | 'proxy' | 'blob'>('direct');
  const blobUrlRef = useRef<string | null>(null);

  // Función para crear URL con proxy CORS
  const createProxyUrl = (originalUrl: string): string => {
    // En desarrollo, usar el proxy de Vite
    if (import.meta.env.DEV) {
      // Extraer solo la parte /uploads/... de la URL
      const urlParts = originalUrl.split('/uploads/');
      if (urlParts.length > 1) {
        return `/uploads/${urlParts[1]}`;
      }
    }
    
    // En producción, intentar con diferentes estrategias
    // 1. Usar tu propio endpoint de proxy si existe
    // 2. Usar servicios públicos como fallback
    const corsProxyServices = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
    ];
    
    // Usar el primer servicio disponible
    return `${corsProxyServices[0]}${encodeURIComponent(originalUrl)}`;
  };

  // Función para verificar si una imagen se puede cargar
  const testImageLoad = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Timeout después de 5 segundos
      setTimeout(() => resolve(false), 5000);
      
      img.src = url;
    });
  };

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setImageError(false);
      setFinalSrc(null);
      setLoadMethod('direct');

      // Limpiar blob URL anterior si existe
      if (blobUrlRef.current) {
        imageService.cleanupBlobUrl(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      try {
        // Estrategia 1: Intentar carga directa
        const canLoadDirect = await imageService.canLoadDirectly(src);
        
        if (canLoadDirect) {
          setFinalSrc(src);
          setLoadMethod('direct');
          setIsLoading(false);
          onLoad?.();
          return;
        }

        // Estrategia 2: Usar proxy CORS (desarrollo) o servicio público
        console.warn(`CORS error loading image: ${src}, trying with proxy...`);
        const proxyUrl = createProxyUrl(src);
        const canLoadProxy = await testImageLoad(proxyUrl);
        
        if (canLoadProxy) {
          setFinalSrc(proxyUrl);
          setLoadMethod('proxy');
          setIsLoading(false);
          onLoad?.();
          return;
        }

        // Estrategia 3: Crear blob URL (solo si hay backend proxy disponible)
        if (!import.meta.env.DEV) {
          console.warn('Proxy failed, trying blob URL...');
          try {
            const blobUrl = await imageService.createBlobUrl(src);
            blobUrlRef.current = blobUrl;
            setFinalSrc(blobUrl);
            setLoadMethod('blob');
            setIsLoading(false);
            onLoad?.();
            return;
          } catch (blobError) {
            console.error('Blob URL creation failed:', blobError);
          }
        }

        // Si todo falla, mostrar error
        setImageError(true);
        setIsLoading(false);
        onError?.();

      } catch (error) {
        console.error('Error loading image:', error);
        setImageError(true);
        setIsLoading(false);
        onError?.();
      }
    };

    if (src) {
      loadImage();
    }

    // Cleanup al desmontar
    return () => {
      if (blobUrlRef.current) {
        imageService.cleanupBlobUrl(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src, onError, onLoad]);

  // Mostrar loading
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mostrar error
  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className}`}>
        <div className="text-center">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Error al cargar imagen</p>
          <p className="text-xs text-gray-400 mt-1">
            {loadMethod === 'direct' ? 'CORS bloqueado' : `Falló ${loadMethod}`}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar imagen (directa, proxy o blob)
  return (
    <img
      src={finalSrc || src}
      alt={alt}
      className={className}
      onError={() => {
        setImageError(true);
        onError?.();
      }}
      onLoad={() => onLoad?.()}
      crossOrigin={loadMethod === 'direct' ? 'anonymous' : undefined}
    />
  );
};

export default SafeImage;
