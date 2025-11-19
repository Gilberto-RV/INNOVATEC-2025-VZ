# 📚 Documentación Técnica del Proyecto INNOVATEC-2025-VZ

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Funcionalidades Detalladas](#funcionalidades-detalladas)
4. [Alcances del Proyecto](#alcances-del-proyecto)
5. [Limitaciones Conocidas](#limitaciones-conocidas)
6. [Tecnologías Utilizadas](#tecnologías-utilizadas)
7. [Estructura de Datos](#estructura-de-datos)
8. [Seguridad y Autenticación](#seguridad-y-autenticación)
9. [Rendimiento y Escalabilidad](#rendimiento-y-escalabilidad)
10. [Roadmap y Mejoras Futuras](#roadmap-y-mejoras-futuras)

---

## 🎯 Descripción General

**INNOVATEC-2025-VZ** es un sistema integral de gestión de eventos y navegación de edificios para instituciones educativas. El proyecto está compuesto por tres aplicaciones principales:

1. **Backend API** (Node.js/Express + MongoDB)
2. **Panel de Administración Web** (React + Vite)
3. **Aplicación Móvil** (React Native + Expo)

El sistema permite a los usuarios visualizar edificios en un mapa interactivo, consultar eventos, navegar con rutas optimizadas y gestionar información institucional, mientras que los administradores pueden gestionar eventos, edificios y visualizar analíticas de Big Data.

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN MÓVIL                         │
│              (React Native + Expo)                          │
│  - Visualización de mapas                                   │
│  - Navegación con rutas                                     │
│  - Consulta de eventos                                      │
│  - Búsqueda de edificios                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKEND API                               │
│              (Node.js + Express + MongoDB)                  │
│  - Autenticación (JWT + OAuth Google)                       │
│  - Gestión de edificios y eventos                           │
│  - Módulo Big Data                                          │
│  - Procesamiento por lotes                                  │
│  - Servicio ML (Python/FastAPI)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│              PANEL DE ADMINISTRACIÓN                        │
│              (React + Vite)                                 │
│  - Dashboard de Big Data                                    │
│  - Gestión de eventos                                       │
│  - Gestión de edificios                                     │
│  - Calendario de eventos                                    │
└─────────────────────────────────────────────────────────────┘
```

### Base de Datos
- **MongoDB Atlas** (Cloud) o MongoDB Local
- Colecciones principales: Users, Buildings, Events, BigData Analytics

---

## 🚀 Funcionalidades Detalladas

### 1. Sistema de Autenticación

#### Funcionalidades Implementadas:
- ✅ **Registro de usuarios** con validación de email y contraseña
- ✅ **Login con email y contraseña** (JWT)
- ✅ **Autenticación OAuth con Google** (Passport.js)
- ✅ **Gestión de roles**: estudiante, profesor, administrador
- ✅ **Middleware de autenticación** para proteger rutas
- ✅ **Autorización basada en roles** (RBAC)
- ✅ **Actualización de perfil** de usuario
- ✅ **Eliminación de cuenta** (con validación)

#### Características Técnicas:
- Contraseñas hasheadas con bcryptjs (salt rounds: 10)
- Tokens JWT con expiración configurable
- Sesiones persistentes en localStorage (frontend)
- Validación de email único en base de datos

#### Limitaciones:
- ⚠️ No hay recuperación de contraseña olvidada
- ⚠️ No hay verificación de email por correo
- ⚠️ No hay autenticación de dos factores (2FA)
- ⚠️ No hay rate limiting en endpoints de autenticación

---

### 2. Gestión de Edificios

#### Funcionalidades Implementadas:
- ✅ **Visualización de edificios en mapa** (React Native Maps)
- ✅ **Búsqueda de edificios** por nombre o descripción
- ✅ **Filtrado por accesibilidad** y tipo de edificio
- ✅ **Carga desde GeoJSON** (script automatizado)
- ✅ **Consulta de detalles** de edificio (coordenadas, descripción, tipo)
- ✅ **Actualización de edificios** (solo administradores)
- ✅ **Marcadores diferenciados** (accesible vs normal)

#### Características Técnicas:
- Almacenamiento de coordenadas geográficas (lat/lng)
- Índices geoespaciales en MongoDB para búsquedas rápidas
- Integración con archivos GeoJSON para carga masiva
- Soporte para múltiples tipos de edificios

#### Limitaciones:
- ⚠️ No hay edición masiva de edificios
- ⚠️ No hay gestión de imágenes de edificios
- ⚠️ No hay historial de cambios en edificios
- ⚠️ No hay validación de coordenadas duplicadas

---

### 3. Gestión de Eventos

#### Funcionalidades Implementadas:
- ✅ **Creación de eventos** (solo administradores)
- ✅ **Edición de eventos** (solo administradores)
- ✅ **Eliminación de eventos** (solo administradores)
- ✅ **Consulta de eventos** por edificio, categoría, fecha
- ✅ **Visualización en calendario** (panel admin)
- ✅ **Carrusel de eventos** en app móvil
- ✅ **Estadísticas de eventos** (vistas, popularidad)
- ✅ **Categorización de eventos**

#### Características Técnicas:
- Validación de fechas y horarios
- Asociación con edificios
- Estados: programado, en curso, finalizado, cancelado
- Cálculo automático de popularidad basado en vistas

#### Limitaciones:
- ⚠️ No hay notificaciones push para eventos próximos
- ⚠️ No hay sistema de reservas/asistencia
- ⚠️ No hay límite de capacidad de eventos
- ⚠️ No hay gestión de recursos adicionales (equipos, materiales)

---

### 4. Sistema de Navegación y Mapas

#### Funcionalidades Implementadas:
- ✅ **Visualización de mapa interactivo** con React Native Maps
- ✅ **Ubicación del usuario** en tiempo real (GPS)
- ✅ **Cálculo de rutas** usando algoritmo de grafos
- ✅ **Visualización de caminos** desde GeoJSON
- ✅ **Búsqueda de edificios** con filtrado en tiempo real
- ✅ **Panel de información** de edificio seleccionado
- ✅ **Navegación con polilíneas** en el mapa

#### Características Técnicas:
- Construcción de grafo desde GeoJSON
- Algoritmo de búsqueda de ruta (Dijkstra o similar)
- Integración con expo-location para GPS
- Renderizado optimizado de marcadores

#### Limitaciones:
- ⚠️ No hay navegación paso a paso (turn-by-turn)
- ⚠️ No hay cálculo de tiempo estimado de llegada
- ⚠️ No hay rutas alternativas
- ⚠️ No hay modo offline para mapas
- ⚠️ No hay indicaciones de voz

---

### 5. Módulo de Big Data

#### Funcionalidades Implementadas:
- ✅ **Métricas de edificios** (vistas, visitantes únicos, horas pico)
- ✅ **Analíticas de eventos** (popularidad, visualizaciones)
- ✅ **Dashboard interactivo** con gráficos (Recharts)
- ✅ **Procesamiento por lotes** automatizado (node-cron)
- ✅ **Limpieza automática** de datos antiguos (>90 días)
- ✅ **Filtros por fecha** (7 días, 30 días, todos)
- ✅ **Exportación de estadísticas**

#### Características Técnicas:
- Almacenamiento escalable en MongoDB Atlas
- Procesamiento diario a las 2:00 AM
- Limpieza semanal los domingos a las 3:00 AM
- Índices optimizados para consultas rápidas
- Agregaciones consolidadas por día

#### Datos Recopilados:
- **BuildingAnalytics**: Vistas, visitantes únicos, horas pico, duración promedio
- **EventAnalytics**: Popularidad, visualizaciones, visitantes únicos

#### Limitaciones:
- ⚠️ No hay procesamiento en tiempo real (streaming)
- ⚠️ No hay alertas automáticas basadas en patrones
- ⚠️ No hay análisis predictivo avanzado (solo básico)
- ⚠️ No hay integración con herramientas de BI externas
- ⚠️ Limitado a 90 días de retención de logs detallados

---

### 6. Panel de Administración

#### Funcionalidades Implementadas:
- ✅ **Dashboard principal** con métricas generales
- ✅ **Dashboard de Big Data** con gráficos interactivos
- ✅ **Gestión de eventos** (CRUD completo)
- ✅ **Gestión de edificios** (consulta y actualización)
- ✅ **Calendario de eventos** con vista mensual
- ✅ **Página de ajustes** (configuración)
- ✅ **Autenticación de administradores** con validación de rol
- ✅ **Interfaz responsive** con sidebar colapsable

#### Características Técnicas:
- Arquitectura Clean Architecture (casos de uso, repositorios)
- Componentes reutilizables (Card, Button, Input, Modal)
- Estilos con SCSS modular
- Gráficos con Recharts (barras horizontales optimizadas)
- Navegación protegida con React Router

#### Limitaciones:
- ⚠️ No hay gestión de usuarios desde el panel
- ⚠️ No hay exportación de reportes en PDF/Excel
- ⚠️ No hay sistema de notificaciones en el panel
- ⚠️ No hay configuración avanzada de permisos por usuario

---

### 7. Servicio de Machine Learning

#### Funcionalidades Implementadas:
- ✅ **Predicción de asistencia a eventos** - Estima cuántas personas asistirán a un evento
- ✅ **Predicción de demanda de movilidad** - Predice la demanda de movilidad en edificios/áreas
- ✅ **Anticipación de saturaciones** - Predice niveles de saturación (Normal, Baja, Media, Alta)
- ✅ **Re-entrenamiento de modelos** - Capacidad de re-entrenar modelos con nuevos datos
- ✅ **Dashboard ML integrado** - Visualización de predicciones en el panel de administración

#### Arquitectura Implementada:
- Microservicio Python con FastAPI (puerto 8000)
- Modelos: Regresión Lineal, Random Forest Regressor, Random Forest Classifier
- Entrenamiento manual y automático disponible
- API REST para predicciones en tiempo real
- Integración completa con backend Node.js

#### Características Técnicas:
- Extracción automática de datos desde MongoDB
- Generación de datos sintéticos si no hay suficientes datos reales
- Modelos guardados en formato `.pkl` con metadata JSON
- Fallback a cálculos simples si el servicio ML no está disponible
- Documentación interactiva con Swagger UI

#### Estado Actual:
- ✅ **Implementado y funcional**
- Ubicación: `backend/ml-service/`
- Documentación: `backend/ml-service/README_ML_COMPLETO.md`

---

## 📊 Alcances del Proyecto

### Alcance Funcional

#### ✅ Implementado y Funcional:
1. **Autenticación completa** con JWT y OAuth Google
2. **Gestión básica de edificios** (CRUD parcial)
3. **Gestión completa de eventos** (CRUD completo)
4. **Visualización de mapas** con marcadores y rutas
5. **Sistema de Big Data** completo con dashboard
6. **Panel de administración** funcional
7. **Aplicación móvil** básica funcional

#### 🔄 En Desarrollo/Planificado:
1. **Notificaciones push** para eventos
2. **Sistema de reservas** para eventos
3. **Navegación paso a paso** mejorada
4. **Modo offline** para la app móvil
5. **Re-entrenamiento automático** de modelos ML (actualmente manual)

#### ❌ Fuera del Alcance Actual:
1. Integración con sistemas externos (ERP, SIS)
2. Sistema de pagos o facturación
3. Chat o mensajería entre usuarios
4. Sistema de calificaciones o evaluaciones
5. Gestión de inventario o recursos físicos

### Alcance Técnico

#### Plataformas Soportadas:
- ✅ **Backend**: Node.js 18+ (Windows, Linux, macOS)
- ✅ **Frontend Web**: Navegadores modernos (Chrome, Firefox, Edge, Safari)
- ✅ **App Móvil**: iOS y Android (via Expo)
- ✅ **Base de Datos**: MongoDB Atlas (cloud) o MongoDB local

#### Escalabilidad:
- ✅ Diseñado para escalar horizontalmente (MongoDB Atlas)
- ✅ Procesamiento por lotes para optimizar rendimiento
- ⚠️ Limitado por recursos de MongoDB Atlas (plan gratuito: 512MB)
- ⚠️ No hay balanceador de carga implementado

---

## ⚠️ Limitaciones Conocidas

### Limitaciones Funcionales

1. **Autenticación**:
   - No hay recuperación de contraseña
   - No hay verificación de email
   - No hay autenticación de dos factores

2. **Edificios**:
   - No hay gestión de imágenes
   - No hay historial de cambios
   - No hay validación de coordenadas duplicadas

3. **Eventos**:
   - No hay sistema de reservas/asistencia
   - No hay notificaciones push
   - No hay límite de capacidad

4. **Navegación**:
   - No hay navegación paso a paso
   - No hay modo offline
   - No hay indicaciones de voz

5. **Big Data**:
   - Procesamiento no es en tiempo real
   - Retención limitada a 90 días
   - No hay alertas automáticas

### Limitaciones Técnicas

1. **Rendimiento**:
   - ⚠️ No hay caché implementado (Redis)
   - ⚠️ No hay CDN para assets estáticos
   - ⚠️ Consultas a MongoDB pueden ser lentas con muchos datos
   - ⚠️ No hay paginación en algunos endpoints

2. **Seguridad**:
   - ⚠️ No hay rate limiting en APIs
   - ⚠️ No hay validación de entrada exhaustiva en todos los endpoints
   - ⚠️ No hay logging de seguridad (intentos de acceso fallidos)
   - ⚠️ No hay encriptación de datos sensibles en tránsito (solo HTTPS recomendado)

3. **Escalabilidad**:
   - ⚠️ Backend es monolítico (no microservicios)
   - ⚠️ No hay balanceador de carga
   - ⚠️ MongoDB Atlas plan gratuito tiene límites
   - ⚠️ No hay sharding implementado

4. **Confiabilidad**:
   - ⚠️ No hay sistema de backup automatizado
   - ⚠️ No hay monitoreo de salud del sistema
   - ⚠️ No hay manejo de errores exhaustivo en todos los casos
   - ⚠️ No hay sistema de reintentos para operaciones fallidas

5. **Testing**:
   - ⚠️ No hay tests unitarios implementados
   - ⚠️ No hay tests de integración
   - ⚠️ No hay tests end-to-end
   - ⚠️ No hay cobertura de código

### Limitaciones de Infraestructura

1. **Base de Datos**:
   - MongoDB Atlas plan gratuito: 512MB de almacenamiento
   - Sin réplicas en plan gratuito
   - Sin backup automático en plan gratuito

2. **Hosting**:
   - Backend debe ejecutarse en servidor propio o cloud
   - No hay despliegue automatizado (CI/CD)
   - No hay contenedores Docker configurados

3. **Dependencias Externas**:
   - Dependencia de servicios de Google (OAuth)
   - Dependencia de MongoDB Atlas (si se usa cloud)
   - Dependencia de servicios de ubicación (GPS)

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** 18+ - Runtime de JavaScript
- **Express** 5.1.0 - Framework web
- **MongoDB** + **Mongoose** 8.16.5 - Base de datos NoSQL
- **JWT** (jsonwebtoken) - Autenticación
- **Passport.js** + **passport-google-oauth20** - OAuth
- **bcryptjs** - Hashing de contraseñas
- **node-cron** - Tareas programadas
- **Axios** - Cliente HTTP
- **dotenv** - Variables de entorno
- **CORS** - Cross-Origin Resource Sharing

### Frontend Web (Panel Admin)
- **React** 18.3.1 - Framework UI
- **Vite** 5.4.2 - Build tool
- **React Router** 7.8.0 - Navegación
- **Axios** 1.11.0 - Cliente HTTP
- **Recharts** 2.10.3 - Gráficos
- **SCSS** 1.90.0 - Estilos
- **Lucide React** - Iconos
- **React Hook Form** - Formularios
- **SweetAlert2** - Alertas

### Aplicación Móvil
- **React Native** 0.79.1 - Framework móvil
- **Expo** 53.0.0 - Plataforma de desarrollo
- **Expo Router** 5.0.2 - Navegación
- **React Native Maps** 1.15.2 - Mapas
- **Expo Location** 18.1.2 - GPS
- **Axios** 1.11.0 - Cliente HTTP
- **React Navigation** - Navegación nativa

### Machine Learning
- **Python 3.8+** - Lenguaje
- **FastAPI** - Framework API
- **scikit-learn** - Librería ML (Regresión, Clasificación)
- **pandas** - Manipulación de datos
- **numpy** - Cálculos numéricos
- **pymongo** - Conexión a MongoDB
- **joblib** - Serialización de modelos
- **uvicorn** - Servidor ASGI

---

## 📦 Estructura de Datos

### Modelos Principales

#### User (Auth)
```javascript
{
  email: String (único, requerido),
  password: String (hasheado, requerido),
  role: String (enum: ['estudiante', 'profesor', 'administrador']),
  avatar: String (opcional),
  timestamps: { createdAt, updatedAt }
}
```

#### Building
```javascript
{
  id: String (único),
  name: String,
  description: String,
  coordinates: { latitude: Number, longitude: Number },
  type: String,
  accessibility: Boolean,
  // ... otros campos
}
```

#### Event
```javascript
{
  title: String,
  description: String,
  date_time: Date,
  category: String,
  building_assigned: String (referencia a Building),
  organizer: String,
  status: String (enum: ['programado', 'en_curso', 'finalizado', 'cancelado']),
  // ... otros campos
}
```

#### Big Data Models
- **BuildingAnalytics**: Métricas agregadas de edificios (vistas, visitantes únicos, horas pico)
- **EventAnalytics**: Métricas agregadas de eventos (popularidad, visualizaciones)

---

## 🔒 Seguridad y Autenticación

### Implementado:
- ✅ Contraseñas hasheadas con bcryptjs
- ✅ Tokens JWT con expiración
- ✅ Middleware de autenticación
- ✅ Autorización basada en roles (RBAC)
- ✅ Validación de entrada básica
- ✅ CORS configurado

### No Implementado:
- ❌ Rate limiting
- ❌ Validación exhaustiva de entrada
- ❌ Logging de seguridad
- ❌ Encriptación de datos sensibles adicional
- ❌ Protección contra SQL/NoSQL injection (parcial)
- ❌ Protección CSRF

### Recomendaciones:
- Implementar rate limiting con express-rate-limit
- Agregar validación con Joi o Yup
- Implementar logging de seguridad
- Usar HTTPS en producción
- Implementar protección CSRF

---

## ⚡ Rendimiento y Escalabilidad

### Optimizaciones Implementadas:
- ✅ Índices en MongoDB para consultas frecuentes
- ✅ Procesamiento por lotes para Big Data
- ✅ Agregaciones consolidadas (no logs individuales en dashboard)
- ✅ Limpieza automática de datos antiguos

### Optimizaciones Pendientes:
- ⚠️ Implementar caché (Redis)
- ⚠️ Paginación en todos los endpoints
- ⚠️ Lazy loading en frontend
- ⚠️ Compresión de respuestas (gzip)
- ⚠️ CDN para assets estáticos
- ⚠️ Sharding en MongoDB para grandes volúmenes

### Límites Actuales:
- MongoDB Atlas plan gratuito: 512MB
- Sin límite de usuarios concurrentes (depende del servidor)
- Sin límite de eventos/edificios (depende de MongoDB)

---

## 🗺️ Roadmap y Mejoras Futuras

### Corto Plazo (1-3 meses)
1. ✅ Implementar recuperación de contraseña
2. ✅ Agregar validación exhaustiva de entrada
3. ✅ Implementar rate limiting
4. ✅ Agregar tests unitarios básicos
5. ✅ Implementar caché con Redis
6. ✅ Mejorar manejo de errores

### Mediano Plazo (3-6 meses)
1. 🔄 Re-entrenamiento automático de modelos ML
2. 🔄 Agregar notificaciones push
3. 🔄 Implementar sistema de reservas
4. 🔄 Mejorar navegación con paso a paso
5. 🔄 Agregar modo offline
6. 🔄 Implementar CI/CD
7. 🔄 Sistema de recomendaciones de edificios (ML avanzado)

### Largo Plazo (6+ meses)
1. 🔮 Microservicios (separar Big Data, ML, Auth)
2. 🔮 Integración con sistemas externos
3. 🔮 Sistema de pagos
4. 🔮 Chat/mensajería
5. 🔮 App nativa (sin Expo)
6. 🔮 Internacionalización (i18n)

---

## 📝 Notas Adicionales

### Scripts Útiles del Backend
- `npm run generate-fake-data` - Generar datos ficticios de Big Data
- `npm run generate-events` - Generar eventos de ejemplo
- `npm run load-buildings` - Cargar edificios desde GeoJSON
- `npm run create-admin` - Crear/actualizar usuario administrador
- `npm run verify-consistency` - Verificar consistencia de datos

### Credenciales por Defecto
- **Email**: test@gmail.com
- **Contraseña**: admin123
- **Rol**: administrador

### Configuración Requerida
- Variables de entorno en `.env`:
  - `MONGO_URI` - String de conexión a MongoDB
  - `PORT` - Puerto del servidor (default: 5000)
  - `JWT_SECRET` - Secreto para JWT
  - `ENABLE_BATCH_PROCESSING` - Habilitar procesamiento por lotes
  - `VITE_API_URL` - URL del backend (frontend)

---

## 📞 Soporte y Contacto

Para más información sobre el proyecto, consultar:
- `README.md` - Guía rápida de inicio
- `backend/README_BIG_DATA.md` - Documentación de Big Data
- `backend/BIG_DATA_IMPLEMENTATION.md` - Guía de implementación de Big Data
- `backend/ml-service/README_ML_COMPLETO.md` - Documentación completa del ML Service
- `backend/ml-service/INSTALLACION_WINDOWS.md` - Guía de instalación en Windows
- `backend/MONGODB_ATLAS_SETUP.md` - Configuración de MongoDB Atlas

---

**Versión del Documento**: 1.0.0  
**Fecha de Actualización**: Enero 2025  
**Mantenido por**: Equipo INNOVATEC-2025-VZ

