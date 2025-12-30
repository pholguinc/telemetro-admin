import React from 'react';
import { Construction, ArrowLeft, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description, 
  icon: Icon = Construction,
  features = []
}) => {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-6">
            <Icon className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{description}</p>

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximamente incluirá:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-2 text-primary-700">
            <Construction className="h-5 w-5" />
            <span className="font-medium">En Desarrollo</span>
          </div>
          <p className="text-primary-600 mt-2">
            Este módulo está siendo desarrollado y estará disponible pronto.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/"
            className="btn-primary flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          
          <Link 
            to="/banners"
            className="btn-secondary flex items-center space-x-2"
          >
            <span>Ir a Gestión de Banners</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
