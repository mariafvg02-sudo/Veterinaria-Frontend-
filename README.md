# Veterinaria Frontend

Aplicación web para la gestión integral de una clínica veterinaria, construida con Angular 17.

---

## Objetivo del proyecto

Proveer la interfaz de usuario del sistema veterinario, permitiendo a los distintos roles (administrador, recepcionista, veterinario, jefe de inventario y cliente) interactuar con la información del sistema de forma intuitiva. La aplicación consume la API REST del backend y gestiona vistas para mascotas, citas médicas, historial clínico, inventario de medicamentos, facturación y pagos, con control de acceso por roles mediante guards de navegación.

---

## Herramientas y tecnologías utilizadas

| Herramienta / Librería | Versión | Propósito |
|---|---|---|
| Angular | 17.3.0 | Framework principal SPA |
| Angular CLI | 17.3.17 | Generación y gestión del proyecto |
| Angular Router | 17.3.0 | Navegación y rutas con lazy loading |
| Angular Forms | 17.3.0 | Formularios reactivos y de plantilla |
| Angular Animations | 17.3.0 | Animaciones de componentes |
| RxJS | 7.8.x | Programación reactiva y llamadas HTTP |
| TypeScript | 5.4.2 | Lenguaje principal del proyecto |
| SCSS | — | Estilos por componente y globales |
| Karma + Jasmine | 6.4 / 5.1 | Pruebas unitarias |
| Node.js | 18+ | Entorno de ejecución para el toolchain |
| npm | 9+ | Gestión de paquetes |

---

## Módulos y vistas del sistema

| Módulo / Vista | Ruta | Rol que lo usa | Descripción |
|---|---|---|---|
| **Home** | `/home` | Todos | Página de inicio y presentación del sistema |
| **Login** | `/login` | Todos | Autenticación de usuarios |
| **Registro** | `/register` | Público | Registro de nuevos usuarios |
| **Olvidé mi clave** | `/olvido-clave` | Público | Recuperación de contraseña por correo |
| **Administrador** | `/administrador` | Administrador | Gestión de usuarios, roles y configuración general |
| **Cliente** | `/cliente` | Cliente | Consulta de mascotas propias y citas programadas |
| **Recepcionista** | `/recepcionista` | Recepcionista | Registro de citas, clientes y mascotas |
| **Pagos y Facturas** | (dentro de recepcionista) | Recepcionista | Gestión de pagos y emisión de facturas |
| **Inventario** (recepcionista) | (dentro de recepcionista) | Recepcionista | Consulta de inventario de medicamentos |
| **Veterinario** | `/veterinario` | Veterinario | Consulta y gestión de citas asignadas |
| **Detalle de Cita** | `/veterinario/cita/:id` | Veterinario | Registro de atención, historial y medicamentos por cita |
| **Jefe de Inventario** | `/jefe-inventario` | Jefe de inventario | Administración y control de stock de medicamentos |
| **Dev Role** | — | Desarrollo | Vista auxiliar para pruebas de roles |

**Servicios transversales (Core):**
- `AuthService` — autenticación, tokens y sesión de usuario
- `CitaService` — consumo de endpoints de citas
- `MascotaService` — consumo de endpoints de mascotas
- `HistorialMedicoService` — consumo de endpoints de historial clínico
- `InventarioService` — consumo de endpoints de inventario
- `VeterinarioService` — consumo de endpoints de veterinarios
- `HttpInterceptor` — inyección automática del token JWT en cada petición

---

## Requisitos del dispositivo para implementación

| Componente | Mínimo recomendado |
|---|---|
| **Sistema operativo** | Windows 10/11, Ubuntu 20.04+ o macOS 12+ |
| **Procesador** | 2 núcleos (x86-64) |
| **RAM** | 4 GB (8 GB recomendado) |
| **Almacenamiento** | 1 GB libres |
| **Node.js** | 18.x o superior |
| **npm** | 9.x o superior |
| **Navegador** | Chrome 110+, Firefox 110+, Edge 110+ |
| **Conexión a internet** | Requerida para la descarga de dependencias en el primer build |
| **Backend activo** | El backend Spring Boot debe estar corriendo en `http://localhost:8080` |

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd Veterinaria-Frontend-
```

### 2. Instalar Node.js (si no lo tienes)

Descarga el instalador desde [nodejs.org](https://nodejs.org/) y elige la versión LTS.

Verifica la instalación:

```bash
node -v
npm -v
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Verificar que el backend está corriendo

La aplicación consume la API en `http://localhost:8080`. Antes de iniciar el frontend asegúrate de que el backend Spring Boot esté activo. El proxy configurado en `proxy.conf.json` redirige las peticiones `/api` al backend automáticamente.

### 5. Ejecutar en modo desarrollo

```bash
npm start
```

O equivalentemente:

```bash
ng serve
```

La aplicación queda disponible en `http://localhost:4200/`. Los cambios en el código se reflejan automáticamente sin necesidad de reiniciar.

---

## Compilar para producción

```bash
npm run build
```

Los archivos generados se guardan en la carpeta `dist/`. Estos son los archivos estáticos listos para desplegar en cualquier servidor web (Nginx, Apache, Firebase Hosting, etc.).

---

## Estructura del proyecto

```
Veterinaria-Frontend-/
├── src/
│   ├── app/
│   │   ├── administrador/       # Vista y guard del administrador
│   │   ├── cliente/             # Vista del cliente y guard de autenticación
│   │   ├── Core/
│   │   │   └── Service/         # Servicios HTTP (auth, citas, mascotas, historial, inventario)
│   │   ├── dev-role/            # Vista auxiliar para pruebas de roles
│   │   ├── home/                # Página de inicio
│   │   ├── interceptors/        # Interceptor HTTP para inyección del token JWT
│   │   ├── jefe-inventario/     # Vista del jefe de inventario
│   │   ├── Login/               # Componente de inicio de sesión
│   │   ├── Models/              # Interfaces TypeScript (Cita, Mascota, Inventario, etc.)
│   │   ├── olvido-clave/        # Recuperación de contraseña
│   │   ├── recepcionista/       # Vista de recepcionista (citas, pagos, facturas, inventario)
│   │   ├── Register/            # Componente de registro de usuario
│   │   ├── Veterinario/         # Vista del veterinario y detalle de cita
│   │   ├── app.component.*      # Componente raíz
│   │   ├── app.config.ts        # Configuración de providers de Angular
│   │   └── app.routes.ts        # Definición de rutas con lazy loading
│   ├── envimeronments/
│   │   └── envieronments.ts     # URL base de la API según entorno
│   ├── styles.scss              # Estilos globales
│   └── index.html               # Punto de entrada HTML
├── proxy.conf.json              # Proxy de desarrollo hacia el backend
├── angular.json                 # Configuración del workspace Angular
├── package.json                 # Dependencias y scripts npm
└── tsconfig.json                # Configuración de TypeScript
```