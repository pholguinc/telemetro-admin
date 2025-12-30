import { API_BASE_URL } from '../config/environment';
import api from './httpClient';

/**
 * Servicio para manejar imágenes con problemas de CORS
 */
class ImageService {
  
  /**
   * Convierte una imagen a base64 usando el backend como proxy
   * @param imageUrl URL de la imagen
   * @returns Promise con la imagen en base64
   */
  async getImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/proxy/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.base64Image;
    } catch (error) {
      console.error('Error fetching image via proxy:', error);
      throw error;
    }
  }

  /**
   * Crea un blob URL para una imagen con problemas de CORS
   * @param imageUrl URL de la imagen
   * @returns Promise con el blob URL
   */
  async createBlobUrl(imageUrl: string): Promise<string> {
    try {
      // Intentar fetch directo primero
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });

      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }

      throw new Error('Direct fetch failed');
    } catch (error) {
      // Si falla, usar proxy
      console.warn('Direct fetch failed, trying proxy...', error);
      
      try {
        const base64 = await this.getImageAsBase64(imageUrl);
        const blob = this.base64ToBlob(base64);
        return URL.createObjectURL(blob);
      } catch (proxyError) {
        console.error('Proxy fetch also failed:', proxyError);
        throw proxyError;
      }
    }
  }

  /**
   * Convierte base64 a blob
   * @param base64 String en base64
   * @returns Blob
   */
  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }

  /**
   * Limpia blob URLs para evitar memory leaks
   * @param blobUrl URL del blob a limpiar
   */
  cleanupBlobUrl(blobUrl: string): void {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  }

  /**
   * Verifica si una imagen se puede cargar directamente
   * @param imageUrl URL de la imagen
   * @returns Promise<boolean>
   */
  async canLoadDirectly(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = imageUrl;
    });
  }

  /**
   * Sube una imagen al servidor
   * @param file Archivo de imagen
   * @returns Promise con la URL de la imagen subida
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export const imageService = new ImageService();
export default imageService;
