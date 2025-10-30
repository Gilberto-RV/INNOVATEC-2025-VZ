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
- `backend/` → API (Express)
- `__import_tmp/project-bolt-sb1-tgs5h47h/gestory/project/` → Panel Admin (Vite)
- `project/` → App móvil (Expo)

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

Si necesitas configurar credenciales, crea `.env` en `backend/`.

---

## 2) Panel de Administración (Vite)
Ruta: `__import_tmp/project-bolt-sb1-tgs5h47h/gestory/project/`

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
cd __import_tmp/project-bolt-sb1-tgs5h47h/gestory/project
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
cd __import_tmp/project-bolt-sb1-tgs5h47h/gestory/project; npm install; npm run dev
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

## Credenciales de administrador (actuales)
- Correo: `admin@gmail.com`
- Contraseña: no se almacena en texto plano. Si no la recuerdas, usa una de estas opciones:
  - Registra un nuevo usuario con rol `administrador` usando `/auth/register`.
  - Actualiza la contraseña del admin existente con el endpoint de actualización.

Endpoints útiles (base `http://<IP_LOCAL>:5000/api`):
- POST `/auth/login` → `{ email, password }`
- POST `/auth/register` → `{ email, password, role }` (usa `role: "administrador"`) 
