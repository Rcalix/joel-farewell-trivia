import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ConnectionScreen from './components/ConnectionScreen';
import JoinScreen from './components/JoinScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import FinalScreen from './components/FinalScreen';

// Configuración del socket para NestJS
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
});

console.log('🔗 Conectando a servidor:', SERVER_URL);

interface Player {
  id: string;
  name: string;
  isJoel: boolean;
  socketId: string;
}

interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  icon: string;
  color: string;
}

interface Question {
  id: number;
  question: string;
  joelAnswer: 'A' | 'B' | 'C' | 'D' | null;
  options: QuestionOption[];
}

// Para manejar la estructura que envía el backend
interface QuestionWrapper {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  gameState?: any;
}

const JoelTriviaApp = () => {
  // Estados del juego
  const [gameState, setGameState] = useState({
    phase: 'lobby',
    players: [],
    currentQuestion: 0,
    timeLeft: 30,
    totalQuestions: 15,
    roomCode: ''
  });
  
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | QuestionWrapper | null>(null);
  const [questionResults, setQuestionResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [playersReady, setPlayersReady] = useState<Set<string>>(new Set());
  const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);

  // Intentar reconectar jugador guardado
  useEffect(() => {
    const savedPlayer = localStorage.getItem('joelTriviaPlayer');
    if (savedPlayer) {
      try {
        const playerData = JSON.parse(savedPlayer);
        console.log('🔄 Intentando reconectar:', playerData);
        // Solo intentar reconectar si tenemos datos válidos
        if (playerData.name && typeof playerData.isJoel === 'boolean') {
          socket.emit('joinGame', { 
            playerName: playerData.name, 
            isJoel: playerData.isJoel 
          });
        } else {
          console.warn('⚠️ Datos de jugador inválidos, limpiando localStorage');
          localStorage.removeItem('joelTriviaPlayer');
        }
      } catch (error) {
        console.error('❌ Error parseando datos guardados:', error);
        localStorage.removeItem('joelTriviaPlayer');
      }
    }
  }, []);

  // Efectos de Socket.IO
  useEffect(() => {
    // Conexión establecida
    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      console.log('🔗 Conectado al servidor NestJS');
    });

    // Desconexión
    socket.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Desconectado del servidor');
    });

    // Estado del juego actualizado
    socket.on('gameState', (state) => {
      console.log('🎮 ✅ gameState RECIBIDO:', state);
      setGameState(state);
      
      // Si volvemos a lobby, limpiar resultados finales
      if (state.phase === 'lobby') {
        setFinalResults(null);
        setQuestionResults(null);
        setCurrentQuestion(null);
        setMyAnswer(null);
        setPlayersReady(new Set<string>());
        setAllPlayersAnswered(false);
      }
    });

    // Reset del juego
    socket.on('gameReset', () => {
      console.log('🔄 Juego reiniciado por otro jugador');
      setCurrentQuestion(null);
      setQuestionResults(null);
      setFinalResults(null);
      setMyAnswer(null);
      setError(null);
      setPlayersReady(new Set<string>());
      setAllPlayersAnswered(false);
    });

    // Manejar currentQuestion Y newQuestion
    socket.on('currentQuestion', (questionData) => {
      console.log('📡 Evento recibido: currentQuestion', questionData);
      setCurrentQuestion(questionData);
      setMyAnswer(null);
      setQuestionResults(null);
      setPlayersReady(new Set<string>());
      setAllPlayersAnswered(false);
      
      // También actualizar gameState si viene incluido
      if (questionData.gameState) {
        console.log('📡 ✅ gameState desde currentQuestion:', questionData.gameState);
        setGameState(questionData.gameState);
      }
    });

    socket.on('newQuestion', (questionData) => {
      console.log('📡 Evento recibido: newQuestion', questionData);
      setCurrentQuestion(questionData);
      setMyAnswer(null);
      setQuestionResults(null);
      setPlayersReady(new Set<string>());
      setAllPlayersAnswered(false);
      
      // También actualizar gameState si viene incluido
      if (questionData.gameState) {
        console.log('📡 ✅ gameState desde newQuestion:', questionData.gameState);
        setGameState(questionData.gameState);
      }
    });

    // Actualización del timer
    socket.on('timerUpdate', (data) => {
      const timeLeft = data.timeLeft || data;
      setGameState(prev => ({ ...prev, timeLeft }));
    });

    // Manejar questionResults correctamente
    socket.on('questionResults', (data) => {
      console.log('📡 Evento recibido: questionResults', data);
      console.log('📊 ✅ questionResults RECIBIDO:', data);
      
      // El backend puede enviar data.results o directamente data
      const results = data.results || data;
      setQuestionResults(results);
      
      // También actualizar gameState si viene incluido
      if (data.gameState) {
        console.log('📡 ✅ gameState RECIBIDO desde questionResults:', data.gameState);
        setGameState(data.gameState);
      }
    });

    // Actualización de jugadores listos
    socket.on('playerReadyUpdate', (data) => {
      console.log('👥 Actualización jugadores listos:', data);
      setPlayersReady(new Set<string>(data.playersReady || []));
    });

    socket.on('playersReadyUpdate', (data) => {
      console.log('👥 Actualización jugadores listos (v2):', data);
      setPlayersReady(new Set<string>(data.playersReady || []));
    });

    // NUEVO: Evento cuando todos los jugadores han respondido
    socket.on('allPlayersAnswered', (data) => {
      console.log('✅ Todos los jugadores han respondido:', data);
      setAllPlayersAnswered(true);
      // Opcional: Auto-avanzar después de un breve delay
      setTimeout(() => {
        if (gameState.phase === 'playing') {
          console.log('⏩ Auto-avanzando porque todos respondieron');
          socket.emit('forceNextQuestion');
        }
      }, 2000); // 2 segundos de delay para mostrar que todos respondieron
    });

    // NUEVO: Progreso de respuestas
    socket.on('answerProgress', (data) => {
      console.log('📊 Progreso de respuestas:', data);
      // Podrías mostrar esto en la UI si quieres
    });

    // Juego iniciado
    socket.on('gameStarted', (data) => {
      console.log('🎮 ¡Juego iniciado!', data);
      if (data.firstQuestion) {
        setCurrentQuestion(data.firstQuestion);
      }
      if (data.gameState) {
        console.log('📡 ✅ gameState desde gameStarted:', data.gameState);
        setGameState(data.gameState);
      }
    });

    // Juego terminado
    socket.on('gameFinished', (results) => {
      console.log('🎯 Juego terminado:', results);
      console.log('📊 Scores del backend:', results.scores || results.finalScores);
      console.log('👥 Jugadores actuales:', gameState.players);
      setFinalResults(results);
      
      // También actualizar gameState si viene incluido
      if (results.gameState) {
        console.log('📡 ✅ gameState FINAL recibido:', results.gameState);
        setGameState(results.gameState);
      }
    });

    // Unión exitosa
    socket.on('joinSuccess', (player) => {
      console.log('✅ joinSuccess:', player);
      setCurrentPlayer(player);
      setError(null);
      
      // Actualizar localStorage con datos completos
      localStorage.setItem('joelTriviaPlayer', JSON.stringify({
        name: player.name,
        isJoel: player.isJoel,
        id: player.id
      }));
    });

    // Respuesta enviada
    socket.on('answerSubmitted', ({ answer }) => {
      console.log('📤 answerSubmitted:', answer);
      setMyAnswer(answer);
    });

    // Errores
    socket.on('error', (errorMessage) => {
      console.error('❌ Error del servidor:', errorMessage);
      
      // Manejar errores específicos
      if (errorMessage.includes('No estás registrado') || 
          errorMessage.includes('No se puede unir al juego en curso')) {
        // Limpiar datos locales y mostrar JoinScreen
        setCurrentPlayer(null);
        localStorage.removeItem('joelTriviaPlayer');
        console.log('🔄 Limpiando sesión debido a error de registro');
      } else if (errorMessage.includes('No se pudo marcar como listo')) {
        // Error menos crítico, solo loggearlo
        console.warn('⚠️ Error de estado:', errorMessage);
      } else {
        // Otros errores
        setError(errorMessage);
      }
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameState');
      socket.off('currentQuestion');
      socket.off('newQuestion');
      socket.off('timerUpdate');
      socket.off('questionResults');
      socket.off('gameStarted');
      socket.off('gameFinished');
      socket.off('joinSuccess');
      socket.off('answerSubmitted');
      socket.off('error');
      socket.off('gameReset');
      socket.off('playerReadyUpdate');
      socket.off('playersReadyUpdate');
      socket.off('allPlayersAnswered');
      socket.off('answerProgress');
    };
  }, [gameState.phase]);

  // Debug de estados importantes
  useEffect(() => {
    console.log('🎮 ✅ gameState ACTUALIZADO:', gameState);
  }, [gameState]);

  useEffect(() => {
    console.log('📊 ✅ questionResults ACTUALIZADO:', questionResults);
  }, [questionResults]);

  // Funciones de interacción
  const joinGame = (playerName, isJoel = false) => {
    localStorage.setItem('joelTriviaPlayer', JSON.stringify({
      name: playerName,
      isJoel: isJoel
    }));
    
    socket.emit('joinGame', { playerName, isJoel });
  };

  const startGame = (config = {}) => {
    socket.emit('startGame', config);
  };

  const submitAnswer = (answer) => {
    console.log('📤 Enviando respuesta:', answer);
    socket.emit('submitAnswer', { answer });
  };

  const nextQuestion = () => {
    console.log('➡️ Solicitando siguiente pregunta');
    socket.emit('nextQuestion');
  };

  const resetGame = () => {
    socket.emit('resetGame');
    setCurrentQuestion(null);
    setQuestionResults(null);
    setFinalResults(null);
    setMyAnswer(null);
    setError(null);
    setPlayersReady(new Set<string>());
    setAllPlayersAnswered(false);
  };

  // Debug de renderizado
  console.log('🖥️ RENDERIZANDO:', {
    connected,
    currentPlayer: currentPlayer?.name,
    gamePhase: gameState.phase,
    hasQuestionResults: !!questionResults,
    hasCurrentQuestion: !!currentQuestion,
    allPlayersAnswered
  });

  // Renderizado condicional
  if (!connected) {
    return <ConnectionScreen />;
  }

  if (!currentPlayer) {
    return (
      <JoinScreen 
        onJoin={joinGame}
        players={gameState.players}
        roomCode={gameState.roomCode}
        error={error}
        setError={setError}
      />
    );
  }

  if (gameState.phase === 'lobby') {
    return (
      <LobbyScreen 
        players={gameState.players}
        currentPlayer={currentPlayer}
        onStart={startGame}
        roomCode={gameState.roomCode}
      />
    );
  }

  if (gameState.phase === 'playing') {
    console.log('📊 Mostrando GameScreen con currentQuestion:', currentQuestion);
    
    // Verificación adicional antes de renderizar GameScreen
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Esperando pregunta del servidor...</p>
            <div className="mt-4 bg-black/20 p-4 rounded text-xs text-left">
              <p><strong>currentQuestion:</strong> {currentQuestion ? 'OK' : 'NULL'}</p>
              <p><strong>gameState.phase:</strong> {gameState.phase}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Notificación cuando todos han respondido */}
        {allPlayersAnswered && gameState.timeLeft > 0 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
              ✅ ¡Todos han respondido! Avanzando automáticamente...
            </div>
          </div>
        )}
        
        <GameScreen 
          question={currentQuestion}
          timeLeft={gameState.timeLeft}
          currentQuestionNum={gameState.currentQuestion + 1}
          totalQuestions={gameState.totalQuestions}
          onSubmitAnswer={submitAnswer}
          myAnswer={myAnswer}
          currentPlayer={currentPlayer}
        />
      </div>
    );
  }

  if (gameState.phase === 'results') {
    console.log('📊 Mostrando ResultsScreen');
    return (
      <ResultsScreen 
        questionResult={questionResults}
        players={gameState.players}
        currentPlayer={currentPlayer}
        onContinue={nextQuestion}
        isLastQuestion={gameState.currentQuestion >= gameState.totalQuestions - 1}
        playersReady={playersReady}
      />
    );
  }

  if (gameState.phase === 'final' && finalResults) {
    console.log('🏁 Mostrando FinalScreen');
    return (
      <FinalScreen 
        results={finalResults}
        players={gameState.players}
        currentPlayer={currentPlayer}
        onReset={resetGame}
      />
    );
  }

  if (gameState.phase === 'final') {
    console.log('🏁 En fase final pero sin resultados:', { finalResults, gameState });
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Calculando resultados finales...</p>
          
          {/* DEBUG TEMPORAL */}
          <div className="mt-4 bg-black/20 p-4 rounded text-xs text-left">
            <p><strong>finalResults:</strong> {finalResults ? 'SÍ' : 'NO'}</p>
            <p><strong>gameState.phase:</strong> {gameState.phase}</p>
            <p><strong>gameState.currentQuestion:</strong> {gameState.currentQuestion}</p>
            <p><strong>Jugadores:</strong> {gameState.players?.length || 0}</p>
          </div>
          
          {/* BOTÓN DE EMERGENCIA */}
          <button 
            onClick={() => {
              console.log('🔄 Solicitando estado del juego...');
              socket.emit('requestGameState');
            }}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔄 Actualizar Estado
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de debug si no coincide nada
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">🐛 Estado inesperado</h1>
        <div className="bg-black/20 p-4 rounded text-left text-sm">
          <p><strong>Fase:</strong> {gameState.phase}</p>
          <p><strong>Conectado:</strong> {connected ? 'Sí' : 'No'}</p>
          <p><strong>Jugador:</strong> {currentPlayer?.name || 'No'}</p>
          <p><strong>Pregunta actual:</strong> {currentQuestion ? 'Sí' : 'No'}</p>
          <p><strong>Resultados:</strong> {questionResults ? 'Sí' : 'No'}</p>
          <p><strong>Resultados finales:</strong> {finalResults ? 'Sí' : 'No'}</p>
        </div>
        <button 
          onClick={resetGame}
          className="mt-4 bg-white text-red-500 px-4 py-2 rounded font-bold"
        >
          🔄 Reiniciar Juego
        </button>
      </div>
    </div>
  );
};

export default JoelTriviaApp;