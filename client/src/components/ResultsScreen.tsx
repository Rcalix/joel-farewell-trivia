import React from 'react';

interface Question {
  id: string;
  question: string;  // ✅ CORREGIDO: usar 'question' no 'text'
  options: any[];    // ✅ CORREGIDO: options es array de objetos
  joelAnswer?: string;
  type?: 'multiple' | 'text';
  imagePath?: string;
}

interface PlayerAnswer {
  playerId: string;
  playerName: string;
  answer: string;
  isCorrect: boolean;
  isJoel: boolean;
}

interface QuestionResult {
  question: Question;
  correctAnswer: string;
  answers: Record<string, string>;  
  joelAnswer: string;
}

interface ResultsScreenProps {
  questionResult?: QuestionResult | null;  
  players?: any[];  
  currentPlayer?: any;  
  onContinue: () => void;
  isLastQuestion: boolean;
  playersReady?: Set<string>;  
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  questionResult,
  players = [],  
  currentPlayer,
  onContinue,
  isLastQuestion,
  playersReady = new Set()  
}) => {
  console.log('📊 ResultsScreen datos recibidos:', { 
    questionResult, 
    isLastQuestion,
    players,
    currentPlayer,
    playersReady
  });

  // Verificar que tenemos los datos necesarios
  if (!questionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-xl">Cargando resultados...</div>
        </div>
      </div>
    );
  }

  const { question, correctAnswer, answers } = questionResult;

  // Verificar que la pregunta existe
  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-xl mb-4">❌ Error: No se pudo cargar la pregunta</div>
          <button
            onClick={onContinue}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {isLastQuestion ? '🏁 Ver Resultados Finales' : '➡️ Siguiente Pregunta'}
          </button>
        </div>
      </div>
    );
  }

  // ✅ CONVERTIR SOCKETIDS A NOMBRES DE JUGADORES
  const playerAnswers: PlayerAnswer[] = [];
  
  console.log('🔍 Procesando answers:', answers);
  console.log('🔍 Jugadores disponibles:', players);
  
  if (answers && players && players.length > 0) {
    Object.entries(answers).forEach(([socketId, answer]) => {
      console.log(`🔍 Buscando jugador para socketId: ${socketId}`);
      
      // Buscar jugador por socketId o id
      const player = players.find(p => 
        p.socketId === socketId || 
        p.id === socketId
      );
      
      console.log(`🔍 Jugador encontrado:`, player);
      
      if (player) {
        const playerAnswer: PlayerAnswer = {
          playerId: player.id || socketId,
          playerName: player.name,
          answer: answer,
          isCorrect: answer === correctAnswer,
          isJoel: player.isJoel || false
        };
        
        playerAnswers.push(playerAnswer);
        console.log(`✅ PlayerAnswer creado:`, playerAnswer);
      } else {
        console.log(`⚠️ No se encontró jugador para socketId: ${socketId}`);
        
        // Crear un jugador temporal si no se encuentra
        const tempPlayerAnswer: PlayerAnswer = {
          playerId: socketId,
          playerName: `Jugador-${socketId.substring(0, 4)}`,
          answer: answer,
          isCorrect: answer === correctAnswer,
          isJoel: false
        };
        
        playerAnswers.push(tempPlayerAnswer);
        console.log(`🔧 PlayerAnswer temporal creado:`, tempPlayerAnswer);
      }
    });
  } else {
    console.log('⚠️ No hay answers o players para procesar');
  }

  // ✅ FILTRAR A JOEL DE LAS RESPUESTAS - Solo mostrar jugadores que adivinan
  const playersWhoGuess = playerAnswers.filter(answer => !answer.isJoel);
  
  // Encontrar la respuesta de Joel (solo para referencia)
  const joelAnswer = playerAnswers.find(answer => answer.isJoel);
  
  // Contar respuestas correctas SOLO de los jugadores que adivinan
  const correctAnswersCount = playersWhoGuess.filter(answer => answer.isCorrect).length;
  const totalPlayers = playersWhoGuess.length;

  console.log('📊 PlayerAnswers procesados:', playerAnswers);
  console.log('📊 Estadísticas:', { correctAnswersCount, totalPlayers, joelAnswer });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            📊 Resultados
          </h1>
          <div className="text-lg opacity-80">
            {correctAnswersCount} de {totalPlayers} jugadores acertaron la respuesta de Joel
          </div>
        </div>

        {/* Pregunta */}
        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
            {question.question}
          </h2>
        </div>

        {/* Respuesta correcta de Joel */}
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              ✅ Respuesta correcta de Joel:
            </div>
            <div className="text-2xl font-bold text-green-300">
              {correctAnswer}
            </div>
          </div>
        </div>

        {/* Respuestas de los jugadores */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold text-center mb-4">
            🎯 ¿Quién conoce mejor a Joel?
          </h3>
          
          {playersWhoGuess && playersWhoGuess.length > 0 ? (
            playersWhoGuess.map((playerAnswer, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  playerAnswer.isCorrect
                    ? 'bg-green-500/20 border border-green-500'
                    : 'bg-red-500/20 border border-red-500'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    playerAnswer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {playerAnswer.isCorrect ? '🎯' : '❌'}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {playerAnswer.playerName}
                    </div>
                    <div className="text-sm opacity-80">
                      Respuesta: {playerAnswer.answer}
                    </div>
                  </div>
                </div>
                
                {playerAnswer.isCorrect && (
                  <div className="text-green-300 font-bold">
                    ¡Conoce a Joel! 🎉
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-300">
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-200">⚠️ No hay jugadores que adivinen</p>
                <div className="mt-2 text-xs">
                  <p>Solo Joel está en este juego</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-300">
                {correctAnswersCount}
              </div>
              <div className="text-sm opacity-80">Acertaron</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-300">
                {totalPlayers - correctAnswersCount}
              </div>
              <div className="text-sm opacity-80">Fallaron</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-300">
                {totalPlayers > 0 ? Math.round((correctAnswersCount / totalPlayers) * 100) : 0}%
              </div>
              <div className="text-sm opacity-80">Conoce a Joel</div>
            </div>
          </div>
        </div>

        {/* Botón continuar */}
        <div className="text-center">
          {currentPlayer?.isJoel ? (
            // Joel puede forzar siguiente pregunta
            <button
              onClick={onContinue}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
            >
              👑 {isLastQuestion ? '🏁 Ver Resultados Finales' : '➡️ Siguiente Pregunta (Joel)'}
            </button>
          ) : (
            // Otros jugadores deben esperar
            <div className="space-y-4">
              <button
                onClick={onContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
              >
                ✋ Marcar como listo
              </button>
              <div className="text-sm text-white/70">
                {playersReady.size > 0 && (
                  <p>👥 Jugadores listos: {playersReady.size}/{players.length}</p>
                )}
                <p>⏳ Joel puede forzar el avance o esperar a que todos estén listos</p>
              </div>
            </div>
          )}
        </div>

        {/* Debug info (solo en desarrollo) */}
        <div className="mt-8 bg-black/20 rounded-lg p-4">
          <details>
            <summary className="cursor-pointer font-semibold">🔍 Debug Info Detallado</summary>
            <div className="mt-2 text-xs overflow-auto space-y-2">
              <div>
                <strong>questionResult:</strong>
                <pre>{JSON.stringify(questionResult, null, 2)}</pre>
              </div>
              <div>
                <strong>players:</strong>
                <pre>{JSON.stringify(players, null, 2)}</pre>
              </div>
              <div>
                <strong>playerAnswers procesados:</strong>
                <pre>{JSON.stringify(playerAnswers, null, 2)}</pre>
              </div>
              <div>
                <strong>correctAnswersCount:</strong> {correctAnswersCount}
              </div>
              <div>
                <strong>totalPlayers:</strong> {totalPlayers}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;