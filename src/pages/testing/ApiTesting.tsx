import React, { useState } from 'react';
import { Play, Download, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import testingService, { TestSummary, ModuleTestResult, TestResult } from '../../services/TestingService';

const ApiTesting: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSummary | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedTestModule, setSelectedTestModule] = useState<string>('all');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      let results;
      if (selectedTestModule === 'all') {
        results = await testingService.runAllTests();
      } else {
        const moduleResult = await testingService.runModuleTest(selectedTestModule);
        results = {
          totalModules: 1,
          totalEndpoints: moduleResult.totalTests,
          totalPassed: moduleResult.passed,
          totalFailed: moduleResult.failed,
          modules: [moduleResult],
          timestamp: new Date().toISOString()
        };
      }
      setTestResults(results);
      testingService.printReport(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!testResults) return;
    
    const reportJson = testingService.exportReport(testResults);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cors_blocked':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'unauthorized':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'not_found':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'bad_request':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'forbidden':
        return <XCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-100';
      case 'error':
        return 'text-red-700 bg-red-100';
      case 'cors_blocked':
        return 'text-orange-700 bg-orange-100';
      case 'unauthorized':
        return 'text-yellow-700 bg-yellow-100';
      case 'not_found':
        return 'text-gray-700 bg-gray-100';
      case 'bad_request':
        return 'text-blue-700 bg-blue-100';
      case 'forbidden':
        return 'text-purple-700 bg-purple-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getModuleSuccessRate = (module: ModuleTestResult) => {
    return ((module.passed / module.totalTests) * 100).toFixed(1);
  };

  const availableModules = [
    { value: 'all', label: 'Todos los Módulos' },
    { value: 'authentication', label: '🔐 Authentication' },
    { value: 'users', label: '👥 Users' },
    { value: 'banners', label: '🎯 Banners' },
    { value: 'marketplace', label: '🛒 Marketplace' },
    { value: 'clips', label: '🎬 Clips' },
    { value: 'notifications', label: '🔔 Notifications' },
    { value: 'stats', label: '📊 Stats' },
    { value: 'voto-seguro', label: '🗳️ Voto Seguro' }
  ];

  const formatJsonData = (data: any) => {
    if (!data) return 'N/A';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const toggleTestDetails = (testKey: string) => {
    setExpandedTest(expandedTest === testKey ? null : testKey);
  };

  const toggleAllTestsInModule = (moduleName: string, totalTests: number) => {
    const isCurrentlyExpanded = expandedModules[moduleName];
    
    if (isCurrentlyExpanded) {
      // Contraer todos
      setExpandedModules(prev => ({ ...prev, [moduleName]: false }));
      setExpandedTest(null);
    } else {
      // Expandir todos
      setExpandedModules(prev => ({ ...prev, [moduleName]: true }));
      // Expandir el primer test para que se vea el efecto inmediatamente
      setExpandedTest(`${moduleName}-0`);
    }
  };

  const isTestExpanded = (testKey: string, moduleName: string) => {
    return expandedModules[moduleName] || expandedTest === testKey;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 API Testing Suite</h1>
        <p className="text-gray-600">
          Ejecuta tests automatizados para verificar el estado de todos los endpoints de la API
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Module Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 min-w-fit">
              Seleccionar Módulo:
            </label>
            <select
              value={selectedTestModule}
              onChange={(e) => setSelectedTestModule(e.target.value)}
              disabled={isRunning}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              {availableModules.map((module) => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Ejecutando Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    {selectedTestModule === 'all' ? 'Ejecutar Todos los Tests' : `Ejecutar ${availableModules.find(m => m.value === selectedTestModule)?.label}`}
                  </>
                )}
              </button>

              {testResults && (
                <button
                  onClick={downloadReport}
                  className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar Reporte
                </button>
              )}
            </div>

            {testResults && (
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Última ejecución: {new Date(testResults.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Legend */}
      {testResults && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Leyenda de Estados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✅ Funciona</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>🚫 CORS Bloqueado</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>🔒 Sin Autorización</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-500" />
              <span>❓ No Encontrado</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <span>📝 Datos Inválidos</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-purple-500" />
              <span>🚷 Prohibido</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>💥 Error Servidor</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {testResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
                <p className="text-2xl font-bold text-gray-900">{testResults.totalEndpoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Exitosos</p>
                <p className="text-2xl font-bold text-green-600">{testResults.totalPassed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fallidos</p>
                <p className="text-2xl font-bold text-red-600">{testResults.totalFailed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((testResults.totalPassed / testResults.totalEndpoints) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modules Results */}
      {testResults && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Resultados por Módulo</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {testResults.modules.map((module, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center space-x-4 cursor-pointer flex-1"
                    onClick={() => setSelectedModule(selectedModule === module.module ? null : module.module)}
                  >
                    <h3 className="text-lg font-medium text-gray-900">{module.module}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      module.failed === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {getModuleSuccessRate(module)}% éxito
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Total: {module.totalTests}</span>
                      <span className="text-green-600">✓ {module.passed}</span>
                      <span className="text-red-600">✗ {module.failed}</span>
                    </div>
                    
                    {selectedModule === module.module && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAllTestsInModule(module.module, module.totalTests);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        {expandedModules[module.module] ? '📁 Contraer Todos' : '📂 Expandir Todos'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Detailed Results */}
                {selectedModule === module.module && (
                  <div className="mt-4 space-y-3">
                    {module.tests.map((test, testIndex) => {
                      const testKey = `${module.module}-${testIndex}`;
                      const isExpanded = isTestExpanded(testKey, module.module);
                      
                      return (
                        <div key={testIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Test Header */}
                          <div 
                            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => {
                              if (expandedModules[module.module]) {
                                // Si el módulo está expandido, no hacer nada individual
                                return;
                              }
                              toggleTestDetails(testKey);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(test.status)}
                              <span className="font-mono text-sm">
                                <span className="font-semibold text-blue-600">{test.method}</span>
                                <span className="text-gray-700 ml-2">{test.endpoint}</span>
                              </span>
                              {test.description && (
                                <span className="text-xs text-gray-500 italic">
                                  - {test.description}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                                {test.status}
                              </span>
                              {test.statusCode && (
                                <span className="text-xs text-gray-500">
                                  {test.statusCode}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {test.responseTime}ms
                              </span>
                              <span className="text-xs text-blue-600">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                          </div>

                          {/* Test Details */}
                          {isExpanded && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Request Data */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                    📤 Request Data
                                  </h4>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-600 mb-2">
                                      <strong>URL:</strong> {test.endpoint}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">
                                      <strong>Method:</strong> {test.method}
                                    </div>
                                    {test.requestData && (
                                      <div>
                                        <div className="text-xs text-gray-600 mb-1">
                                          <strong>Body:</strong>
                                        </div>
                                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                          {formatJsonData(test.requestData)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Response Data */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                    📥 Response Data
                                  </h4>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-600 mb-2">
                                      <strong>Status:</strong> {test.statusCode || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">
                                      <strong>Time:</strong> {test.responseTime}ms
                                    </div>
                                    {test.error && (
                                      <div className="mb-2">
                                        <div className="text-xs text-red-600 mb-1">
                                          <strong>Error Message:</strong>
                                        </div>
                                        <div className="text-xs bg-red-50 text-red-700 p-2 rounded">
                                          {test.error}
                                        </div>
                                      </div>
                                    )}
                                    {test.data && (
                                      <div>
                                        <div className="text-xs text-gray-600 mb-1">
                                          <strong>Response Body:</strong>
                                        </div>
                                        <pre className={`text-xs p-2 rounded overflow-x-auto max-h-40 overflow-y-auto ${
                                          test.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                        }`}>
                                          {formatJsonData(test.data)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ejecutando Tests...</h3>
          <p className="text-gray-600">
            Esto puede tomar unos minutos. Los resultados aparecerán aquí cuando terminen.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!testResults && !isRunning && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">¿Listo para testear?</h3>
          <p className="text-gray-600 mb-6">
            Selecciona un módulo específico o ejecuta todos los tests para verificar el estado de los endpoints de la API.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              💡 Haz clic en cualquier test para ver los detalles de request y response
            </span>
          </p>
          <button
            onClick={runTests}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Play className="h-5 w-5 mr-2" />
            Comenzar Tests
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiTesting;
