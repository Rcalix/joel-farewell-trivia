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
const socket = io(SERVER_URL);
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
  
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionResults, setQuestionResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [playersReady, setPlayersReady] = useState(new Set());

  // Intentar reconectar jugador guardado
  useEffect(() => {
    const savedPlayer = localStorage.getItem('joelTriviaPlayer');
    if (savedPlayer) {
      const playerData = JSON.parse(savedPlayer);
      console.log('🔄 Intentando reconectar:', playerData);
      socket.emit('joinGame', { 
        playerName: playerData.name, 
        isJoel: playerData.isJoel 
      });
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
      setGameState(state);
      
      // Si volvemos a lobby, limpiar resultados finales
      if (state.phase === 'lobby') {
        setFinalResults(null);
        setQuestionResults(null);
        setCurrentQuestion(null);
        setMyAnswer(null);
        setPlayersReady(new Set());
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
      setPlayersReady(new Set());
    });

    // Pregunta actual
    socket.on('currentQuestion', (question) => {
      setCurrentQuestion(question);
      setMyAnswer(null);
      setQuestionResults(null);
      setPlayersReady(new Set());
    });

    // Actualización del timer
    socket.on('timerUpdate', (timeLeft) => {
      setGameState(prev => ({ ...prev, timeLeft }));
    });

    // Resultados de pregunta
    socket.on('questionResults', (results) => {
      console.log('📊 Resultados recibidos:', results);
      console.log('👥 Jugadores actuales:', gameState.players);
      setQuestionResults(results);
    });

    // Actualización de jugadores listos
    socket.on('playerReadyUpdate', (data) => {
      console.log('👥 Actualización jugadores listos:', data);
      setPlayersReady(new Set(data.playersReady));
    });

    // Juego iniciado
    socket.on('gameStarted', () => {
      console.log('🎮 ¡Juego iniciado!');
    });

    // Juego terminado
    socket.on('gameFinished', (results) => {
      console.log('🎯 Juego terminado:', results);
      console.log('📊 Scores del backend:', results.scores);
      console.log('👥 Jugadores actuales:', gameState.players);
      setFinalResults(results);
    });

    // Unión exitosa
    socket.on('joinSuccess', (player) => {
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
      setMyAnswer(answer);
    });

    // Errores
    socket.on('error', (errorMessage) => {
      setError(errorMessage);
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameState');
      socket.off('currentQuestion');
      socket.off('timerUpdate');
      socket.off('questionResults');
      socket.off('gameStarted');
      socket.off('gameFinished');
      socket.off('joinSuccess');
      socket.off('answerSubmitted');
      socket.off('error');
      socket.off('gameReset');
      socket.off('playerReadyUpdate');
    };
  }, []);

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
    socket.emit('submitAnswer', { answer });
  };

  const nextQuestion = () => {
    socket.emit('nextQuestion');
  };

  const resetGame = () => {
    socket.emit('resetGame');
    setCurrentQuestion(null);
    setQuestionResults(null);
    setFinalResults(null);
    setMyAnswer(null);
    setError(null);
    setPlayersReady(new Set());
  };

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
    return (
      <GameScreen 
        question={currentQuestion}
        timeLeft={gameState.timeLeft}
        currentQuestionNum={gameState.currentQuestion + 1}
        totalQuestions={gameState.totalQuestions}
        onSubmitAnswer={submitAnswer}
        myAnswer={myAnswer}
        currentPlayer={currentPlayer}
      />
    );
  }

  if (gameState.phase === 'results') {
    return (
      <ResultsScreen 
        results={questionResults}
        players={gameState.players}
        currentPlayer={currentPlayer}
        onNext={nextQuestion}
        isLastQuestion={gameState.currentQuestion >= gameState.totalQuestions - 1}
        playersReady={playersReady}
        onMarkReady={() => {}}
      />
    );
  }

  if (gameState.phase === 'final' && finalResults) {
    return (
      <FinalScreen 
        results={finalResults}
        players={gameState.players}
        onReset={resetGame}
      />
    );
  }

  if (gameState.phase === 'final') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Calculando resultados finales...</p>
        </div>
      </div>
    );
  }

  return <div>Cargando...</div>;
};

export default JoelTriviaApp;