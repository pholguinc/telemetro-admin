/**
 * Hook utilitario para manejar arrays de datos de forma segura
 * Evita errores como "XXX.map is not a function" cuando la API devuelve datos en formato inesperado
 */

export const useSafeArray = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object' && 'data' in data) {
    const nestedData = (data as any).data;
    if (Array.isArray(nestedData)) {
      return nestedData;
    }
  }
  
  return [];
};

/**
 * Hook para extraer datos de forma segura con logs de debug
 */
export const useSafeArrayWithDebug = <T>(
  data: unknown, 
  debugName: string
): T[] => {
  console.log(`🔍 ${debugName} - RAW data:`, data);
  console.log(`🔍 ${debugName} - Type:`, typeof data);
  console.log(`🔍 ${debugName} - Is Array:`, Array.isArray(data));
  
  const result = useSafeArray<T>(data);
  
  console.log(`🔍 ${debugName} - Processed array:`, result);
  console.log(`🔍 ${debugName} - Array length:`, result.length);
  
  return result;
};

/**
 * Componente wrapper para renderizar arrays de forma segura
 */
export const SafeArrayRender = <T>({ 
  data, 
  children, 
  fallback = null 
}: {
  data: T[];
  children: (item: T, index: number) => React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <>{fallback}</>;
  }
  
  return <>{data.map((item, index) => children(item, index))}</>;
};
