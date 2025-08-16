#!/bin/bash

echo "🔍 Validando tipos TypeScript..."

cd server

echo "📝 Verificando archivos de tipos..."

# Verificar que existen los archivos necesarios
files=(
  "src/common/dto/join-game.dto.ts"
  "src/common/dto/submit-answer.dto.ts"
  "src/common/interfaces/player.interface.ts"
  "src/data/questions.ts"
  "src/game/game.service.ts"
  "src/game/game.gateway.ts"
  "src/game/game.module.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - FALTA"
    exit 1
  fi
done

echo ""
echo "🔧 Compilando TypeScript..."

# Intentar compilar
if npm run build; then
  echo "✅ Compilación exitosa!"
else
  echo "❌ Errores de compilación"
  echo ""
  echo "🔧 Ejecutando diagnóstico..."
  npx tsc --noEmit --diagnostics
  exit 1
fi

echo ""
echo "🧪 Ejecutando linting..."
npm run lint

echo ""
echo "✅ ¡Validación de tipos completada!"
