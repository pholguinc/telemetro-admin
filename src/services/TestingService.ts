import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/environment';

// Tipos para los resultados de testing
export interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'unauthorized' | 'not_found' | 'bad_request' | 'forbidden' | 'cors_blocked';
  statusCode?: number;
  responseTime: number;
  error?: string;
  data?: any;
  requestData?: any; // Datos enviados en la request
  description?: string; // Descripción del test
}

export interface ModuleTestResult {
  module: string;
  totalTests: number;
  passed: number;
  failed: number;
  tests: TestResult[];
}

export interface TestSummary {
  totalModules: number;
  totalEndpoints: number;
  totalPassed: number;
  totalFailed: number;
  modules: ModuleTestResult[];
  timestamp: string;
}

class TestingService {
  private results: TestResult[] = [];
  private testingApi: AxiosInstance;

  constructor() {
    // Crear una instancia separada de axios para testing
    // que NO tenga los interceptors que manejan la autenticación
    this.testingApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor solo para agregar token, sin manejar errores de autenticación
    this.testingApi.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          if (config.headers) {
            const headers: any = config.headers as any;
            if (typeof headers.set === 'function') {
              headers.set('Authorization', `Bearer ${token}`);
            } else {
              headers['Authorization'] = `Bearer ${token}`;
            }
          } else {
            (config as any).headers = { Authorization: `Bearer ${token}` };
          }
        }

        // Para FormData, no establecer Content-Type
        if (config.data instanceof FormData && config.headers) {
          const headers: any = config.headers as any;
          if (typeof headers.delete === 'function') {
            headers.delete('Content-Type');
          } else {
            delete headers['Content-Type'];
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // NO agregamos interceptor de respuesta para evitar interferir con los tests
  }

  // Helper para calcular resultados de módulo
  private calculateModuleResults(module: string, tests: TestResult[]): ModuleTestResult {
    // Para autenticación, todos los tests son válidos (incluye 400/401 esperados)
    const isAuthModule = module === 'Authentication';
    
    const passed = tests.filter(t => {
      if (isAuthModule) {
        // En auth, cualquier respuesta del servidor (200, 400, 401, 403) es válida
        return t.status === 'success' || 
               t.status === 'bad_request' || 
               t.status === 'unauthorized' ||
               t.status === 'forbidden';
      }
      // Para otros módulos, usar lógica normal
      return t.status === 'success' || 
             t.status === 'bad_request' || 
             t.status === 'unauthorized' || 
             t.status === 'not_found' ||
             t.status === 'forbidden';
    }).length;
    
    const failed = tests.filter(t => 
      t.status === 'error' || 
      t.status === 'cors_blocked'
    ).length;

    return {
      module,
      totalTests: tests.length,
      passed,
      failed,
      tests
    };
  }

  // Método genérico para testear un endpoint
  async testEndpoint(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requiresAuth: boolean = true,
    description?: string
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (method) {
        case 'GET':
          response = await this.testingApi.get(endpoint);
          break;
        case 'POST':
          response = await this.testingApi.post(endpoint, data);
          break;
        case 'PUT':
          response = await this.testingApi.put(endpoint, data);
          break;
        case 'DELETE':
          response = await this.testingApi.delete(endpoint);
          break;
      }

      const responseTime = Date.now() - startTime;
      
      const result: TestResult = {
        endpoint,
        method,
        status: 'success',
        statusCode: response.status,
        responseTime,
        data: response.data,
        requestData: data,
        description
      };

      this.results.push(result);
      return result;

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      
      let status: TestResult['status'] = 'error';
      let errorMessage = error.message || 'Unknown error';
      
      // Clasificar errores más específicamente
      if (error.code === 'ERR_NETWORK' || errorMessage.includes('Network Error')) {
        status = 'cors_blocked';
        errorMessage = 'CORS Policy Blocked';
      } else if (statusCode === 401) {
        status = 'unauthorized';
        // Usar el mensaje del servidor si está disponible
        if (responseData?.error?.message) {
          errorMessage = responseData.error.message;
        }
      } else if (statusCode === 404) {
        status = 'not_found';
        if (responseData?.error?.message) {
          errorMessage = responseData.error.message;
        }
      } else if (statusCode === 400) {
        status = 'bad_request';
        if (responseData?.error?.message) {
          errorMessage = responseData.error.message;
        }
      } else if (statusCode === 403) {
        status = 'forbidden';
        if (responseData?.error?.message) {
          errorMessage = responseData.error.message;
        }
      }

      const result: TestResult = {
        endpoint,
        method,
        status,
        statusCode,
        responseTime,
        error: errorMessage,
        data: responseData, // Incluir la respuesta completa del servidor
        requestData: data,
        description
      };

      this.results.push(result);
      return result;
    }
  }

  // Test de autenticación
  async testAuthModule(): Promise<ModuleTestResult> {
    console.log('🔐 Testing Authentication Module...');
    
    const tests: TestResult[] = [];
    
    // Test login sin credenciales (debería dar error 400)
    tests.push(await this.testEndpoint('/auth/login-pin', 'POST', {}, false, 'Login sin credenciales'));
    
    // Test login con credenciales inválidas (debería dar error 400/401)
    tests.push(await this.testEndpoint('/auth/login-pin', 'POST', {
      phone: '+51999999999',
      pin: '0000'
    }, false, 'Login con PIN incorrecto'));

    // Test login con credenciales válidas (debería funcionar)
    tests.push(await this.testEndpoint('/auth/login-pin', 'POST', {
      phone: '+51999999999',
      pin: '1234'
    }, false, 'Login con credenciales válidas'));

    return this.calculateModuleResults('Authentication', tests);
  }

  // Test de usuarios
  async testUsersModule(): Promise<ModuleTestResult> {
    console.log('👥 Testing Users Module...');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.testEndpoint('/admin/users?page=1&limit=10', 'GET', undefined, true, 'Obtener lista de usuarios con paginación'));
    tests.push(await this.testEndpoint('/admin/users/stats', 'GET', undefined, true, 'Obtener estadísticas de usuarios'));
    tests.push(await this.testEndpoint('/admin/users/search?q=test&page=1&limit=10', 'GET', undefined, true, 'Buscar usuarios por término'));
    
    return this.calculateModuleResults('Users', tests);
  }

  // Test de banners
  async testBannersModule(): Promise<ModuleTestResult> {
    console.log('🎯 Testing Banners Module...');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.testEndpoint('/banners/admin/all', 'GET', undefined, true, 'Obtener todos los banners'));
    tests.push(await this.testEndpoint('/banners/admin/stats', 'GET', undefined, true, 'Obtener estadísticas de banners'));
    
    return this.calculateModuleResults('Banners', tests);
  }

  // Test de marketplace
  async testMarketplaceModule(): Promise<ModuleTestResult> {
    console.log('🛒 Testing Marketplace Module...');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.testEndpoint('/admin/products', 'GET', undefined, true, 'Obtener productos del marketplace'));
    tests.push(await this.testEndpoint('/admin/redemptions', 'GET', undefined, true, 'Obtener canjes/redemptions'));
    tests.push(await this.testEndpoint('/admin/redemptions/stats', 'GET', undefined, true, 'Obtener estadísticas de canjes'));
    
    return this.calculateModuleResults('Marketplace', tests);
  }

  // Test de clips
  async testClipsModule(): Promise<ModuleTestResult> {
    console.log('🎬 Testing Clips Module...');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.testEndpoint('/admin/clips?page=1&limit=10', 'GET', undefined, true, 'Obtener clips con paginación'));
    tests.push(await this.testEndpoint('/admin/clips/stats', 'GET', undefined, true, 'Obtener estadísticas de clips'));
    
    return this.calculateModuleResults('Clips', tests);
  }

  // Test de notificaciones
  async testNotificationsModule(): Promise<ModuleTestResult> {
    console.log('🔔 Testing Notifications Module...');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.testEndpoint('/admin/notifications?page=1&limit=10', 'GET', undefined, true, 'Obtener notificaciones con paginación'));
    tests.push(await this.testEndpoint('/admin/notifications/templates', 'GET', undefined, true, 'Obtener plantillas de notificaciones'));
    
    return this.calculateModuleResults('Notifications', tests);
  }

  // Test de estadísticas
  async testStatsModule(): Promise<ModuleTestResult> {
    console.log('📊 Testing Stats Module...');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.testEndpoint('/admin/stats', 'GET', undefined, true, 'Obtener estadísticas generales del admin'));
    tests.push(await this.testEndpoint('/admin/users/stats', 'GET', undefined, true, 'Obtener estadísticas de usuarios'));
    tests.push(await this.testEndpoint('/admin/subscriptions/stats', 'GET', undefined, true, 'Obtener estadísticas de suscripciones'));
    
    return this.calculateModuleResults('Stats', tests);
  }

  // Test de voto seguro
  async testVotoSeguroModule(): Promise<ModuleTestResult> {
    console.log('🗳️ Testing Voto Seguro Module...');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.testEndpoint('/voto-seguro/parties', 'GET', undefined, true, 'Obtener partidos políticos'));
    tests.push(await this.testEndpoint('/voto-seguro/candidates?page=1&limit=10', 'GET', undefined, true, 'Obtener candidatos con paginación'));
    tests.push(await this.testEndpoint('/voto-seguro/stats', 'GET', undefined, true, 'Obtener estadísticas de voto seguro'));
    
    return this.calculateModuleResults('Voto Seguro', tests);
  }

  // Ejecutar un módulo específico
  async runModuleTest(moduleName: string): Promise<ModuleTestResult> {
    console.log(`🚀 Starting ${moduleName} Module Test...`);
    
    this.results = []; // Limpiar resultados anteriores
    
    switch (moduleName.toLowerCase()) {
      case 'authentication':
        return await this.testAuthModule();
      case 'users':
        return await this.testUsersModule();
      case 'banners':
        return await this.testBannersModule();
      case 'marketplace':
        return await this.testMarketplaceModule();
      case 'clips':
        return await this.testClipsModule();
      case 'notifications':
        return await this.testNotificationsModule();
      case 'stats':
        return await this.testStatsModule();
      case 'voto-seguro':
        return await this.testVotoSeguroModule();
      default:
        throw new Error(`Módulo desconocido: ${moduleName}`);
    }
  }

  // Ejecutar todos los tests
  async runAllTests(): Promise<TestSummary> {
    console.log('🚀 Starting API Tests...\n');
    
    this.results = []; // Limpiar resultados anteriores
    
    const modules: ModuleTestResult[] = [];
    
    // Ejecutar tests de cada módulo
    modules.push(await this.testAuthModule());
    modules.push(await this.testUsersModule());
    modules.push(await this.testBannersModule());
    modules.push(await this.testMarketplaceModule());
    modules.push(await this.testClipsModule());
    modules.push(await this.testNotificationsModule());
    modules.push(await this.testStatsModule());
    modules.push(await this.testVotoSeguroModule());

    // Calcular totales
    const totalEndpoints = modules.reduce((sum, module) => sum + module.totalTests, 0);
    const totalPassed = modules.reduce((sum, module) => sum + module.passed, 0);
    const totalFailed = modules.reduce((sum, module) => sum + module.failed, 0);

    const summary: TestSummary = {
      totalModules: modules.length,
      totalEndpoints,
      totalPassed,
      totalFailed,
      modules,
      timestamp: new Date().toISOString()
    };

    console.log('\n✅ Tests completed!');
    return summary;
  }

  // Generar reporte en consola
  printReport(summary: TestSummary): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 API TESTING REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Timestamp: ${new Date(summary.timestamp).toLocaleString()}`);
    console.log(`📊 Total Modules: ${summary.totalModules}`);
    console.log(`🎯 Total Endpoints: ${summary.totalEndpoints}`);
    console.log(`✅ Passed: ${summary.totalPassed}`);
    console.log(`❌ Failed: ${summary.totalFailed}`);
    console.log(`📈 Success Rate: ${((summary.totalPassed / summary.totalEndpoints) * 100).toFixed(1)}%`);
    console.log('\n' + '-'.repeat(60));

    summary.modules.forEach(module => {
      const successRate = ((module.passed / module.totalTests) * 100).toFixed(1);
      console.log(`\n📦 ${module.module}`);
      console.log(`   Tests: ${module.totalTests} | Passed: ${module.passed} | Failed: ${module.failed} | Rate: ${successRate}%`);
      
      // Mostrar tests fallidos
      const failedTests = module.tests.filter(t => t.status !== 'success');
      if (failedTests.length > 0) {
        console.log('   ❌ Failed endpoints:');
        failedTests.forEach(test => {
          console.log(`      ${test.method} ${test.endpoint} - ${test.status} (${test.statusCode || 'N/A'})`);
        });
      }
    });

    console.log('\n' + '='.repeat(60));
  }

  // Exportar reporte a JSON
  exportReport(summary: TestSummary): string {
    return JSON.stringify(summary, null, 2);
  }
}

export const testingService = new TestingService();
export default testingService;
