import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Player, GameState, QuestionResults, GameConfig } from '../common/interfaces/player.interface';
import { triviaQuestions } from '../data/questions';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  private gameState: GameState;
  private gameTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeGame();
  }

  private initializeGame(): void {
    this.gameState = {
      phase: 'lobby',
      players: new Map(),
      currentQuestion: 0,
      questionStartTime: null,
      timeLeft: 30,
      answers: new Map(),
      joelAnswers: new Map(),
      roomCode: this.generateRoomCode(),
      playersReadyForNext: new Set(),
      config: {
        timePerQuestion: 30,
        showResultsAfterEachQuestion: true,
        skipToNextWhenAllAnswered: false,
        allowJoelToSkipResults: true,
        maxWaitTimeForResults: 10
      }
    };
    this.logger.log(`🎮 Juego inicializado con código: ${this.gameState.roomCode}`);
  }

  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  getGameState() {
    return {
      phase: this.gameState.phase,
      players: Array.from(this.gameState.players.values()),
      currentQuestion: this.gameState.currentQuestion,
      timeLeft: this.gameState.timeLeft,
      totalQuestions: triviaQuestions.length,
      roomCode: this.gameState.roomCode,
      config: this.gameState.config,
      playersReadyCount: this.gameState.playersReadyForNext.size,
      totalPlayersCount: this.gameState.players.size
    };
  }

  joinGame(socketId: string, playerName: string, isJoel: boolean): Player | string {
    // Validaciones
    if (!playerName.trim()) {
      return 'Nombre requerido';
    }

    // Verificar si el jugador ya está conectado con otro socketId
    const existingPlayerWithName = Array.from(this.gameState.players.values())
      .find((p: Player) => p.name === playerName);
    
    if (existingPlayerWithName && existingPlayerWithName.socketId !== socketId) {
      // Remover la sesión anterior
      this.gameState.players.delete(existingPlayerWithName.socketId);
      this.logger.log(`🔄 ${playerName} reconectado - sesión anterior cerrada`);
    }

    // Verificar Joel único
    if (isJoel) {
      const existingJoel = Array.from(this.gameState.players.values())
        .find((p: Player) => p.isJoel && p.socketId !== socketId);
      if (existingJoel) {
        return 'Ya hay alguien jugando como Joel';
      }
    }

    // Crear o actualizar jugador
    const player: Player = {
      id: uuidv4(),
      name: playerName,
      isJoel: isJoel || false,
      connected: true,
      joinedAt: new Date().toISOString(),
      socketId: socketId,
    };

    this.gameState.players.set(socketId, player);
    this.logger.log(`🎮 ${playerName} se unió al juego ${isJoel ? '(ES JOEL 👑)' : '(NO es Joel)'} - SocketId: ${socketId}`);
    
    // Debug adicional
    this.logger.log(`👥 Jugadores actuales: ${Array.from(this.gameState.players.values()).map(p => `${p.name}(isJoel:${p.isJoel})`).join(', ')}`);
    
    return player;
  }

  removePlayer(socketId: string): void {
    const player = this.gameState.players.get(socketId);
    if (player) {
      this.logger.log(`👋 ${player.name} se desconectó`);
      this.gameState.players.delete(socketId);
    }
  }

  canStartGame(): boolean {
    return this.gameState.players.size >= 2;
  }
  
  updateGameConfig(config: Partial<GameConfig>): void {
    this.gameState.config = { ...this.gameState.config, ...config };
    this.logger.log(`⚙️ Configuración actualizada: ${JSON.stringify(this.gameState.config)}`);
  }

  startGame(config: Partial<GameConfig> = {}): boolean {
    if (!this.canStartGame()) {
      return false;
    }

    // Solo actualizar configuración si se proporciona
    if (Object.keys(config).length > 0) {
      this.updateGameConfig(config);
    }

    this.gameState.phase = 'playing';
    this.gameState.currentQuestion = 0;
    this.gameState.answers.clear();
    this.gameState.joelAnswers.clear();
    this.gameState.playersReadyForNext.clear();
    
    this.logger.log('🎮 Juego iniciado!');
    this.logger.log(`⚙️ Configuración: ${JSON.stringify(this.gameState.config)}`);
    return true;
  }

  getCurrentQuestion() {
    return triviaQuestions[this.gameState.currentQuestion];
  }

  startQuestionTimer(onTimeUp: () => void, onTick: (timeLeft: number) => void, onAllAnswered?: () => void): NodeJS.Timeout {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }

    this.gameState.timeLeft = this.gameState.config.timePerQuestion;
    this.gameState.questionStartTime = new Date();

    this.gameTimer = setInterval(() => {
      this.gameState.timeLeft--;
      
      if (this.gameState.timeLeft <= 0) {
        clearInterval(this.gameTimer!);
        this.gameState.phase = 'results';
        onTimeUp();
      } else {
        onTick(this.gameState.timeLeft);
      }
    }, 1000);

    return this.gameTimer;
  }

  submitAnswer(socketId: string, answer: string): boolean {
    const player = this.gameState.players.get(socketId);
    
    if (!player || this.gameState.phase !== 'playing') {
      this.logger.log(`❌ Submit answer falló - Player: ${!!player}, Phase: ${this.gameState.phase}`);
      return false;
    }

    const questionId = triviaQuestions[this.gameState.currentQuestion].id;
    
    if (!this.gameState.answers.has(questionId)) {
      this.gameState.answers.set(questionId, new Map());
    }
    
    this.gameState.answers.get(questionId)!.set(socketId, answer);

    // CORREGIDO: Si es Joel, guardar respuesta especial usando questionId correcto
    if (player.isJoel) {
      this.gameState.joelAnswers.set(questionId, answer);
      this.logger.log(`👑 JOEL respondió ${answer} para pregunta ${questionId} - Guardado en joelAnswers`);
    }

    this.logger.log(`📝 ${player.name} respondió: ${answer} (socketId: ${socketId}) - isJoel: ${player.isJoel}`);
    
    // Verificar inmediatamente si todos respondieron
    if (this.haveAllPlayersAnswered()) {
      this.logger.log('⚡ Todos los jugadores han respondido! Cambiando a fase de resultados.');
      this.gameState.phase = 'results';
    }
    
    return true;
  }

  getQuestionResults(): QuestionResults {
    const question = triviaQuestions[this.gameState.currentQuestion];
    const questionAnswers = this.gameState.answers.get(question.id) || new Map();
    const joelAnswer = this.gameState.joelAnswers.get(question.id);
    
    // CORREGIDO: La respuesta correcta SIEMPRE es la de Joel (si existe), sino usar la predefinida
    const correctAnswer = joelAnswer || question?.joelAnswer;

    const answersObject: Record<string, string> = {};
    questionAnswers.forEach((answer, socketId) => {
      answersObject[socketId] = answer;
    });

    this.logger.log(`📊 Resultados pregunta ${question.id}:`);
    this.logger.log(`- Respuestas guardadas: ${JSON.stringify(answersObject)}`);
    this.logger.log(`- Joel respondió: ${joelAnswer} (de joelAnswers Map)`);
    this.logger.log(`- Respuesta correcta final: ${correctAnswer}`);
    
    // Debug adicional para ver el estado de joelAnswers
    this.logger.log(`- Estado joelAnswers Map: ${JSON.stringify(Array.from(this.gameState.joelAnswers.entries()))}`);

    return {
      question,
      answers: answersObject,
      joelAnswer: joelAnswer || null,
      correctAnswer: correctAnswer || null,
    };
  }

  canMoveToNextQuestion(): boolean {
    return this.gameState.currentQuestion < triviaQuestions.length - 1;
  }

  nextQuestion(): boolean {
    if (!this.canMoveToNextQuestion()) {
      return false;
    }

    this.gameState.currentQuestion++;
    this.gameState.phase = 'playing';
    this.gameState.playersReadyForNext.clear(); // Limpiar jugadores listos
    this.logger.log(`➡️ Avanzando a pregunta ${this.gameState.currentQuestion + 1}`);
    return true;
  }

  finishGame() {
    this.gameState.phase = 'final';
    
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }

    return this.calculateFinalScores();
  }

  // CORREGIDO: calculateFinalScores para usar joelAnswer correctamente y NO incluir a Joel
  private calculateFinalScores(): Record<string, number> {
    const scores: Record<string, number> = {};
    
    this.gameState.players.forEach((player, socketId) => {
      if (player.isJoel) {
        this.logger.log(`👑 Joel (${player.name}) no compite por puntuación - es el moderador`);
        return; // Joel no compite
      }
      
      let score = 0;
      this.gameState.answers.forEach((questionAnswers, questionId) => {
        const question = triviaQuestions.find(q => q.id === questionId);
        const playerAnswer = questionAnswers.get(socketId);
        
        // CORREGIDO: Usar joelAnswers primero, luego question.joelAnswer
        const correctAnswer = this.gameState.joelAnswers.get(questionId) || question?.joelAnswer;
        
        if (playerAnswer === correctAnswer) {
          score++;
        }
        
        this.logger.log(`🔍 Jugador ${player.name} (${socketId}) - Pregunta ${questionId}: ${playerAnswer} vs ${correctAnswer} = ${playerAnswer === correctAnswer ? 'CORRECTO' : 'INCORRECTO'}`);
      });
      
      scores[socketId] = score;
      this.logger.log(`📊 Puntuación final ${player.name}: ${score}/${triviaQuestions.length}`);
    });
    
    return scores;
  }

  private haveAllPlayersAnswered(): boolean {
    const questionId = triviaQuestions[this.gameState.currentQuestion].id;
    const questionAnswers = this.gameState.answers.get(questionId);
    
    if (!questionAnswers) {
      this.logger.log(`📊 No hay respuestas para pregunta ${questionId}`);
      return false;
    }
    
    const totalPlayers = this.gameState.players.size;
    const answeredPlayers = questionAnswers.size;
    
    this.logger.log(`📊 Progreso respuestas pregunta ${questionId}: ${answeredPlayers}/${totalPlayers}`);
    
    // Log de quién ha respondido
    const answeredPlayerNames: string[] = [];
    questionAnswers.forEach((answer, socketId) => {
      const player = this.gameState.players.get(socketId);
      if (player) {
        answeredPlayerNames.push(`${player.name}(${answer})`);
      }
    });
    this.logger.log(`📋 Han respondido: ${answeredPlayerNames.join(', ')}`);
    
    return answeredPlayers === totalPlayers;
  }

  resetGame(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    
    // NO limpiar jugadores, solo resetear el estado del juego
    const currentPlayers = this.gameState.players;
    const currentRoomCode = this.gameState.roomCode;
    
    this.gameState = {
      phase: 'lobby',
      players: currentPlayers, // Mantener jugadores conectados
      currentQuestion: 0,
      questionStartTime: null,
      timeLeft: 30,
      answers: new Map(),
      joelAnswers: new Map(),
      roomCode: currentRoomCode, // Mantener mismo código de sala
      playersReadyForNext: new Set(), // Limpiar jugadores listos
      config: {
        timePerQuestion: 30,
        showResultsAfterEachQuestion: true,
        skipToNextWhenAllAnswered: false,
        allowJoelToSkipResults: true,
        maxWaitTimeForResults: 10
      }
    };
    
    this.logger.log(`🔄 Juego reiniciado - ${currentPlayers.size} jugadores permanecen conectados`);
  }

  getPlayer(socketId: string): Player | undefined {
    return this.gameState.players.get(socketId);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.gameState.players.values());
  }

  // CORREGIDO: markPlayerReadyForNext para manejar Joel correctamente
  markPlayerReadyForNext(socketId: string): boolean {
    const player = this.gameState.players.get(socketId);
    if (!player || this.gameState.phase !== 'results') {
      return false;
    }

    // Si ya está marcado como listo
    if (this.gameState.playersReadyForNext.has(socketId)) {
      if (player.isJoel) {
        this.logger.log(`👑 Joel (${player.name}) puede forzar siguiente pregunta - ya estaba listo`);
        return true; // Permitir que Joel "fuerce" incluso si ya está listo
      } else {
        this.logger.log(`⚠️ ${player.name} ya estaba marcado como listo`);
        return false; // Otros jugadores no pueden hacer clic múltiple
      }
    }

    // Si no está marcado, agregarlo
    this.gameState.playersReadyForNext.add(socketId);
    this.logger.log(`✅ ${player.name} ${player.isJoel ? '(Joel 👑)' : ''} listo para siguiente pregunta (${this.gameState.playersReadyForNext.size}/${this.gameState.players.size})`);
    
    return true;
  }

  // CORREGIDO: areAllPlayersReadyForNext para incluir a Joel en el total
  public areAllPlayersReadyForNext(): boolean {
    const totalPlayers = this.gameState.players.size; // INCLUIR a Joel en el total
    const readyPlayers = this.gameState.playersReadyForNext.size;
    
    this.logger.log(`🔄 Jugadores listos para siguiente: ${readyPlayers}/${totalPlayers} (Joel INCLUIDO en total)`);
    return readyPlayers === totalPlayers;
  }

  getPlayersReadyStatus(): string[] {
    return Array.from(this.gameState.playersReadyForNext);
  }

  resetPlayersReadyStatus(): void {
    this.gameState.playersReadyForNext.clear();
    this.logger.log('🔄 Estado de jugadores listos reiniciado');
  }

  // Método de debug para verificar estado
  debugGameState(): void {
    this.logger.log('🔍 DEBUG - Estado actual del juego:');
    this.logger.log(`- Fase: ${this.gameState.phase}`);
    this.logger.log(`- Pregunta actual: ${this.gameState.currentQuestion}`);
    this.logger.log(`- Jugadores: ${Array.from(this.gameState.players.values()).map(p => `${p.name}(Joel:${p.isJoel}, Socket:${p.socketId})`).join(', ')}`);
    this.logger.log(`- Respuestas Joel: ${JSON.stringify(Array.from(this.gameState.joelAnswers.entries()))}`);
    this.logger.log(`- Todas las respuestas: ${JSON.stringify(Array.from(this.gameState.answers.entries()))}`);
    this.logger.log(`- Jugadores listos: ${Array.from(this.gameState.playersReadyForNext)}`);
  }
}