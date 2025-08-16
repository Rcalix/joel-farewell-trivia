#!/bin/bash

echo "🎮 Iniciando Joel Trivia con NestJS..."

# Verificar si existe tmux
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux no está instalado. Instalando..."
    # Para macOS
    if command -v brew &> /dev/null; then
        brew install tmux
    # Para Ubuntu/Debian
    elif command -v apt &> /dev/null; then
        sudo apt update && sudo apt install tmux -y
    else
        echo "⚠️  Instala tmux manualmente y vuelve a ejecutar"
        exit 1
    fi
fi

# Crear sesión tmux
tmux new-session -d -s joel-trivia-nestjs

# Ventana 1: Backend NestJS
tmux send-keys -t joel-trivia-nestjs:0 'cd server && npm run start:dev' Enter

# Ventana 2: Frontend React
tmux new-window -t joel-trivia-nestjs
tmux send-keys -t joel-trivia-nestjs:1 'cd client && npm run dev' Enter

# Mostrar información
echo "✅ Servidores iniciados en tmux!"
echo ""
echo "📱 Accede desde:"
echo "   • Computadora: http://localhost:3000"
echo "   • Móviles: http://$(hostname -I | awk '{print $1}' 2>/dev/null || ipconfig getifaddr en0):3000"
echo "   • API Health: http://localhost:3001/health"
echo ""
chmod +x start.sh

echo "📝 Creando archivos adicionales..."

# Crear .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# NestJS
dist/
.env
.env.test
.env.production
