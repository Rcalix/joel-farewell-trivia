@echo off
echo 🔍 Validando tipos TypeScript...

cd server

echo 📝 Verificando archivos de tipos...

REM Verificar que existen los archivos necesarios
set "files=src\common\dto\join-game.dto.ts src\common\dto\submit-answer.dto.ts src\common\interfaces\player.interface.ts src\data\questions.ts src\game\game.service.ts src\game\game.gateway.ts src\game\game.module.ts"

for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ %%f
    ) else (
        echo ❌ %%f - FALTA
        pause
        exit /b 1
    )
)

echo.
echo 🔧 Compilando TypeScript...

REM Intentar compilar
npm run build
if %errorlevel% equ 0 (
    echo ✅ Compilación exitosa!
) else (
    echo ❌ Errores de compilación
    echo.
    echo 🔧 Ejecutando diagnóstico...
    npx tsc --noEmit --diagnostics
    pause
    exit /b 1
)

echo.
echo 🧪 Ejecutando linting...
npm run lint

echo.
echo ✅ ¡Validación de tipos completada!
pause
