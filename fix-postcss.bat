@echo off
echo 🔧 Solucionando error de PostCSS en Windows...

cd client

REM Verificar si existe postcss.config.js
if exist "postcss.config.js" (
    echo 📝 Convirtiendo postcss.config.js a ES module...
    
    REM Crear versión ES module
    echo export default { > postcss.config.js
    echo   plugins: { >> postcss.config.js
    echo     tailwindcss: {}, >> postcss.config.js
    echo     autoprefixer: {}, >> postcss.config.js
    echo   }, >> postcss.config.js
    echo } >> postcss.config.js
    
    echo ✅ postcss.config.js actualizado a ES module
) else (
    echo ❌ postcss.config.js no encontrado
)

REM Verificar package.json
findstr /c:"\"type\": \"module\"" package.json >nul
if %errorlevel% equ 0 (
    echo 📦 package.json usa ES modules
) else (
    echo 📦 package.json usa CommonJS
)

echo 🧪 Probando configuración...
npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Configuración de PostCSS funcionando!
) else (
    echo ⚠️  Aún hay problemas. Intentando solución alternativa...
    
    REM Alternativa: usar postcss.config.cjs
    if exist "postcss.config.js" move postcss.config.js postcss.config.cjs >nul 2>&1
    
    echo module.exports = { > postcss.config.cjs
    echo   plugins: { >> postcss.config.cjs
    echo     tailwindcss: {}, >> postcss.config.cjs
    echo     autoprefixer: {}, >> postcss.config.cjs
    echo   }, >> postcss.config.cjs
    echo } >> postcss.config.cjs
    
    echo ✅ Creado postcss.config.cjs como alternativa
)

cd ..
pause
