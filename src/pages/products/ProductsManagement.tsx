import React from 'react';
import { Package } from 'lucide-react';
import ComingSoon from '../../components/common/ComingSoon';

const ProductsManagement: React.FC = () => {
  return (
    <ComingSoon
      title="Gestión de Productos"
      description="Administra el catálogo completo de productos"
      icon={Package}
      features={[
        "Crear y editar productos",
        "Gestión de categorías",
        "Control de inventario",
        "Precios y descuentos",
        "Imágenes y descripciones",
        "Análisis de ventas"
      ]}
    />
  );
};

export default ProductsManagement;
