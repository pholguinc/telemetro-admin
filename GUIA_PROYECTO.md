# 📱 Telemetro Admin Dashboard - Guía del Proyecto

Este documento resume la funcionalidad, configuración y ejecución del panel administrativo de Telemetro.

## 📋 Descripción General

El **Telemetro Admin Dashboard** es una aplicación web desarrollada en **React** con **Vite** y **TypeScript**. Su propósito principal es la administración de contenidos para la plataforma Telemetro, permitiendo gestionar clips de video, usuarios, autenticación y estadísticas.

## 🚀 Requisitos Previos

- **Node.js**: Versión 16 o superior.
- **npm**: Gestor de paquetes incluido con Node.js.

## 🛠️ Instalación y Configuración

1.  **Clonar/Descargar el repositorio**:
    Asegúrate de tener los archivos del proyecto en tu máquina local.

2.  **Instalar dependencias**:
    Abre una terminal en la carpeta raíz del proyecto y ejecuta:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    El proyecto requiere un archivo `.env` en la raíz para conectar con el backend.
    
    Crea o modifica el archivo `.env` con el siguiente contenido:
    ```env
    VITE_API_BASE_URL=https://api-dashboard.telemetro.pe/api
    VITE_UPLOADS_BASE_URL=https://api-dashboard.telemetro.pe/uploads
    ```

## ▶️ Ejecución del Proyecto

### Modo Desarrollo
Para iniciar la aplicación en modo de desarrollo local:
```bash
npm run dev
```
La aplicación estará disponible típicamente en `http://localhost:5173`.

### Construcción para Producción
Para generar los archivos estáticos optimizados para producción:
```bash
npm run build
```

## 🔑 Credenciales de Acceso (Entorno de Pruebas)

Para acceder al panel administrativo, puedes utilizar las siguientes credenciales de prueba:
- **Teléfono**: `+51999999999`
- **PIN**: `1234`

## 🧩 Funcionalidades Principales

El panel cuenta con varios módulos clave ubicados en `src/pages`:

*   **Autenticación**: Login con PIN (`src/pages/auth`).
*   **Gestión de Clips**:
    *   Listado, filtrado y búsqueda de videos.
    *   Subida de nuevos clips (Soporte para YouTube y archivos directos).
    *   Moderación y edición de metadatos.
    *   Ubicación: `src/pages/clips/ClipsManagement.tsx`.
*   **Servicios API**:
    *   Configuración centralizada de Axios en `src/services/httpClient.ts`.
    *   Servicios específicos por módulo (Clips, Auth, Ads, etc.) en `src/services`.

## 🧪 Scripts de Utilidad

El proyecto incluye scripts para verificar la conexión con la API:

*   **Test de API**: Ejecuta pruebas de conexión y funcionalidad contra el backend.
    ```bash
    # Probar todos los módulos
    node scripts/test-api.js

    # Probar solo autenticación
    node scripts/test-api.js auth

    # Probar solo clips
    node scripts/test-api.js clips
    ```
    Estos scripts generan reportes en la carpeta `test-reports`.

## 📂 Estructura del Proyecto

```
telemetro-admin/
├── src/
│   ├── components/   # Componentes reutilizables (UI, Forms, etc.)
│   ├── config/       # Configuraciones globales (Environment)
│   ├── hooks/        # Custom React Hooks (useClips, useAuth, etc.)
│   ├── pages/        # Vistas principales de la aplicación
│   ├── services/     # Lógica de comunicación con la API
│   └── types/        # Definiciones de tipos TypeScript
├── scripts/          # Scripts de utilidad (test-api.js)
├── public/           # Archivos estáticos públicos
└── .env              # Variables de entorno
```
