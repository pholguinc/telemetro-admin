// pages/RadioAiPage.tsx
import React, { useState } from 'react';
import { 
  Music, 
  Brain, 
  TestTube, 
  BarChart3, 
  Settings,
  Radio,
  LucideIcon
} from 'lucide-react';
import RadioAiDashboard from '../../components/radio-ai/RadioAiDashboard';
import RadioAiTester from '../../components/radio-ai/RadioAiTester';

interface Tab {
  id: string;
  name: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

const RadioAiPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const tabs: Tab[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      component: RadioAiDashboard
    },
    {
      id: 'tester',
      name: 'Probador',
      icon: TestTube,
      component: RadioAiTester
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      component: () => (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analytics Avanzados
          </h3>
          <p className="text-gray-500">
            Próximamente: Reportes detallados de uso, patrones de ánimo, y métricas de rendimiento.
          </p>
        </div>
      )
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: Settings,
      component: () => (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Configuración del Sistema
          </h3>
          <p className="text-gray-500">
            Próximamente: Configuración de APIs, parámetros de cache, y ajustes de IA.
          </p>
        </div>
      )
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || RadioAiDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">RADIO.ai</h1>
                  <p className="text-sm text-gray-500">Inteligencia Artificial Musical</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4" />
                <span>Powered by Suno AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Análisis con OpenAI</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              RADIO.ai v1.0.0 - Feature Branch
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioAiPage;