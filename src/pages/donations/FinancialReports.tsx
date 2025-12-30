import React from 'react';
import { FileText } from 'lucide-react';
import ComingSoon from '../../components/common/ComingSoon';

const FinancialReports: React.FC = () => {
  return (
    <ComingSoon
      title="Reportes Financieros"
      description="Reportes detallados de ingresos y donaciones"
      icon={FileText}
      features={[
        "Reportes de ingresos mensuales",
        "Análisis de donaciones",
        "Exportación a PDF/Excel",
        "Gráficos de tendencias",
        "Comparativas por período",
        "Métricas de crecimiento"
      ]}
    />
  );
};

export default FinancialReports;
