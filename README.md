# Humantyx Jobs - Frontend

Frontend del sistema Humantyx Jobs, plataforma web orientada a la publicación de vacantes, postulación de candidatos, gestión de perfiles, administración de procesos de selección, mensajería y notificaciones.

## Tecnologías utilizadas

- React
- Vite
- React Router DOM
- Bootstrap
- CSS
- JavaScript
- Fetch API

## Requisitos previos

Antes de ejecutar el proyecto, se requiere tener instalado:

- Node.js
- npm
- Backend de Humantyx Jobs ejecutándose localmente o desplegado en producción
- Variables de entorno configuradas

## Instalación del proyecto

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO_FRONTEND
```

Ingresar a la carpeta del frontend:

```bash
cd humantyx-jobs-frontend
```

Instalar dependencias:

```bash
npm install
```

## Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`.

Ejemplo para desarrollo local:

```env
VITE_API_URL=http://localhost:4000
```

Ejemplo para producción:

```env
VITE_API_URL=https://url-publica-del-backend-en-render.com
```

## Ejecución en desarrollo

```bash
npm run dev
```

## Compilación para producción

```bash
npm run build
```

## Vista previa de producción

```bash
npm run preview
```

## Estructura principal del proyecto

```txt
src/
├── App.jsx
├── main.jsx
├── components/
├── context/
├── hooks/
├── pages/
├── services/
└── utils/
```

## Roles del sistema

El frontend contempla tres tipos de usuarios:

- `ADMIN`: usuario administrador con acceso global al panel de gestión.
- `RRHH`: usuario de recursos humanos encargado de gestionar sus propias vacantes y postulantes.
- `CANDIDATE`: usuario candidato que puede completar su perfil, subir CV y postular a vacantes.

## Módulos principales

### Página pública

Permite mostrar la presentación general del portal Humantyx Jobs y el acceso a las vacantes disponibles.

### Listado de vacantes

Permite a candidatos y visitantes visualizar las vacantes publicadas, buscar oportunidades y acceder al detalle de cada empleo.

### Detalle de vacante

Muestra la información completa de una vacante publicada y permite al candidato iniciar el proceso de postulación.

### Autenticación

Incluye las pantallas de inicio de sesión, registro, activación de cuenta por invitación, recuperación de contraseña y cambio de contraseña.

### Perfil del candidato

Permite al candidato completar y actualizar su información personal, profesional, académica, laboral y su CV.

### Mis postulaciones

Permite al candidato revisar las vacantes a las que postuló, consultar su estado, ver mensajes y recibir notificaciones relacionadas.

### Panel Admin/RRHH

Permite a usuarios internos gestionar vacantes, revisar postulantes, visualizar perfiles, revisar CV, cambiar estados de postulación y comunicarse con candidatos.

### Gestión de vacantes

Permite crear, editar, publicar, cerrar y eliminar vacantes según las reglas de negocio y permisos del usuario.

### Gestión de postulantes

Permite visualizar candidatos por vacante, revisar su perfil, previsualizar CV, cambiar el estado de la postulación y enviar mensajes.

### Mensajería

Permite la comunicación entre usuarios Admin/RRHH y candidatos dentro del contexto de una postulación.

### Notificaciones

Permite mostrar alertas del sistema mediante una campanita en el navbar, incluyendo nuevos mensajes, nuevas postulaciones y cambios de estado.

### Gestión de usuarios internos

Permite al administrador gestionar usuarios RRHH, activar o desactivar cuentas y controlar accesos.

### Gestión de invitaciones

Permite al administrador invitar usuarios internos, reenviar invitaciones, cancelar invitaciones y revisar su estado.

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Página principal pública del portal. |
| `/empleos` | Listado público de vacantes publicadas. |
| `/empleos/:id` | Detalle de una vacante publicada. |
| `/login` | Pantalla de inicio de sesión. |
| `/register` | Pantalla de registro de candidatos. |
| `/forgot-password` | Pantalla para solicitar recuperación de contraseña. |
| `/reset-password` | Pantalla para restablecer contraseña mediante token. |
| `/set-password` | Pantalla para activar cuenta de usuario invitado. |
| `/mi-perfil` | Perfil del candidato autenticado. |
| `/completar-perfil` | Pantalla para completar perfil obligatorio del candidato. |
| `/mis-postulaciones` | Listado de postulaciones realizadas por el candidato. |
| `/cambiar-password` | Pantalla para cambio de contraseña del usuario autenticado. |
| `/rrhh/vacantes` | Panel de gestión de vacantes para ADMIN/RRHH. |
| `/rrhh/vacantes/nueva` | Formulario para crear una nueva vacante. |
| `/rrhh/vacantes/:id/editar` | Formulario para editar una vacante existente. |
| `/rrhh/vacantes/:id/postulantes` | Listado de postulantes de una vacante. |
| `/rrhh/candidates/:id/profile` | Vista de perfil de candidato para ADMIN/RRHH. |
| `/rrhh/usuarios` | Gestión de usuarios internos. |
| `/rrhh/invitaciones` | Gestión y monitoreo de invitaciones. |
| `/rrhh/invitar` | Formulario para invitar usuarios internos. |

## Servicios principales del frontend

El frontend consume los servicios del backend mediante la variable:

```env
VITE_API_URL
```

Los servicios se encuentran organizados dentro de la carpeta:

```txt
src/services/
```

Desde allí se centralizan las peticiones HTTP hacia los módulos de autenticación, vacantes, postulaciones, perfiles, usuarios, mensajes y notificaciones.

## Despliegue

El frontend está preparado para desplegarse en Vercel.

Para producción se debe configurar la variable de entorno:

```env
VITE_API_URL=https://url-publica-del-backend-en-render.com
```

Además, el archivo `vercel.json` permite que las rutas internas de React Router funcionen correctamente al refrescar la página o acceder directamente a una URL interna.

## Consideraciones importantes

- No subir el archivo `.env` real al repositorio.
- Configurar correctamente `VITE_API_URL`.
- Verificar que el backend permita solicitudes desde el dominio del frontend.
- Probar login, vacantes, postulaciones, mensajes y notificaciones después del despliegue.
- Mantener actualizada la rama `main` con la última versión estable.