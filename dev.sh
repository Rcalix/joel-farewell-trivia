#!/bin/bash

echo "🚀 Iniciando desarrollo rápido de Joel Trivia NestJS..."

# Función para verificar si un puerto está ocupado
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Puerto $1 está ocupado"
        return 1
    else
        return 0
    fi
}

# Verificar puertos
if ! check_port 3001; then
    echo "❌ Puerto 3001 (backend) ocupado. Libéralo y vuelve a intentar."
    exit 1
fi

if ! check_port 3000; then
    echo "⚠️  Puerto 3000 (frontend) ocupado. Intentaré con 3002..."
    FRONTEND_PORT=3002
else
    FRONTEND_PORT=3000
fi

# Función para matar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servidores..."
    jobs -p | xargs -r kill
    exit
}

trap cleanup SIGINT SIGTERM

# Iniciar backend
echo "🏗️  Iniciando backend NestJS en puerto 3001..."
cd server && npm run start:dev &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend
echo "⚛️  Iniciando frontend React en puerto $FRONTEND_PORT..."
cd ../client && PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!

# Mostrar información
echo ""
echo "✅ Servidores iniciados!"
echo ""
echo "📱 Acceso:"
echo "   • Frontend: http://localhost:$FRONTEND_PORT"
echo "   • Backend API: http://localhost:3001"
echo "   • Health Check: http://localhost:3001/health"
echo ""
echo "📱 Desde móviles:"
if command -v hostname >/dev/null 2>&1; then
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null)
    if [ -z "$LOCAL_IP" ] && command -v ipconfig >/dev/null 2>&1; then
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null)
    fi
    if [ -n "$LOCAL_IP" ]; then
        echo "   • http://$LOCAL_IP:$FRONTEND_PORT"
    fi
fi
echo ""
echo "🛑 Presiona Ctrl+C para detener todo"

# Esperar a que los procesos terminen
wait
