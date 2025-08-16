@echo off
echo 📦 Instalando dependencias de Joel Trivia NestJS...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo 📝 Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detectado: %NODE_VERSION%

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm detectado: v%NPM_VERSION%

REM Instalar dependencias del backend
echo.
echo 🏗️  Instalando dependencias del backend NestJS...
cd server
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)
echo ✅ Backend dependencies instaladas

REM Instalar dependencias del frontend
echo.
echo ⚛️  Instalando dependencias del frontend React...
cd ..\client
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)
echo ✅ Frontend dependencies instaladas

cd ..

echo.
echo 🎉 ¡Instalación completada!
echo.
echo 🚀 Para ejecutar en desarrollo:
echo    dev.bat               # Inicio rápido
echo    start.bat             # Con ventanas separadas
echo.
echo 🏗️  Para desarrollo manual:
echo    Terminal 1: cd server ^&^& npm run start:dev
echo    Terminal 2: cd client ^&^& npm run dev
echo.
echo 🐳 Para Docker:
echo    docker-compose up
pause
