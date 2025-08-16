#!/bin/bash

echo "🧪 Ejecutando tests de Joel Trivia NestJS..."

# Tests del backend
echo "🏗️  Tests del backend..."
cd server
npm run test
BACKEND_TEST_RESULT=$?

# Tests del frontend (si existen)
echo ""
echo "⚛️  Tests del frontend..."
cd ../client
if npm run test --version >/dev/null 2>&1; then
    npm run test -- --run
    FRONTEND_TEST_RESULT=$?
else
    echo "⚠️  No hay tests configurados para el frontend"
    FRONTEND_TEST_RESULT=0
fi

cd ..

echo ""
if [ $BACKEND_TEST_RESULT -eq 0 ] && [ $FRONTEND_TEST_RESULT -eq 0 ]; then
    echo "✅ Todos los tests pasaron!"
else
    echo "❌ Algunos tests fallaron"
    exit 1
fi
