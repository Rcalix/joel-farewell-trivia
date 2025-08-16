#!/bin/bash

echo "📦 Instalando dependencias de Joel Trivia NestJS..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📝 Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js detectado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm detectado: v$NPM_VERSION"

# Instalar dependencias del backend
echo ""
echo "🏗️  Instalando dependencias del backend NestJS..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi
echo "✅ Backend dependencies instaladas"

# Instalar dependencias del frontend
echo ""
echo "⚛️  Instalando dependencias del frontend React..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del frontend"
    exit 1
fi
echo "✅ Frontend dependencies instaladas"

cd ..

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "🚀 Para ejecutar en desarrollo:"
echo "   ./dev.sh              # Inicio rápido"
echo "   ./start.sh             # Con tmux"
echo ""
echo "🏗️  Para desarrollo manual:"
echo "   Terminal 1: cd server && npm run start:dev"
echo "   Terminal 2: cd client && npm run dev"
echo ""
echo "🐳 Para Docker:"
echo "   docker-compose up"
