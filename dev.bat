@echo off
echo 🚀 Iniciando desarrollo rápido de Joel Trivia NestJS...

REM Función para verificar puertos
netstat -an | find "LISTENING" | find ":3001" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3001 está ocupado. Libéralo y vuelve a intentar.
    pause
    exit /b 1
)

netstat -an | find "LISTENING" | find ":3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3000 está ocupado. Usando puerto 3002...
    set FRONTEND_PORT=3002
) else (
    set FRONTEND_PORT=3000
)

echo 🏗️  Iniciando backend NestJS en puerto 3001...
start "Backend NestJS" cmd /k "cd server && npm run start:dev"

REM Esperar un poco para que el backend inicie
timeout /t 3 /nobreak >nul

echo ⚛️  Iniciando frontend React en puerto %FRONTEND_PORT%...
start "Frontend React" cmd /k "cd client && set PORT=%FRONTEND_PORT% && npm run dev"

echo.
echo ✅ Servidores iniciados en ventanas separadas!
echo.
echo 📱 Acceso:
echo    • Frontend: http://localhost:%FRONTEND_PORT%
echo    • Backend API: http://localhost:3001
echo    • Health Check: http://localhost:3001/health
echo.
echo 📱 Desde móviles:
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| find "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        echo    • http://%%j:%FRONTEND_PORT%
        goto :found_ip
    )
)
:found_ip
echo.
echo 🛑 Cierra las ventanas del servidor para detener todo
pause
