export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL;

// ✅ NUEVA: Extraer dominio base
export const getBaseDomain = (): string => {
  if (UPLOADS_BASE_URL) {
    return UPLOADS_BASE_URL.replace('/uploads', '');
  }
  if (API_BASE_URL) {
    return API_BASE_URL.replace('/api', '');
  }
  return 'http://localhost:8000'; // Fallback
};

// Validación
if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL no está definida. Usando http://localhost:8000 por defecto');
}

/**
 * Construye la URL completa para una imagen de upload
 */
export const buildImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = UPLOADS_BASE_URL.replace('/uploads', '');
    return `${baseUrl}${imagePath}`;
  }
  
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${UPLOADS_BASE_URL}${cleanPath}`;
};