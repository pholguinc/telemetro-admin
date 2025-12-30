#!/usr/bin/env node

/**
 * Script para ejecutar tests de API desde línea de comandos
 * Uso: node scripts/test-api.js [module]
 * 
 * Ejemplos:
 * - node scripts/test-api.js           # Ejecutar todos los tests
 * - node scripts/test-api.js auth      # Solo tests de autenticación
 * - node scripts/test-api.js users     # Solo tests de usuarios
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://apis-telemetro.widecom.net/api';
const OUTPUT_DIR = './test-reports';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Crear cliente axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clase para manejar tests
class ApiTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async testEndpoint(endpoint, method = 'GET', data = null, description = '') {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await api.get(endpoint);
          break;
        case 'POST':
          response = await api.post(endpoint, data);
          break;
        case 'PUT':
          response = await api.put(endpoint, data);
          break;
        case 'DELETE':
          response = await api.delete(endpoint);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }

      const responseTime = Date.now() - startTime;
      
      const result = {
        endpoint,
        method: method.toUpperCase(),
        status: 'success',
        statusCode: response.status,
        responseTime,
        description,
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      this.log(`✅ ${method} ${endpoint} - ${response.status} (${responseTime}ms)`, 'green');
      
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const statusCode = error.response?.status || 0;
      
      let status = 'error';
      if (statusCode === 401) status = 'unauthorized';
      if (statusCode === 404) status = 'not_found';

      const result = {
        endpoint,
        method: method.toUpperCase(),
        status,
        statusCode,
        responseTime,
        description,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      
      const statusColor = statusCode === 401 ? 'yellow' : 'red';
      this.log(`❌ ${method} ${endpoint} - ${statusCode || 'ERROR'} (${responseTime}ms) - ${error.message}`, statusColor);
      
      return result;
    }
  }

  async testAuthModule() {
    this.log('\n🔐 Testing Authentication Module...', 'cyan');
    
    await this.testEndpoint('/auth/login-pin', 'POST', {}, 'Login sin credenciales');
    await this.testEndpoint('/auth/login-pin', 'POST', {
      phone: '+51999999999',
      pin: '0000'
    }, 'Login con credenciales inválidas');
    await this.testEndpoint('/auth/login-pin', 'POST', {
      phone: '+51999999999',
      pin: '1234'
    }, 'Login con credenciales válidas');
  }

  async testUsersModule() {
    this.log('\n👥 Testing Users Module...', 'cyan');
    
    await this.testEndpoint('/users', 'GET', null, 'Listar usuarios');
    await this.testEndpoint('/users/stats', 'GET', null, 'Estadísticas de usuarios');
    await this.testEndpoint('/users/search?q=test', 'GET', null, 'Buscar usuarios');
  }

  async testBannersModule() {
    this.log('\n🎯 Testing Banners Module...', 'cyan');
    
    await this.testEndpoint('/banners', 'GET', null, 'Listar banners');
    await this.testEndpoint('/banners/stats', 'GET', null, 'Estadísticas de banners');
  }

  async testMarketplaceModule() {
    this.log('\n🛒 Testing Marketplace Module...', 'cyan');
    
    await this.testEndpoint('/marketplace/products', 'GET', null, 'Listar productos');
    await this.testEndpoint('/marketplace/stats', 'GET', null, 'Estadísticas del marketplace');
    await this.testEndpoint('/marketplace/redemptions', 'GET', null, 'Listar canjes');
    await this.testEndpoint('/marketplace/offers', 'GET', null, 'Listar ofertas');
  }

  async testClipsModule() {
    this.log('\n🎬 Testing Clips Module...', 'cyan');
    
    await this.testEndpoint('/clips', 'GET', null, 'Listar clips');
    await this.testEndpoint('/clips/stats', 'GET', null, 'Estadísticas de clips');
  }

  async testNotificationsModule() {
    this.log('\n🔔 Testing Notifications Module...', 'cyan');
    
    await this.testEndpoint('/notifications', 'GET', null, 'Listar notificaciones');
    await this.testEndpoint('/notifications/templates', 'GET', null, 'Plantillas de notificaciones');
  }

  async testStatsModule() {
    this.log('\n📊 Testing Stats Module...', 'cyan');
    
    await this.testEndpoint('/admin/stats', 'GET', null, 'Estadísticas del admin');
    await this.testEndpoint('/stats/users', 'GET', null, 'Estadísticas de usuarios');
    await this.testEndpoint('/stats/revenue', 'GET', null, 'Estadísticas de ingresos');
  }

  async testVotoSeguroModule() {
    this.log('\n🗳️ Testing Voto Seguro Module...', 'cyan');
    
    await this.testEndpoint('/voto/parties', 'GET', null, 'Listar partidos');
    await this.testEndpoint('/voto/stats', 'GET', null, 'Estadísticas de voto seguro');
  }

  async runAllTests() {
    this.log('🚀 Starting API Tests...', 'bright');
    this.log(`📡 API Base URL: ${API_BASE_URL}`, 'blue');
    this.log(`⏰ Started at: ${new Date().toLocaleString()}`, 'blue');
    
    await this.testAuthModule();
    await this.testUsersModule();
    await this.testBannersModule();
    await this.testMarketplaceModule();
    await this.testClipsModule();
    await this.testNotificationsModule();
    await this.testStatsModule();
    await this.testVotoSeguroModule();
    
    this.generateReport();
  }

  async runModuleTest(moduleName) {
    this.log(`🚀 Starting ${moduleName} Module Tests...`, 'bright');
    this.log(`📡 API Base URL: ${API_BASE_URL}`, 'blue');
    
    switch (moduleName.toLowerCase()) {
      case 'auth':
        await this.testAuthModule();
        break;
      case 'users':
        await this.testUsersModule();
        break;
      case 'banners':
        await this.testBannersModule();
        break;
      case 'marketplace':
        await this.testMarketplaceModule();
        break;
      case 'clips':
        await this.testClipsModule();
        break;
      case 'notifications':
        await this.testNotificationsModule();
        break;
      case 'stats':
        await this.testStatsModule();
        break;
      case 'voto':
        await this.testVotoSeguroModule();
        break;
      default:
        this.log(`❌ Módulo desconocido: ${moduleName}`, 'red');
        this.log('Módulos disponibles: auth, users, banners, marketplace, clips, notifications, stats, voto', 'yellow');
        return;
    }
    
    this.generateReport();
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'success').length;
    const failed = totalTests - passed;
    const successRate = ((passed / totalTests) * 100).toFixed(1);

    // Reporte en consola
    this.log('\n' + '='.repeat(60), 'bright');
    this.log('📋 API TESTING REPORT', 'bright');
    this.log('='.repeat(60), 'bright');
    this.log(`⏱️  Total Time: ${totalTime}ms`, 'blue');
    this.log(`🎯 Total Tests: ${totalTests}`, 'blue');
    this.log(`✅ Passed: ${passed}`, 'green');
    this.log(`❌ Failed: ${failed}`, 'red');
    this.log(`📈 Success Rate: ${successRate}%`, passed === totalTests ? 'green' : 'yellow');

    // Mostrar tests fallidos
    const failedTests = this.results.filter(r => r.status !== 'success');
    if (failedTests.length > 0) {
      this.log('\n❌ Failed Tests:', 'red');
      failedTests.forEach(test => {
        this.log(`   ${test.method} ${test.endpoint} - ${test.statusCode || 'ERROR'}`, 'red');
      });
    }

    // Guardar reporte JSON
    this.saveReport();
    
    this.log('\n✅ Tests completed!', 'green');
  }

  saveReport() {
    // Crear directorio si no existe
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      apiBaseUrl: API_BASE_URL,
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'success').length,
      failed: this.results.filter(r => r.status !== 'success').length,
      results: this.results
    };

    const filename = `api-test-report-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    this.log(`💾 Report saved: ${filepath}`, 'blue');
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const moduleName = args[0];

  const tester = new ApiTester();

  try {
    if (moduleName) {
      await tester.runModuleTest(moduleName);
    } else {
      await tester.runAllTests();
    }
  } catch (error) {
    console.error('❌ Error ejecutando tests:', error.message);
    process.exit(1);
  }
}

export { ApiTester };

// Ejecutar directamente
main().catch(console.error);
