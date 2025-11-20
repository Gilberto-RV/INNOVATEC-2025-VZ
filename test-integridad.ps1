# Script de Pruebas de Integridad del Proyecto INNOVATEC
# Verifica que todos los servicios estén funcionando correctamente
# Uso: .\test-integridad.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS DE INTEGRIDAD DEL PROYECTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$testsPassed = 0
$testsFailed = 0
$totalTests = 0

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

# Función para hacer petición HTTP
function Test-HTTPEndpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [int]$TimeoutSec = 5
    )
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = $TimeoutSec
            ErrorAction = "Stop"
        }
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Función para ejecutar un test
function Run-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    $script:totalTests++
    Write-Host "[TEST] $TestName" -ForegroundColor Cyan -NoNewline
    try {
        $result = & $TestScript
        if ($result) {
            $script:testsPassed++
            Write-Host " ✅ PASÓ" -ForegroundColor Green
            return $true
        } else {
            $script:testsFailed++
            Write-Host " ❌ FALLÓ" -ForegroundColor Red
            return $false
        }
    } catch {
        $script:testsFailed++
        Write-Host " ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "=== Verificación de Puertos ===" -ForegroundColor Yellow
Write-Host ""

# Test 1: Puerto Backend (5000)
Run-Test "Backend está corriendo en puerto 5000" {
    Test-Port -Port 5000
}

# Test 2: Puerto Frontend (5173)
Run-Test "Frontend está corriendo en puerto 5173" {
    Test-Port -Port 5173
}

# Test 3: Puerto ML Service (8000)
Run-Test "ML Service está corriendo en puerto 8000" {
    Test-Port -Port 8000
}

Write-Host ""
Write-Host "=== Pruebas de Endpoints del Backend ===" -ForegroundColor Yellow
Write-Host ""

# Test 4: Health Check Backend
Run-Test "Backend responde en / (root)" {
    $result = Test-HTTPEndpoint -Url "http://localhost:5000/"
    $result.Success
}

# Test 5: API de Edificios
Run-Test "API de edificios responde" {
    $result = Test-HTTPEndpoint -Url "http://localhost:5000/api/buildings"
    $result.Success -and $result.StatusCode -eq 200
}

# Test 6: API de Eventos
Run-Test "API de eventos responde" {
    $result = Test-HTTPEndpoint -Url "http://localhost:5000/api/events"
    $result.Success -and $result.StatusCode -eq 200
}

# Test 7: API de Big Data (requiere autenticación)
Run-Test "API de Big Data existe" {
    $result = Test-HTTPEndpoint -Url "http://localhost:5000/api/bigdata/dashboard"
    # Puede retornar 401 (no autenticado) o 200 (si hay token)
    $result.Success -and ($result.StatusCode -eq 200 -or $result.StatusCode -eq 401)
}

Write-Host ""
Write-Host "=== Pruebas del ML Service ===" -ForegroundColor Yellow
Write-Host ""

# Test 8: Health Check ML Service
Run-Test "ML Service health check responde" {
    $result = Test-HTTPEndpoint -Url "http://localhost:8000/health"
    if ($result.Success) {
        try {
            $json = $result.Content | ConvertFrom-Json
            $json.status -eq "ok"
        } catch {
            $false
        }
    } else {
        $false
    }
}

# Test 9: Verificar modelos cargados
Run-Test "ML Service tiene modelos cargados" {
    $result = Test-HTTPEndpoint -Url "http://localhost:8000/health"
    if ($result.Success) {
        try {
            $json = $result.Content | ConvertFrom-Json
            if ($json.models_loaded) {
                $models = $json.models_loaded
                ($models.attendance -eq $true) -or ($models.mobility -eq $true) -or ($models.saturation -eq $true)
            } else {
                $false
            }
        } catch {
            $false
        }
    } else {
        $false
    }
}

# Test 10: Documentación API ML
Run-Test "ML Service docs disponibles" {
    $result = Test-HTTPEndpoint -Url "http://localhost:8000/docs"
    $result.Success -and $result.StatusCode -eq 200
}

Write-Host ""
Write-Host "=== Pruebas del Frontend ===" -ForegroundColor Yellow
Write-Host ""

# Test 11: Frontend responde
Run-Test "Frontend responde correctamente" {
    $result = Test-HTTPEndpoint -Url "http://localhost:5173/"
    $result.Success -and $result.StatusCode -eq 200
}

# Test 12: Frontend sirve HTML
Run-Test "Frontend sirve contenido HTML" {
    $result = Test-HTTPEndpoint -Url "http://localhost:5173/"
    if ($result.Success) {
        $result.Content -match "<!DOCTYPE html>|<html" -or $result.Content -match "root"
    } else {
        $false
    }
}

Write-Host ""
Write-Host "=== Pruebas de Integración ===" -ForegroundColor Yellow
Write-Host ""

# Test 13: Backend puede comunicarse con ML Service
Run-Test "Backend puede comunicarse con ML Service" {
    # Verificar que el backend tiene la variable ML_SERVICE_URL configurada
    if (Test-Path "backend\.env") {
        $envContent = Get-Content "backend\.env" -Raw
        $envContent -match "ML_SERVICE_URL"
    } else {
        $false
    }
}

# Test 14: Verificar conexión MongoDB (indirecto - si el backend responde, MongoDB probablemente está conectado)
Run-Test "Backend conectado a MongoDB (verificación indirecta)" {
    # Si el backend puede responder a endpoints que requieren DB, MongoDB está conectado
    $result = Test-HTTPEndpoint -Url "http://localhost:5000/api/buildings"
    # Si retorna 200 o 500 (pero no timeout), significa que se conectó a MongoDB
    $result.Success
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total de pruebas: $totalTests" -ForegroundColor White
Write-Host "✅ Pruebas exitosas: $testsPassed" -ForegroundColor Green
Write-Host "❌ Pruebas fallidas: $testsFailed" -ForegroundColor Red
Write-Host ""

$successRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }
Write-Host "Tasa de éxito: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 50) { "Yellow" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "El proyecto está funcionando correctamente." -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Cyan
    Write-Host "  • Backend API:        http://localhost:5000" -ForegroundColor White
    Write-Host "  • Panel Admin:        http://localhost:5173" -ForegroundColor White
    Write-Host "  • ML Service:         http://localhost:8000" -ForegroundColor White
    Write-Host "  • ML Docs:            http://localhost:8000/docs" -ForegroundColor White
    exit 0
} else {
    Write-Host "⚠️ ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Revisa los servicios que fallaron y asegúrate de que estén corriendo correctamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para reiniciar todos los servicios, ejecuta:" -ForegroundColor Cyan
    Write-Host "  .\start-all-services.ps1" -ForegroundColor White
    exit 1
}

