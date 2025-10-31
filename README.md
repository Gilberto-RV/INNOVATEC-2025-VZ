# INNOVATEC-2025-VZ

Guía rápida para levantar todos los servicios del proyecto:
- Backend (API Express + Mongo)
- Panel de Administración (Vite/React) en `http://localhost:5173`
- App móvil (Expo) con QR para Expo Go

---

## Requisitos
- Node.js LTS 18+ y npm
- Acceso a la red local (mismo Wi‑Fi para PC y teléfono si se usa Expo Go)
- Opcional: MongoDB si se usan datos persistentes

## Estructura relevante
- `backend/` → API (Express + MongoDB) con módulo Big Data
- `gestory/project/` → Panel Admin (Vite) con Dashboard Big Data
- `project/` → App móvil (Expo)

## 🆕 Nueva Funcionalidad: Big Data

El proyecto ahora incluye un módulo completo de **Big Data** que permite:
- 📊 Recopilación automática de datos de uso
- 📈 Dashboard interactivo en el panel de administración
- 🔄 Procesamiento por lotes automatizado
- 💾 Almacenamiento escalable en MongoDB Atlas

**Más información**: Ver `backend/README_BIG_DATA.md` y `backend/BIG_DATA_IMPLEMENTATION.md`

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
```

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

---

## Notas
- Panel Admin probado en `http://localhost:5173`.
- Expo Go requiere que teléfono y PC estén en la misma red.

---

## Credenciales de administrador

### Usuario Administrador Principal
- **Correo:** `test@gmail.com`
- **Contraseña:** `admin123`

**Nota**: Este usuario tiene acceso completo al panel de administración, incluyendo el Dashboard de Big Data.

### Crear nuevos usuarios administradores
Para crear un nuevo usuario administrador, usa el endpoint:
- POST `http://<IP_LOCAL>:5000/api/auth/register`
- Body: `{ "email": "tu-email@ejemplo.com", "password": "tu-contraseña", "role": "administrador" }`

**Endpoints útiles:**
- POST `/auth/login` → `{ email, password }`
- POST `/auth/register` → `{ email, password, role }` (usa `role: "administrador"`) 

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

Esto mantendrá tus repos siempre actualizados en GitHub para colaboración o respaldo. 
