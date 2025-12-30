import React from 'react';
import { Activity, Server, Wifi, AlertTriangle } from 'lucide-react';
import { useBackendHealth, useActiveStreams } from '../../hooks/useStreamingHealth';

const StreamingHealth: React.FC = () => {
  const { data: backendHealth } = useBackendHealth();
  const { data: activeStreams = [] } = useActiveStreams();

  const getHealthColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Activity className="h-6 w-6 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'down':
        return <Server className="h-6 w-6 text-red-600" />;
      default:
        return <Server className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📡 Estado del Streaming</h1>
          <p className="text-gray-600 mt-2">Monitoreo de salud del sistema de streaming</p>
        </div>
      </div>

      {/* Estado del Backend */}
      {backendHealth && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Estado del Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getHealthIcon(backendHealth.status)}
              </div>
              <p className="text-sm text-gray-600">Estado General</p>
              <p className={`text-lg font-semibold ${getHealthColor(backendHealth.status)}`}>
                {backendHealth.status}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Wifi className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-lg font-semibold text-gray-900">
                {backendHealth.uptime}%
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Tiempo de Respuesta</p>
              <p className="text-lg font-semibold text-gray-900">
                {backendHealth.responseTime}ms
              </p>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Servicios</h3>
            {backendHealth.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{service.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{service.responseTime}ms</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.status === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streams Activos */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Streams en Vivo ({activeStreams.length})
        </h2>

        {activeStreams.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay streams activos
            </h3>
            <p className="text-gray-500">
              Los streams en vivo aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeStreams.map((stream, index) => (
              <div key={stream.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{stream.title}</h3>
                      <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full animate-pulse">
                        🔴 EN VIVO
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Streamer: {stream.streamerName}</span>
                      <span>Espectadores: {stream.viewers}</span>
                      <span>Duración: {Math.floor(stream.duration / 60)}m</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        stream.status === 'healthy' 
                          ? 'bg-green-100 text-green-700'
                          : stream.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {stream.quality} - {stream.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingHealth;
