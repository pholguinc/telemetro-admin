import React from 'react';
import { TrendingUp } from 'lucide-react';
import ComingSoon from '../../components/common/ComingSoon';

const StreamingAnalytics: React.FC = () => {
  return (
    <ComingSoon
      title="Analytics de Streaming"
      description="Análisis detallado de métricas de streaming"
      icon={TrendingUp}
      features={[
        "Métricas de audiencia en tiempo real",
        "Análisis de engagement",
        "Reportes de ingresos por streamer",
        "Tendencias de contenido",
        "Comparativas de rendimiento",
        "Exportación de datos"
      ]}
    />
  );
};

export default StreamingAnalytics;
