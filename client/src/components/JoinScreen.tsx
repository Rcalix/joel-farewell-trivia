import React, { useState } from 'react';
import { Users, Crown, Heart, Plane, Wifi, Smartphone } from 'lucide-react';

const JoinScreen = ({ onJoin, players, roomCode, error, setError }) => {
  const [playerName, setPlayerName] = useState('');
  const [isJoel, setIsJoel] = useState(false);
  const [enteredRoomCode, setEnteredRoomCode] = useState('');

  const handleJoin = () => {
    if (playerName.trim()) {
      // Verificar código de sala si se ingresó uno
      if (enteredRoomCode.trim() && enteredRoomCode.toUpperCase() !== roomCode) {
        setError('Código de sala incorrecto');
        return;
      }
      onJoin(playerName.trim(), isJoel);
    }
  };

  const joelExists = players.some(p => p.isJoel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Plane className="w-12 h-12 text-white animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Trivia de Despedida
            </h1>
            <Heart className="w-12 h-12 text-white animate-pulse" />
          </div>
          <p className="text-xl text-white/90 mb-4">
            ¿Qué tan bien conocemos a Joel antes de que se vaya a Corea? 🇰🇷
          </p>
          <div className="bg-white/20 rounded-lg p-4 inline-block">
            <p className="text-white font-semibold">
              Código de sala: <span className="text-2xl font-mono">{roomCode}</span>
            </p>
            <p className="text-white/80 text-sm mt-1">Powered by NestJS 🚀</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario de unión */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-800">Únete desde tu móvil</h2>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Código de sala (opcional)"
                value={enteredRoomCode}
                onChange={(e) => setEnteredRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-center text-lg"
              />
              
              <input
                type="text"
                placeholder="Tu nombre"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg"
              />
              
              <div className="flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  id="isJoel"
                  checked={isJoel}
                  onChange={(e) => setIsJoel(e.target.checked)}
                  disabled={joelExists}
                  className="w-5 h-5 text-yellow-600"
                />
                <label 
                  htmlFor="isJoel" 
                  className={`font-medium cursor-pointer ${
                    joelExists ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                  }`}
                >
                  Soy Joel 👑 {joelExists && '(Ya ocupado)'}
                </label>
              </div>
              
              <button
                onClick={handleJoin}
                disabled={!playerName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unirse al juego
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                <strong>📱 Instrucciones:</strong>
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Cada persona puede unirse desde su celular</li>
                <li>• Solo una persona puede ser Joel</li>
                <li>• Mínimo 2 jugadores para empezar</li>
                <li>• Las respuestas se sincronizan en tiempo real</li>
                <li>• Backend robusto con NestJS + TypeScript</li>
              </ul>
            </div>
          </div>

          {/* Lista de jugadores */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              Jugadores conectados ({players.length})
            </h2>
            
            <div className="space-y-3">
              {players.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                    player.isJoel 
                      ? 'bg-yellow-100 border-yellow-300' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-grow">
                    {player.isJoel && <Crown className="w-5 h-5 text-yellow-600" />}
                    <span className="font-semibold">{player.name}</span>
                    {player.isJoel && (
                      <span className="text-xs bg-yellow-200 px-2 py-1 rounded">JOEL</span>
                    )}
                  </div>
                  <Wifi className="w-4 h-4 text-green-500" />
                </div>
              ))}
              
              {players.length === 0 && (
                <p className="text-center text-gray-500 italic py-8">
                  Esperando jugadores...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinScreen;