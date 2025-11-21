# INNOVATEC-2025-VZ

Guía rápida para levantar todos los servicios del proyecto:
- Backend (API Express + Mongo)
- Panel de Administración (Vite/React) en `http://localhost:5173`
- App móvil (Expo) con QR para Expo Go

---

## Requisitos
- **Node.js LTS 18+** y npm
- **Python 3.8+** (para el servicio ML - opcional)
- Acceso a la red local (mismo Wi‑Fi para PC y teléfono si se usa Expo Go)
- **MongoDB Atlas** o MongoDB local (recomendado: MongoDB Atlas)

## Estructura relevante
- `backend/` → API (Express + MongoDB) con módulo Big Data y Machine Learning
- `backend/ml-service/` → Servicio ML (Python/FastAPI) para predicciones
- `gestory/project/` → Panel Admin (Vite) con Dashboard Big Data y ML
- `project/` → App móvil (Expo)

## Documentación dedicada
- `backend/README.md` → guía de instalación, scripts npm y contexto de MongoDB para la API.
- `gestory/project/README.md` → guía del panel administrativa.
- `project/README.md` → guía específica de la app Expo.
- `backend/ml-service/README_ML_COMPLETO.md` → documentación extensa del servicio ML.
- `Cambios de mapa.md` → plan de migración al nuevo `map ITA-V5.geojson` y limpieza de datos sintéticos.

## 🆕 Funcionalidades Principales

### Big Data
El proyecto incluye un módulo completo de **Big Data** que permite:
- 📊 Recopilación automática de datos de uso
- 📈 Dashboard interactivo en el panel de administración con gráficos mejorados
- 🔄 Procesamiento por lotes automatizado
- 💾 Almacenamiento escalable en MongoDB Atlas
- 📊 Visualizaciones optimizadas (gráficos horizontales, nombres truncados)

**Más información**: Ver `backend/README_BIG_DATA.md` y `backend/BIG_DATA_IMPLEMENTATION.md`

### Machine Learning
Servicio de **Machine Learning** implementado con:
- 🤖 Predicción de asistencia a eventos
- 🚶 Predicción de demanda de movilidad en edificios
- 📊 Anticipación de saturaciones (Normal, Baja, Media, Alta)
- 🔄 Re-entrenamiento automático de modelos
- 📈 Dashboard ML integrado en el panel de administración

**Más información**: Ver `backend/ml-service/README_ML_COMPLETO.md`

---

## 1) Backend (API)
Ruta: `backend/`

Instalar e iniciar en desarrollo:
```powershell
cd backend
npm install
npm run dev
```
Expone: `http://localhost:5000` y API en `http://localhost:5000/api`.

Si necesitas configurar credenciales, crea `.env` en `backend/` con:
```dotenv
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/innovatec
PORT=5000
ENABLE_BATCH_PROCESSING=true
JWT_SECRET=tu_secret_jwt_aqui
ML_SERVICE_URL=http://localhost:8000
```

**Nota**: `ML_SERVICE_URL` es opcional. Si no está configurado, el sistema usará cálculos de fallback.

---

## 2) Panel de Administración (Vite)
Ruta: `gestory/project/`

Configurar URL del backend (recomendado vía `.env`):
```dotenv
VITE_API_URL=http://<TU_IP_LOCAL>:5000/api
```
Ejemplo (IP 192.168.1.184):
```dotenv
VITE_API_URL=http://192.168.1.184:5000/api
```

Instalar y levantar:
```powershell
cd gestory/project
npm install
npm run dev
```
Abrir: `http://localhost:5173`.

Notas:
- Login y gestión usan `VITE_API_URL`.
- Si cambias `.env`, reinicia `npm run dev`.

---

## 3) App móvil (Expo + Expo Go con QR)
Ruta: `project/`

La app consume la API definida en:
`project/src/core/config/api.js` → `baseURL`

Por defecto: `http://192.168.1.184:5000/api`. Si tu IP cambia, edítala.

Iniciar Expo con túnel (QR):
```powershell
cd project
npm run dev
```
Equivalente:
```powershell
cd project
npx expo start --tunnel --clear
```
Pasos en el teléfono:
1. Instala “Expo Go”.
2. Escanea el QR de la terminal o DevTools.
3. Asegúrate de estar en la misma red Wi‑Fi que el PC.

---

## Problemas comunes
- CORS o conexión en panel:
  - Verifica `VITE_API_URL` → `http://<IP_LOCAL>:5000/api` y reinicia Vite.
- La app móvil no conecta:
  - Edita `project/src/core/config/api.js` con tu IP.
  - Evita `localhost` en móviles; usa IP del PC.
- QR de Expo no carga:
  - Usa `--tunnel` y espera ~20–60s; revisa firewall/VPN.

---

## 4) Servicio ML (Python/FastAPI) - Opcional
Ruta: `backend/ml-service/`

**Requisitos previos:**
- Python 3.8+ instalado
- Entorno virtual creado

**Instalación e inicio:**
```powershell
cd backend/ml-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Configurar `.env` en `backend/ml-service/`:**
```dotenv
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/innovatec
ML_PORT=8000
ML_HOST=0.0.0.0
```

**Entrenar modelos:**
```powershell
python train_all_models.py
```

**Iniciar servicio:**
```powershell
python main.py
```

El servicio estará disponible en: `http://localhost:8000`
- Documentación API: `http://localhost:8000/docs`

**Más información**: Ver `backend/ml-service/README_ML_COMPLETO.md`

---

## Comandos de referencia
Backend:
```powershell
cd backend; npm install; npm run dev
```
Panel Admin:
```powershell
cd gestory/project; npm install; npm run dev
```
Expo (móvil):
```powershell
cd project; npm run dev
```
ML Service:
```powershell
cd backend/ml-service; venv\Scripts\activate; python main.py
```

**Script para iniciar todos los servicios:**
```powershell
.\start-all-services.ps1
```

---

## Notas
- Panel Admin probado en `http://localhost:5173`.
- Expo Go requiere que teléfono y PC estén en la misma red.
- El servicio ML es opcional. Si no está corriendo, el sistema usará cálculos de fallback.
- Para usar todas las funcionalidades, se recomienda tener MongoDB Atlas configurado.

---

## 🛠️ Scripts Útiles del Backend

El backend incluye varios scripts para facilitar el desarrollo:

```powershell
cd backend

# Generar datos ficticios de Big Data
npm run generate-fake-data

# Limpiar y regenerar datos de Big Data
npm run generate-fake-data:clear

# Generar eventos de ejemplo
npm run generate-events

# Cargar edificios desde GeoJSON
npm run load-buildings

# Crear/actualizar usuario administrador
npm run create-admin

# Verificar consistencia de datos
npm run verify-consistency
```

## 📦 Scripts del entorno completo
- `.\start-all-services.ps1` → instala dependencias (si faltan), lanza backend (5000), panel admin (5173), app Expo y el ML Service (8000), valida puertos y agrega `ML_SERVICE_URL` al `.env` del backend cuando falta.

- `.\test-integridad.ps1` → revisa puertos, endpoints clave del backend, la salud del ML Service y la respuesta del frontend; muestra una tasa de éxito y sugiere `start-all-services.ps1` si algo falla.

- `backend/ml-service/start_ml_service.bat` y `backend/ml-service/iniciar-ml-service.ps1` → scripts que comprueban `venv`, `.env`, entrenan los modelos que faltan y ejecutan `main.py` con mensajes claros.

- `backend/ml-service/iniciar.bat` y `backend/ml-service/start-ml.ps1` permanecen como variantes más simples (activan el venv y lanzan `main.py`) y pueden retirarse si se decide estandarizar en los anteriores para evitar confusión.

## Credenciales de administrador

### Usuario Administrador Principal
- **Correo:** `test@gmail.com`
- **Contraseña:** `admin123`

**Nota**: Este usuario tiene acceso completo al panel de administración, incluyendo el Dashboard de Big Data.

**Para crear/actualizar el usuario administrador:**
```powershell
cd backend
npm run create-admin
```

### Crear nuevos usuarios administradores
Para crear un nuevo usuario administrador, usa el endpoint:
- POST `http://<IP_LOCAL>:5000/api/auth/register`
- Body: `{ "email": "tu-email@ejemplo.com", "password": "tu-contraseña", "role": "administrador" }`

**Endpoints útiles:**
- POST `/auth/login` → `{ email, password }`
- POST `/auth/register` → `{ email, password, role }` (usa `role: "administrador"`)

---

## 📊 Configuración Inicial del Sistema

### 1. Cargar Edificios
Los edificios deben cargarse desde el archivo GeoJSON:
```powershell
cd backend
npm run load-buildings
```

### 2. Generar Eventos de Ejemplo
Para tener datos de prueba en el sistema:
```powershell
cd backend
npm run generate-events
```

### 3. Generar Datos de Big Data
Para visualizar el dashboard de Big Data con datos de ejemplo:
```powershell
cd backend
npm run generate-fake-data:clear
```

### 4. Verificar Consistencia
Para asegurar que todos los datos están sincronizados:
```powershell
cd backend
npm run verify-consistency
``` 

---

## Sincronización y actualización con GitHub

Para subir tus cambios locales a GitHub en cada proyecto (repite para backend, project y panel):

```sh
git add .
git commit -m "Describe brevemente tu cambio"
git push origin main
```

Ejemplo para cada repositorio:

**Backend:**
```sh
cd backend
# (haz los comandos git aquí)
```

**App Expo:**
```sh
cd project
# (haz los comandos git aquí)
```

**Panel admin:**
```sh
cd gestory/project
# (haz los comandos git aquí)
```

Esto mantendrá los repos siempre actualizados en GitHub para respaldo. 
