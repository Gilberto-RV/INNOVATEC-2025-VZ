# Script para levantar todos los servicios del proyecto INNOVATEC-2025-VZ
# Uso: .\start-all-services.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INNOVATEC-2025-VZ - Iniciando Servicios" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
}

# Función para esperar a que un servicio esté listo
function Wait-ForService {
    param([int]$Port, [string]$ServiceName, [int]$MaxWait = 30)
    $waited = 0
    Write-Host "Esperando a que $ServiceName este listo..." -ForegroundColor Yellow
    while (-not (Test-Port -Port $Port) -and $waited -lt $MaxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
    Write-Host ""
    if (Test-Port -Port $Port) {
        Write-Host "[OK] $ServiceName esta listo en el puerto $Port" -ForegroundColor Green
    } else {
        Write-Host "[ADVERTENCIA] $ServiceName no responde en el puerto $Port despues de $MaxWait segundos" -ForegroundColor Yellow
    }
}

# Verificar que estamos en el directorio raíz del proyecto
if (-not (Test-Path "backend") -or -not (Test-Path "gestory\project") -or -not (Test-Path "project")) {
    Write-Host "[ERROR] Este script debe ejecutarse desde la raiz del proyecto" -ForegroundColor Red
    Write-Host "   Asegurate de estar en: C:\INNOVATEC\project-bolt-sb1-tgs5h47h" -ForegroundColor Red
    exit 1
}

# Verificar puertos disponibles
Write-Host "[INFO] Verificando puertos disponibles..." -ForegroundColor Cyan
$ports = @(5000, 5173, 8000)
foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "[ADVERTENCIA] Puerto $port esta en uso. Asegurate de cerrar servicios anteriores." -ForegroundColor Yellow
    }
}
Write-Host ""

# Obtener ruta actual
$rootPath = Get-Location

# 1. BACKEND (Node.js/Express)
Write-Host "[INICIANDO] Backend (Node.js/Express)..." -ForegroundColor Green
$backendPath = Join-Path $rootPath "backend"
Set-Location $backendPath

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[INSTALANDO] Dependencias del backend..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error instalando dependencias del backend" -ForegroundColor Red
        Set-Location $rootPath
        exit 1
    }
}

# Verificar si existe .env
if (-not (Test-Path ".env")) {
    Write-Host "[ADVERTENCIA] Archivo .env no encontrado en backend\" -ForegroundColor Yellow
    Write-Host "   Crea un archivo .env con:" -ForegroundColor Yellow
    Write-Host "   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/innovatec" -ForegroundColor Yellow
    Write-Host "   PORT=5000" -ForegroundColor Yellow
    Write-Host "   ENABLE_BATCH_PROCESSING=true" -ForegroundColor Yellow
    Write-Host "   JWT_SECRET=tu_secret_jwt_aqui" -ForegroundColor Yellow
    Write-Host ""
}

$backendCommand = "cd '$backendPath'; Write-Host '[BACKEND] Puerto 5000' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal
Set-Location $rootPath
Start-Sleep -Seconds 3
Wait-ForService -Port 5000 -ServiceName "Backend"

# 2. PANEL DE ADMINISTRACIÓN (Vite/React)
Write-Host "[INICIANDO] Panel de Administracion (Vite/React)..." -ForegroundColor Green
$panelPath = Join-Path $rootPath "gestory\project"
Set-Location $panelPath

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[INSTALANDO] Dependencias del panel de administracion..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error instalando dependencias del panel" -ForegroundColor Red
        Set-Location $rootPath
        exit 1
    }
}

# Verificar si existe .env
if (-not (Test-Path ".env")) {
    Write-Host "[ADVERTENCIA] Archivo .env no encontrado en gestory\project\" -ForegroundColor Yellow
    Write-Host "   Crea un archivo .env con:" -ForegroundColor Yellow
    Write-Host "   VITE_API_URL=http://192.168.1.184:5000/api" -ForegroundColor Yellow
    Write-Host "   (Reemplaza 192.168.1.184 con tu IP local)" -ForegroundColor Yellow
    Write-Host ""
}

$panelCommand = "cd '$panelPath'; Write-Host '[PANEL ADMIN] Puerto 5173' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $panelCommand -WindowStyle Normal
Set-Location $rootPath
Start-Sleep -Seconds 3
Wait-ForService -Port 5173 -ServiceName "Panel de Administracion"

# 3. APP MÓVIL (Expo)
Write-Host "[INICIANDO] App Movil (Expo)..." -ForegroundColor Green
$appPath = Join-Path $rootPath "project"
Set-Location $appPath

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[INSTALANDO] Dependencias de la app movil..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error instalando dependencias de la app movil" -ForegroundColor Red
        Set-Location $rootPath
        exit 1
    }
}

$appCommand = "cd '$appPath'; Write-Host '[APP MOVIL] Expo' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $appCommand -WindowStyle Normal
Set-Location $rootPath

# 4. SERVICIO ML (Python/FastAPI) - Opcional
Write-Host ""
Write-Host "Deseas iniciar el Servicio ML (Python)? (S/N): " -ForegroundColor Cyan -NoNewline
$startML = Read-Host

if ($startML -eq "S" -or $startML -eq "s" -or $startML -eq "Y" -or $startML -eq "y") {
    Write-Host "[INICIANDO] Servicio ML (Python/FastAPI)..." -ForegroundColor Green
    $mlPath = Join-Path $rootPath "backend\ml-service"
    Set-Location $mlPath
    
    # Verificar si existe el entorno virtual
    if (-not (Test-Path "venv\Scripts\activate.bat")) {
        Write-Host "[ADVERTENCIA] Entorno virtual no encontrado." -ForegroundColor Yellow
        Write-Host "   Ejecuta primero:" -ForegroundColor Yellow
        Write-Host "   python -m venv venv" -ForegroundColor Yellow
        Write-Host "   venv\Scripts\activate" -ForegroundColor Yellow
        Write-Host "   pip install -r requirements.txt" -ForegroundColor Yellow
        Write-Host ""
        Set-Location $rootPath
    } else {
        # Verificar si existe .env
        if (-not (Test-Path ".env")) {
            Write-Host "[ADVERTENCIA] Archivo .env no encontrado en backend\ml-service\" -ForegroundColor Yellow
            Write-Host "   Crea un archivo .env con:" -ForegroundColor Yellow
            Write-Host "   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/innovatec" -ForegroundColor Yellow
            Write-Host "   ML_PORT=8000" -ForegroundColor Yellow
            Write-Host "   ML_HOST=0.0.0.0" -ForegroundColor Yellow
            Write-Host ""
        }
        
        $mlCommand = "cd '$mlPath'; Write-Host '[ML SERVICE] Puerto 8000' -ForegroundColor Green; .\venv\Scripts\activate; python main.py"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $mlCommand -WindowStyle Normal
        Set-Location $rootPath
        Start-Sleep -Seconds 3
        Wait-ForService -Port 8000 -ServiceName "Servicio ML"
    }
} else {
    Write-Host "[SALTANDO] Servicio ML" -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor White
Write-Host "   - Backend API:        http://localhost:5000" -ForegroundColor Cyan
Write-Host "   - Panel Admin:        http://localhost:5173" -ForegroundColor Cyan
Write-Host "   - App Movil (Expo):   Escanea el QR en la ventana de Expo" -ForegroundColor Cyan
if ($startML -eq "S" -or $startML -eq "s" -or $startML -eq "Y" -or $startML -eq "y") {
    Write-Host "   - Servicio ML:        http://localhost:8000" -ForegroundColor Cyan
    Write-Host "   - ML Docs (Swagger):  http://localhost:8000/docs" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Credenciales de administrador:" -ForegroundColor White
Write-Host "   - Email:    test@gmail.com" -ForegroundColor Yellow
Write-Host "   - Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para detener todos los servicios, cierra las ventanas de PowerShell" -ForegroundColor White
Write-Host ""
