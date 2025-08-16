import React from 'react';
import { WifiOff } from 'lucide-react';

const ConnectionScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
      <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Conectando...</h2>
      <p className="text-gray-600 mb-6">
        Esperando conexión con el servidor NestJS
      </p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
    </div>
  </div>
);

export default ConnectionScreen;