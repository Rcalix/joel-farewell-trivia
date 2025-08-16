import React from 'react';
import { Trophy, Crown } from 'lucide-react';

const FinalScreen = ({ results, players, onReset }) => {
  if (!results || !results.scores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando resultados finales...</p>
        </div>
      </div>
    );
  }

  const leaderboard = players
    .filter(p => !p.isJoel)
    .map(player => {
      const score = results.scores[player.socketId] || results.scores[player.id] || 0;
      return {
        ...player,
        score: score
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            ¡Resultados Finales!
          </h1>
          <p className="text-xl text-white/90">¿Quién conoce mejor a Joel?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ranking */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🏆 Ranking</h2>
            
            <div className="space-y-4">
              {leaderboard.map((player, index) => (
                <div 
                  key={player.id}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-yellow-100 border-yellow-300' :
                    index === 1 ? 'bg-gray-100 border-gray-300' :
                    index === 2 ? 'bg-orange-100 border-orange-300' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">#{index + 1}</span>
                      {index === 0 && <Crown className="w-6 h-6 text-yellow-600" />}
                      <span className="font-semibold text-lg">{player.name}</span>
                    </div>
                    <span className="text-xl font-bold">
                      {player.score}/15
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(player.score / 15) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mensaje de despedida */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">💝 Para Joel</h2>
            
            <div className="space-y-4 text-center">
              <p className="text-lg text-gray-700">
                ¡Esperamos que esta trivia te haya divertido tanto como a nosotros!
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700">
                  🇰🇷 <strong>¡Que tengas una aventura increíble en Corea!</strong>
                </p>
                <p className="text-blue-600 mt-2">
                  Sabemos que la vas a pasar genial y que vas a aprender muchísimo.
                </p>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-pink-700">
                  💜 <strong>Te vamos a extrañar muchísimo</strong>
                </p>
                <p className="text-pink-600 mt-2">
                  Pero sabemos que esto es solo un "hasta luego", no un "adiós".
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-700">
                  🏗️ <strong>Construido con NestJS</strong>
                </p>
                <p className="text-green-600 mt-2">
                  Backend robusto, TypeScript y arquitectura escalable
                </p>
              </div>

              <div className="text-4xl">
                🎸 ♟️ 🎮 🌶️ 🤔
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onReset}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
          >
            🔄 Nueva partida (mantener jugadores)
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalScreen;