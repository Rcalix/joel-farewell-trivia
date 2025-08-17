import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, ValidationPipe, UsePipes } from '@nestjs/common';
import { GameService } from './game.service';
import { JoinGameDto } from '../common/dto/join-game.dto';
import { SubmitAnswerDto } from '../common/dto/submit-answer.dto';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      /^http:\/\/192\.168\.\d+\.\d+:3000$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
    ],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private questionTimer: NodeJS.Timeout | null = null;

  constructor(private readonly gameService: GameService) {}

  private stopQuestionTimer() {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }

  // NUEVO: Método centralizado para manejar cuando se completa una pregunta
  private handleQuestionComplete() {
    this.stopQuestionTimer();
    
    // Obtener resultados y estado
    const results = this.gameService.getQuestionResults();
    const gameState = this.gameService.getGameState();
    
    this.logger.log(`📊 Pregunta completada - enviando resultados. Fase: ${gameState.phase}`);
    
    // Emitir resultados con información adicional
    this.server.emit('questionResults', {
      results: results,
      gameState: gameState,
      showNextButton: this.gameService.canMoveToNextQuestion(),
      questionNumber: gameState.currentQuestion + 1,
      totalQuestions: gameState.totalQuestions
    });
    
    // También emitir estado actualizado
    this.broadcastGameState();
    
    this.logger.log('✅ Resultados enviados correctamente al frontend');
  }

  private processNextQuestion() {
    // Limpiar estado de jugadores listos
    this.gameService.resetPlayersReadyStatus();
    
    if (this.gameService.canMoveToNextQuestion()) {
      this.gameService.nextQuestion();
      
      const newQuestion = this.gameService.getCurrentQuestion();
      const gameState = this.gameService.getGameState();
      
      this.server.emit('newQuestion', {
        question: newQuestion,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: gameState.totalQuestions,
        gameState: gameState
      });
      
      this.broadcastGameState();
      this.startQuestionTimer();
      
      this.logger.log(`➡️ Avanzando a pregunta ${gameState.currentQuestion + 1}`);
    } else {
      // Juego terminado
      const finalScores = this.gameService.finishGame();
      
      this.server.emit('gameFinished', {
        finalScores: finalScores,
        players: this.gameService.getAllPlayers(),
        gameState: this.gameService.getGameState()
      });
      
      this.broadcastGameState();
      this.logger.log('🏁 Juego terminado - enviando puntuaciones finales');
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`👤 Cliente conectado: ${client.id}`);
    
    // Enviar estado actual al nuevo cliente
    const gameState = this.gameService.getGameState();
    client.emit('gameState', gameState);

    // Si hay una pregunta activa, enviarla
    if (gameState.phase === 'playing') {
      const currentQuestion = this.gameService.getCurrentQuestion();
      client.emit('currentQuestion', {
        question: currentQuestion,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: gameState.totalQuestions,
        timeLeft: gameState.timeLeft
      });
    }
    
    // NUEVO: Si está en fase de resultados, enviar resultados
    if (gameState.phase === 'results') {
      const results = this.gameService.getQuestionResults();
      client.emit('questionResults', {
        results: results,
        gameState: gameState,
        showNextButton: this.gameService.canMoveToNextQuestion(),
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: gameState.totalQuestions
      });
      
      this.logger.log(`📊 Cliente reconectado - enviando resultados de pregunta ${gameState.currentQuestion + 1}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Cliente desconectado: ${client.id}`);
    this.gameService.removePlayer(client.id);
    this.broadcastGameState();
  }

  @SubscribeMessage('joinGame')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleJoinGame(
    @MessageBody() joinGameDto: JoinGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { playerName, isJoel } = joinGameDto;
    
    const result = this.gameService.joinGame(client.id, playerName, isJoel);
    
    if (typeof result === 'string') {
      // Error
      client.emit('error', result);
      return;
    }
    
    // Éxito
    client.emit('joinSuccess', result);
    this.broadcastGameState();
  }

  @SubscribeMessage('startGame')
  handleStartGame(
    @MessageBody() config: any = {},
    @ConnectedSocket() client: Socket,
  ) {
    const player = this.gameService.getPlayer(client.id);
    
    if (!player) {
      client.emit('error', 'No estás registrado en el juego');
      return;
    }

    if (!this.gameService.canStartGame()) {
      client.emit('error', 'Se necesitan al menos 2 jugadores');
      return;
    }

    // Iniciar juego con configuración personalizada
    if (this.gameService.startGame(config)) {
      const gameState = this.gameService.getGameState();
      const currentQuestion = this.gameService.getCurrentQuestion();
      
      this.server.emit('gameStarted', {
        gameState: gameState,
        firstQuestion: currentQuestion
      });
      
      this.server.emit('currentQuestion', {
        question: currentQuestion,
        questionNumber: 1,
        totalQuestions: gameState.totalQuestions
      });
      
      this.broadcastGameState();
      this.startQuestionTimer();
      
      this.logger.log('🎮 Juego iniciado correctamente');
    }
  }

  @SubscribeMessage('submitAnswer')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleSubmitAnswer(
    @MessageBody() submitAnswerDto: SubmitAnswerDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { answer } = submitAnswerDto;
    const player = this.gameService.getPlayer(client.id);
    
    if (!player) {
      client.emit('error', 'No estás registrado en el juego');
      return;
    }
    
    const success = this.gameService.submitAnswer(client.id, answer);
    
    if (success) {
      client.emit('answerSubmitted', { 
        answer: answer,
        success: true 
      });
      
      this.logger.log(`📝 ${player.name} envió respuesta: ${answer}`);
      
      // CRÍTICO: Verificar si la fase cambió a results después de enviar respuesta
      const gameState = this.gameService.getGameState();
      if (gameState.phase === 'results') {
        this.logger.log('⚡ Todos respondieron - enviando resultados inmediatamente');
        this.handleQuestionComplete();
      } else {
        // Solo actualizar estado si no cambió a results
        this.broadcastGameState();
      }
    } else {
      client.emit('answerSubmitted', { 
        success: false,
        error: 'No se pudo enviar la respuesta' 
      });
      this.logger.warn(`❌ ${player?.name || 'Jugador desconocido'} - error al enviar respuesta`);
    }
  }

  @SubscribeMessage('nextQuestion')
  handleNextQuestion(@ConnectedSocket() client: Socket) {
    const gameState = this.gameService.getGameState();
    const player = this.gameService.getPlayer(client.id);
    
    if (gameState.phase !== 'results') {
      client.emit('error', 'No se puede avanzar en esta fase');
      return;
    }

    if (!player) {
      client.emit('error', 'No estás registrado en el juego');
      return;
    }

    // Marcar al jugador como listo
    const marked = this.gameService.markPlayerReadyForNext(client.id);
    
    if (!marked) {
      client.emit('error', 'No se pudo marcar como listo');
      return;
    }

    this.logger.log(`✅ ${player.name} ${player.isJoel ? '(Joel 👑)' : ''} listo para siguiente pregunta`);

    // Emitir actualización de jugadores listos
    this.server.emit('playersReadyUpdate', {
      playersReady: this.gameService.getPlayersReadyStatus(),
      totalPlayers: this.gameService.getAllPlayers().length,
      readyCount: this.gameService.getPlayersReadyStatus().length
    });

    // Verificar si todos están listos O si Joel puede forzar
    const canAdvance = this.gameService.areAllPlayersReadyForNext() || 
                      (player.isJoel && this.gameService.getGameState().config.allowJoelToSkipResults);

    if (canAdvance) {
      this.logger.log(
        this.gameService.areAllPlayersReadyForNext() 
          ? '✅ Todos listos - avanzando automáticamente' 
          : '👑 Joel forzando siguiente pregunta'
      );
      
      // Pequeño delay para feedback visual
      setTimeout(() => {
        this.processNextQuestion();
      }, 500);
    } else {
      this.logger.log(`⏳ Esperando más jugadores (${this.gameService.getPlayersReadyStatus().length}/${this.gameService.getAllPlayers().length})`);
    }
  }

  @SubscribeMessage('resetGame')
  handleResetGame(@ConnectedSocket() client: Socket) {
    const player = this.gameService.getPlayer(client.id);
    
    if (!player) {
      client.emit('error', 'No estás registrado en el juego');
      return;
    }

    // Parar cualquier timer activo
    this.stopQuestionTimer();
    
    this.gameService.resetGame();
    
    // Notificar a TODOS los clientes que el juego se reinició
    this.server.emit('gameReset');
    this.broadcastGameState();
    
    this.logger.log(`🔄 ${player.name} reinició el juego`);
  }

  // NUEVO: Método para debug y recuperación de estado
  @SubscribeMessage('requestGameState')
  handleRequestGameState(@ConnectedSocket() client: Socket) {
    const gameState = this.gameService.getGameState();
    const player = this.gameService.getPlayer(client.id);
    
    this.logger.log(`📱 ${player?.name || 'Cliente'} solicita estado del juego - Fase: ${gameState.phase}`);
    
    // Enviar estado actual
    client.emit('gameState', gameState);
    
    // Si está en results, enviar también los resultados
    if (gameState.phase === 'results') {
      const results = this.gameService.getQuestionResults();
      client.emit('questionResults', {
        results: results,
        gameState: gameState,
        showNextButton: this.gameService.canMoveToNextQuestion(),
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: gameState.totalQuestions
      });
      
      this.logger.log(`📊 Enviando resultados de recuperación para pregunta ${gameState.currentQuestion + 1}`);
    }
    
    // Si está jugando, enviar pregunta actual
    if (gameState.phase === 'playing') {
      const currentQuestion = this.gameService.getCurrentQuestion();
      client.emit('currentQuestion', {
        question: currentQuestion,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: gameState.totalQuestions,
        timeLeft: gameState.timeLeft
      });
    }
  }

  private broadcastGameState() {
    const gameState = this.gameService.getGameState();
    this.server.emit('gameState', gameState);
    
    // Debug log
    this.logger.log(`📡 Estado emitido - Fase: ${gameState.phase}, Pregunta: ${gameState.currentQuestion + 1}/${gameState.totalQuestions}`);
  }

  private startQuestionTimer() {
    this.stopQuestionTimer(); // Limpiar timer anterior
    
    this.logger.log(`⏰ Iniciando timer para pregunta ${this.gameService.getGameState().currentQuestion + 1}`);
    
    this.questionTimer = this.gameService.startQuestionTimer(
      // onTimeUp - cuando se acaba el tiempo
      () => {
        this.logger.log('⏰ Tiempo agotado - enviando resultados');
        this.handleQuestionComplete();
      },
      // onTick - cada segundo
      (timeLeft: number) => {
        this.server.emit('timerUpdate', { timeLeft });
      }
    );
  }
}