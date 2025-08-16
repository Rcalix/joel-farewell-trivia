import React from 'react';
import { Crown } from 'lucide-react';

const LobbyScreen = ({ players, currentPlayer, onStart, roomCode }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 p-4">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
        ¡Listos para jugar!
      </h1>
      <p className="text-xl text-white/90 mb-8">
        Sala: <span className="font-mono text-2xl">{roomCode}</span>
      </p>
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Jugadores en la sala ({players.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {players.map((player) => (
            <div 
              key={player.id}
              className={`p-4 rounded-lg border-2 ${
                player.isJoel 
                  ? 'bg-yellow-100 border-yellow-300' 
                  : player.id === currentPlayer.id
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {player.isJoel && <Crown className="w-5 h-5 text-yellow-600" />}
                <span className="font-semibold text-lg">{player.name}</span>
                {player.id === currentPlayer.id && <span className="text-blue-600">(Tú)</span>}
                {player.isJoel && <span className="text-xs bg-yellow-200 px-2 py-1 rounded">JOEL</span>}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onStart({
            timePerQuestion: 30,
            showResultsAfterEachQuestion: true,
            skipToNextWhenAllAnswered: false,
            allowJoelToSkipResults: true,
            maxWaitTimeForResults: 10
          })}
          disabled={players.length < 2}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-xl hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {players.length < 2 ? 'Esperando más jugadores...' : '🚀 Comenzar Trivia'}
        </button>
      </div>
    </div>
  </div>
);

export default LobbyScreen;