@echo off
echo 🎮 Iniciando Joel Trivia con NestJS...

echo ✅ Abriendo servidores en ventanas separadas!
echo.

REM Ventana 1: Backend NestJS
start "Joel Trivia - Backend NestJS" cmd /k "cd server && echo 🏗️ Backend NestJS iniciando... && npm run start:dev"

REM Esperar un poco
timeout /t 2 /nobreak >nul

REM Ventana 2: Frontend React
start "Joel Trivia - Frontend React" cmd /k "cd client && echo ⚛️ Frontend React iniciando... && npm run dev"

echo 📱 Acceso:
echo    • Computadora: http://localhost:3000
echo    • Backend: http://localhost:3001/health
echo.
echo 📱 Desde móviles, usar tu IP local:
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| find "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        echo    • http://%%j:3000
        goto :done_ip
    )
)
:done_ip
echo.
echo 🔧 Comandos útiles:
echo    • Cierra las ventanas para detener los servidores
echo    • Usa Ctrl+C en cada ventana para parar limpiamente
echo.
echo 🏗️ Arquitectura:
echo    • Backend: NestJS + TypeScript + Socket.IO
echo    • Frontend: React + Vite + Tailwind CSS
echo    • Validaciones: DTOs con class-validator
echo    • WebSockets: Comunicación en tiempo real
pause
