# Panel de Administración - INNOVATEC-2025-VZ

Panel de administración web para gestionar eventos, edificios y visualizar analíticas de Big Data.

## 🚀 Tecnologías

- **React 18** - Framework frontend
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos y visualizaciones
- **SCSS** - Estilos
- **Lucide React** - Iconos

## 📋 Funcionalidades

- ✅ Autenticación de administradores
- ✅ Gestión de eventos
- ✅ Gestión de edificios
- ✅ Calendario de eventos
- ✅ **Dashboard de Big Data** - Visualización de analíticas y métricas
- ✅ **Dashboard de Machine Learning** - Predicciones de asistencia, movilidad y saturaciones
- ✅ Configuración de ajustes

## 🔧 Instalación

```bash
npm install
```

## 🏃 Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Dashboards Disponibles

### Dashboard de Big Data
Accede desde el menú lateral o directamente en:
`http://localhost:5173/admin/bigdata`

**Características:**
- Visualización de actividad de usuarios
- Métricas de edificios más visitados
- Estadísticas de eventos populares
- Gráficos interactivos con filtros de fecha
- Gráficos horizontales optimizados
- Interfaz completamente en español

### Dashboard de Machine Learning
Accede desde el menú lateral o directamente en:
`http://localhost:5173/admin/ml`

**Características:**
- Estado del ML Service
- Predicciones de asistencia a eventos
- Predicciones de demanda de movilidad
- Análisis de saturaciones con gráficos
- Acciones rápidas para generar predicciones
- Visualización de métricas de modelos

**Nota**: El ML Service debe estar corriendo en `http://localhost:8000` para que el dashboard funcione completamente.

## Dmitry Estructura del Proyecto

```
src/
├── application/        # Casos de uso (lógica de negocio)
├── core/              # Entidades de dominio
├── infrastructure/    # Repositorios y HTTP client
├── router/            # Configuración de rutas
└── ui/                # Componentes y páginas
    ├── components/    # Componentes reutilizables
    └── pages/         # Páginas principales
```

## 📝 Notas

- Requiere Node.js 18+
- El backend debe estar corriendo en el puerto 5000
- Solo usuarios con rol `administrador` pueden acceder
