/*
  Script de snapshot de API
  Uso: (asegúrate de tener el backend corriendo)
    - Opcional: establece SNAPSHOT_BASE_URL (por defecto http://localhost:8080/api)
    - Opcional: establece SNAPSHOT_TOKEN con un JWT de admin para endpoints protegidos
    - Ejecuta: npm run snapshot:api
*/

import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const BASE_URL = process.env.SNAPSHOT_BASE_URL || 'http://localhost:8080/api';
let TOKEN = process.env.SNAPSHOT_TOKEN || '';
const LOGIN_PHONE = process.env.SNAPSHOT_LOGIN_PHONE || '';
const LOGIN_PIN = process.env.SNAPSHOT_LOGIN_PIN || '';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

client.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${TOKEN}`;
  }
  return config;
});

const endpoints = [
  { name: 'users_page1', method: 'get', url: '/admin/users?page=1&limit=5' },
  { name: 'banners_all', method: 'get', url: '/banners/admin/all' },
  { name: 'admin_stats', method: 'get', url: '/admin/stats' },
  { name: 'games_all', method: 'get', url: '/admin/games' },
  { name: 'clips_all', method: 'get', url: '/clips/admin/all' },
  { name: 'marketplace_products', method: 'get', url: '/marketplace/products?limit=5' },
  { name: 'voto_parties', method: 'get', url: '/voto-seguro/parties' },
  { name: 'notifications_templates', method: 'get', url: '/notifications/templates' },
];

async function ensureToken() {
  if (TOKEN || !LOGIN_PHONE || !LOGIN_PIN) return;
  try {
    const res = await axios.post(`${BASE_URL}/auth/login-pin`, { phone: LOGIN_PHONE, pin: LOGIN_PIN }, { timeout: 15000 });
    TOKEN = res.data?.data?.token || res.data?.token || '';
    if (TOKEN) {
      console.log('Snapshot login OK: token obtenido.');
    } else {
      console.warn('Snapshot login: respuesta sin token, usando endpoints públicos.');
    }
  } catch (e) {
    console.warn('Snapshot login falló, usando endpoints públicos.', e.response?.status || e.message);
  }
}

async function run() {
  await ensureToken();
  const outDir = path.join(process.cwd(), 'snapshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  console.log(`Snapshot base URL: ${BASE_URL}`);
  const results = await Promise.allSettled(
    endpoints.map(async (ep) => {
      try {
        const res = await client.request({ method: ep.method, url: ep.url });
        const file = path.join(
          outDir,
          `${new Date().toISOString().replace(/[:.]/g, '-')}_${ep.name}.json`
        );
        fs.writeFileSync(file, JSON.stringify(res.data, null, 2), 'utf-8');
        return { name: ep.name, status: 'ok', file };
      } catch (err) {
        const status = err.response?.status || 'ERR';
        const data = err.response?.data;
        return { name: ep.name, status: 'error', httpStatus: status, message: data?.message || err.message };
      }
    })
  );

  const summary = results.map((r) => (r.status === 'fulfilled' ? r.value : { name: 'unknown', status: 'error', message: r.reason?.message })).filter(Boolean);
  console.table(summary);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


