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

  private stopQuestionTimer() {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }

  private processNextQuestion() {
    if (this.gameService.canMoveToNextQuestion()) {
      this.gameService.nextQuestion();
      this.server.emit('currentQuestion', this.gameService.getCurrentQuestion());
      this.broadcastGameState();
      this.startQuestionTimer();
    } else {
      // Juego terminado
      const finalScores = this.gameService.finishGame();
      
      this.server.emit('gameFinished', {
        scores: finalScores,
        players: this.gameService.getAllPlayers(),
      });
      
      this.broadcastGameState();
    }
  }

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    this.logger.log(`👤 Cliente conectado: ${client.id}`);
    
    // Enviar estado actual al nuevo cliente
    client.emit('gameState', this.gameService.getGameState());

    // Si hay una pregunta activa, enviarla
    const gameState = this.gameService.getGameState();
    if (gameState.phase === 'playing') {
      client.emit('currentQuestion', this.gameService.getCurrentQuestion());
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

    // Iniciar juego con configuración personalizada (o vacía)
    if (this.gameService.startGame(config)) {
      this.server.emit('gameStarted');
      this.server.emit('currentQuestion', this.gameService.getCurrentQuestion());
      this.broadcastGameState();
      this.startQuestionTimer();
    }
  }

  @SubscribeMessage('submitAnswer')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleSubmitAnswer(
    @MessageBody() submitAnswerDto: SubmitAnswerDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { answer } = submitAnswerDto;
    
    if (this.gameService.submitAnswer(client.id, answer)) {
      client.emit('answerSubmitted', { answer });
      
      // Verificar si todos respondieron después de enviar la respuesta
      const gameState = this.gameService.getGameState();
      if (gameState.phase === 'results') {
        // Detener timer si todos respondieron
        this.stopQuestionTimer();
        
        // Emitir resultados inmediatamente
        const results = this.gameService.getQuestionResults();
        this.server.emit('questionResults', results);
        this.broadcastGameState();
      }
    }
  }

  // MÉTODO ACTUALIZADO: nextQuestion ahora maneja automáticamente el estado "ready"
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

    // Marcar al jugador como listo automáticamente
    if (!this.gameService.markPlayerReadyForNext(client.id)) {
      client.emit('error', 'No se pudo marcar como listo');
      return;
    }

    // Emitir estado actualizado a todos
    this.server.emit('playerReadyUpdate', {
      playersReady: this.gameService.getPlayersReadyStatus()
    });

    this.logger.log(`🔄 ${player.name} marcado como listo. Total listos: ${this.gameService.getPlayersReadyStatus().length}`);

    // Verificar si todos están listos O si es Joel que puede forzar
    if (this.gameService.areAllPlayersReadyForNext()) {
      this.logger.log('✅ Todos los jugadores están listos - avanzando automáticamente');
      // Pequeño delay para dar feedback visual
      setTimeout(() => {
        this.processNextQuestion();
      }, 500);
    } else if (player.isJoel && this.gameService.getPlayersReadyStatus().includes(client.id)) {
      // Joel puede forzar si ya está marcado como listo
      this.logger.log('👑 Joel está forzando siguiente pregunta');
      setTimeout(() => {
        this.processNextQuestion();
      }, 500);
    } else {
      // Solo marcar como listo, esperar otros jugadores
      this.logger.log(`⏳ ${player.name} marcado como listo, esperando otros jugadores`);
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

  private broadcastGameState() {
    this.server.emit('gameState', this.gameService.getGameState());
  }

  private startQuestionTimer() {
    this.stopQuestionTimer(); // Limpiar timer anterior
    
    this.questionTimer = this.gameService.startQuestionTimer(
      // onTimeUp
      () => {
        const results = this.gameService.getQuestionResults();
        this.server.emit('questionResults', results);
        this.broadcastGameState();
        this.questionTimer = null;
      },
      // onTick
      (timeLeft: number) => {
        this.server.emit('timerUpdate', timeLeft);
      },
      // onAllAnswered
      () => {
        const results = this.gameService.getQuestionResults();
        this.server.emit('questionResults', results);
        this.broadcastGameState();
        this.questionTimer = null;
      }
    );
  }
}