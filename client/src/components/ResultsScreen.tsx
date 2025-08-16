import React, { useState } from 'react';
import { CheckCircle, XCircle, Crown } from 'lucide-react';

const ResultsScreen = ({ results, players, currentPlayer, onNext, isLastQuestion, playersReady, onMarkReady }) => {
  const [hasClickedNext, setHasClickedNext] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  
  if (!results) return <div>Cargando resultados...</div>;

  const handleNext = () => {
    if (!hasClickedNext) {
      setHasClickedNext(true);
      onNext();
    }
  };

  // Para puntajes usamos nonJoelPlayers, para "ready" usamos todos los players
  const nonJoelPlayers = players.filter(p => !p.isJoel);
  const allPlayers = players; // Todos los jugadores incluyendo Joel para el sistema ready
  const readyPlayersCount = playersReady ? playersReady.size : 0;
  const isCurrentPlayerReady = playersReady ? playersReady.has(currentPlayer?.socketId || currentPlayer?.id) : false;
  const allPlayersReady = readyPlayersCount >= allPlayers.length;

  console.log('🔍 Debug ResultsScreen:', {
    nonJoelPlayers: nonJoelPlayers.length,
    allPlayers: allPlayers.length,
    readyPlayersCount,
    playersReady: Array.from(playersReady || []),
    currentPlayerSocketId: currentPlayer?.socketId,
    currentPlayerId: currentPlayer?.id,
    isCurrentPlayerReady,
    allPlayersReady
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Resultados</h2>
            <p className="text-gray-600">{results.question.question}</p>
          </div>

          {/* Respuesta correcta destacada */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-800">Respuesta correcta:</span>
            </div>
            {results.correctAnswer ? (
              <p className="text-green-700 text-lg">
                {results.correctAnswer}. {results.question.options.find(opt => opt.letter === results.correctAnswer)?.text}
              </p>
            ) : (
              <p className="text-red-600">⚠️ Error: No se pudo determinar la respuesta correcta</p>
            )}
          </div>

          {/* Respuesta de Joel */}
          {results.joelAnswer ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">Respuesta de Joel:</span>
              </div>
              <p className="text-yellow-700">
                {results.joelAnswer}. {results.question.options.find(opt => opt.letter === results.joelAnswer)?.text}
                {results.joelAnswer === results.correctAnswer && (
                  <span className="ml-2 text-green-600 font-semibold">✓ ¡Joel define la respuesta correcta!</span>
                )}
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-800">⚠️ Error: No se detectó respuesta de Joel</span>
              </div>
              <p className="text-red-600 text-sm">
                Esto no debería pasar. Joel siempre debe responder para definir la respuesta correcta.
              </p>
            </div>
          )}

          {/* Toggle para mostrar resultados detallados */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="flex items-center gap-2 mx-auto bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              {showDetailedResults ? '👁️ Ocultar' : '👀 Ver'} respuestas detalladas
            </button>
          </div>

          {/* Respuestas de jugadores */}
          {showDetailedResults && (
            <div className="space-y-3 mb-8">
              {nonJoelPlayers.map(player => {
                const playerAnswer = results.answers[player.socketId] || results.answers[player.id];
                const isCorrect = playerAnswer === results.correctAnswer;
                
                return (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCorrect ? 
                          <CheckCircle className="w-5 h-5 text-green-500" /> : 
                          <XCircle className="w-5 h-5 text-red-500" />
                        }
                        <span className="font-semibold">
                          {player.name} {player.socketId === currentPlayer?.socketId && '(Tú)'}
                        </span>
                        {isCorrect && <span className="text-green-600 text-sm">+1 punto</span>}
                      </div>
                      <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {playerAnswer ? 
                          `${playerAnswer}. ${results.question.options.find(opt => opt.letter === playerAnswer)?.text}` : 
                          '❌ Sin respuesta'
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sistema de "Ready" simplificado - Solo mostrar estado */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Estado de jugadores
              </h3>
              <p className="text-sm text-gray-600">
                {readyPlayersCount}/{allPlayers.length} jugadores han clickeado siguiente
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Incluyendo a Joel - todos deben estar listos)
              </p>
            </div>

            {/* Barra de progreso CORREGIDA - limitada al 100% */}
            <div className="bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, allPlayers.length > 0 ? (readyPlayersCount / allPlayers.length) * 100 : 0)}%` 
                }}
              />
            </div>

            {/* Lista de jugadores y su estado - MOSTRAR TODOS incluyendo Joel */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {allPlayers.map(player => {
                const isReady = playersReady ? playersReady.has(player.socketId || player.id) : false;
                return (
                  <div 
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                      isReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    } ${player.isJoel ? 'border-2 border-yellow-300' : ''}`}
                  >
                    {isReady ? '✅' : '⏳'}
                    {player.isJoel && <Crown className="w-4 h-4 text-yellow-600" />}
                    <span className="truncate">{player.name}</span>
                    {player.socketId === currentPlayer?.socketId && ' (Tú)'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón único de siguiente pregunta */}
          <button
            onClick={handleNext}
            disabled={hasClickedNext}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              hasClickedNext 
                ? 'bg-gray-400 cursor-not-allowed'
                : isCurrentPlayerReady
                ? 'bg-gray-500 text-white cursor-wait'
                : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105'
            } text-white`}
          >
            {hasClickedNext ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Esperando otros jugadores...
              </div>
            ) : isCurrentPlayerReady ? (
              <div className="flex items-center justify-center gap-2">
                ✅ Esperando otros jugadores...
                {currentPlayer?.isJoel && (
                  <span className="text-yellow-200">(Como Joel puedes forzar haciendo clic de nuevo)</span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {isLastQuestion ? '🏆 Ver Resultados Finales' : '➡️ Siguiente Pregunta'}
                {currentPlayer?.isJoel && (
                  <span className="text-yellow-200 text-sm">(Joel también debe marcar listo)</span>
                )}
              </div>
            )}
          </button>

          {/* Mensaje adicional para Joel */}
          {currentPlayer?.isJoel && !allPlayersReady && isCurrentPlayerReady && (
            <div className="mt-4 text-center">
              <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                👑 Como Joel, haz clic de nuevo en el botón para forzar la siguiente pregunta sin esperar a todos
              </p>
            </div>
          )}

          {/* Explicación del sistema */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              📝 <strong>Sistema:</strong> Todos los jugadores (incluyendo Joel) deben estar listos para avanzar, 
              O Joel puede forzar después de marcar listo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;