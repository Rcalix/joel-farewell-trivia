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
        skipToNextWhenAllAnswered: true, // CAMBIADO: habilitar auto-avance
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

    // Verificar longitud del nombre
    if (playerName.length > 20) {
      return 'Nombre muy largo (máximo 20 caracteres)';
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

    // NUEVO: Verificar si se puede unir al juego en curso
    if (this.gameState.phase === 'playing' || this.gameState.phase === 'results') {
      this.logger.log(`⚠️ ${playerName} intentó unirse durante el juego (fase: ${this.gameState.phase})`);
      return 'No se puede unir al juego en curso';
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
      
      // NUEVO: Limpiar de jugadores listos si estaba ahí
      this.gameState.playersReadyForNext.delete(socketId);
    }
  }

  canStartGame(): boolean {
    const minPlayers = 2;
    const currentPlayers = this.gameState.players.size;
    
    if (currentPlayers < minPlayers) {
      this.logger.log(`❌ Faltan jugadores para empezar: ${currentPlayers}/${minPlayers}`);
      return false;
    }
    
    // NUEVO: Verificar que haya al least un Joel
    const hasJoel = Array.from(this.gameState.players.values()).some(p => p.isJoel);
    if (!hasJoel) {
      this.logger.log(`❌ No hay ningún Joel en el juego`);
      return false;
    }
    
    return true;
  }
  
  updateGameConfig(config: Partial<GameConfig>): void {
    this.gameState.config = { ...this.gameState.config, ...config };
    this.logger.log(`⚙️ Configuración actualizada: ${JSON.stringify(this.gameState.config)}`);
  }

  startGame(config: Partial<GameConfig> = {}): boolean {
    if (!this.canStartGame()) {
      this.logger.log(`❌ No se puede iniciar el juego`);
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
    this.gameState.timeLeft = this.gameState.config.timePerQuestion;
    
    this.logger.log('🎮 Juego iniciado!');
    this.logger.log(`⚙️ Configuración: ${JSON.stringify(this.gameState.config)}`);
    this.logger.log(`👥 Jugadores participando: ${Array.from(this.gameState.players.values()).map(p => `${p.name}${p.isJoel ? '👑' : ''}`).join(', ')}`);
    
    return true;
  }

  getCurrentQuestion() {
    if (this.gameState.currentQuestion >= triviaQuestions.length) {
      this.logger.warn(`⚠️ Índice de pregunta fuera de rango: ${this.gameState.currentQuestion}`);
      return null;
    }
    
    const question = triviaQuestions[this.gameState.currentQuestion];
    this.logger.log(`❓ Pregunta actual: ${this.gameState.currentQuestion + 1}/${triviaQuestions.length} - ID: ${question.id}`);
    
    return question;
  }

  // MEJORADO: startQuestionTimer con mejor manejo de callbacks
  startQuestionTimer(onTimeUp: () => void, onTick: (timeLeft: number) => void): NodeJS.Timeout {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.gameState.timeLeft = this.gameState.config.timePerQuestion;
    this.gameState.questionStartTime = new Date();

    this.logger.log(`⏰ Timer iniciado: ${this.gameState.timeLeft}s para pregunta ${this.gameState.currentQuestion + 1}`);

    this.gameTimer = setInterval(() => {
      this.gameState.timeLeft--;
      
      // Emitir tick cada segundo
      onTick(this.gameState.timeLeft);
      
      if (this.gameState.timeLeft <= 0) {
        clearInterval(this.gameTimer!);
        this.gameTimer = null;
        
        // CRUCIAL: Cambiar a results ANTES de llamar callback
        this.gameState.phase = 'results';
        this.logger.log(`⏰ Tiempo agotado para pregunta ${this.gameState.currentQuestion + 1} - cambiando a resultados`);
        
        // Llamar callback después de cambiar fase
        onTimeUp();
      }
    }, 1000);

    return this.gameTimer;
  }

  // MEJORADO: submitAnswer con mejor lógica de auto-avance
  submitAnswer(socketId: string, answer: string): boolean {
    const player = this.gameState.players.get(socketId);
    
    if (!player) {
      this.logger.log(`❌ Submit answer falló - Player no encontrado: ${socketId}`);
      return false;
    }
    
    if (this.gameState.phase !== 'playing') {
      this.logger.log(`❌ Submit answer falló - Fase incorrecta: ${this.gameState.phase} (se esperaba 'playing')`);
      return false;
    }

    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      this.logger.log(`❌ Submit answer falló - No hay pregunta actual`);
      return false;
    }

    const questionId = currentQuestion.id;
    
    // Verificar si ya respondió
    if (this.gameState.answers.has(questionId) && 
        this.gameState.answers.get(questionId)!.has(socketId)) {
      this.logger.log(`⚠️ ${player.name} intentó responder múltiples veces la pregunta ${questionId}`);
      return false;
    }
    
    // Inicializar Map si no existe
    if (!this.gameState.answers.has(questionId)) {
      this.gameState.answers.set(questionId, new Map());
    }
    
    // Guardar respuesta
    this.gameState.answers.get(questionId)!.set(socketId, answer);

    // Si es Joel, guardar respuesta especial
    if (player.isJoel) {
      this.gameState.joelAnswers.set(questionId, answer);
      this.logger.log(`👑 JOEL respondió "${answer}" para pregunta ${questionId} - Guardado en joelAnswers`);
    }

    this.logger.log(`📝 ${player.name} respondió: "${answer}" (pregunta ${questionId}) - isJoel: ${player.isJoel}`);
    
    // CRUCIAL: Verificar si todos respondieron y hacer auto-avance
    if (this.haveAllPlayersAnswered()) {
      this.logger.log('⚡ Todos los jugadores han respondido!');
      
      // Detener timer si está corriendo
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
        this.gameTimer = null;
        this.logger.log('⏰ Timer detenido - todos respondieron');
      }
      
      // Cambiar a fase de resultados
      this.gameState.phase = 'results';
      this.logger.log(`📊 Cambiando a fase 'results' para pregunta ${questionId}`);
    }
    
    return true;
  }

  // MEJORADO: getQuestionResults con mejor manejo de errores
getQuestionResults(): QuestionResults | null {
    const currentQuestion = this.getCurrentQuestion();
    
    if (!currentQuestion) {
      this.logger.error(`❌ Error: No hay pregunta actual para obtener resultados`);
      return null;
    }

    const questionId = currentQuestion.id;
    const questionAnswers = this.gameState.answers.get(questionId) || new Map();
    const joelAnswer = this.gameState.joelAnswers.get(questionId);
    
    // La respuesta correcta es la de Joel (si existe), sino usar la predefinida
    const correctAnswer = joelAnswer || currentQuestion?.joelAnswer;

    // Convertir Map a Object para el frontend
    const answersObject: Record<string, string> = {};
    questionAnswers.forEach((answer, socketId) => {
      answersObject[socketId] = answer;
    });

    // Logs detallados para debug
    this.logger.log(`📊 === RESULTADOS PREGUNTA ${questionId} ===`);
    this.logger.log(`- Pregunta: "${currentQuestion.question}"`);
    this.logger.log(`- Respuestas recibidas: ${JSON.stringify(answersObject)}`);
    this.logger.log(`- Joel respondió: "${joelAnswer}" (${joelAnswer ? 'SÍ' : 'NO'} guardado en joelAnswers)`);
    this.logger.log(`- Respuesta correcta final: "${correctAnswer}"`);
    this.logger.log(`- Total respuestas: ${questionAnswers.size}/${this.gameState.players.size}`);
    
    // NUEVO: Log de puntuaciones para esta pregunta
    const playerNames: string[] = [];
    questionAnswers.forEach((answer, socketId) => {
      const player = this.gameState.players.get(socketId);
      const isCorrect = answer === correctAnswer;
      if (player) {
        playerNames.push(`${player.name}(${answer})${isCorrect ? '✅' : '❌'}`);
      }
    });
    this.logger.log(`- Resultados por jugador: ${playerNames.join(', ')}`);

    return {
      question: currentQuestion,
      answers: answersObject,
      joelAnswer: joelAnswer || null,
      correctAnswer: correctAnswer || null,
    };
  }

  canMoveToNextQuestion(): boolean {
    const canMove = this.gameState.currentQuestion < triviaQuestions.length - 1;
    this.logger.log(`🔄 ¿Puede avanzar? ${canMove} (actual: ${this.gameState.currentQuestion + 1}/${triviaQuestions.length})`);
    return canMove;
  }

  nextQuestion(): boolean {
    if (!this.canMoveToNextQuestion()) {
      this.logger.log(`❌ No se puede avanzar más allá de la pregunta ${this.gameState.currentQuestion + 1}`);
      return false;
    }

    // Avanzar pregunta
    this.gameState.currentQuestion++;
    this.gameState.phase = 'playing';
    this.gameState.playersReadyForNext.clear();
    this.gameState.timeLeft = this.gameState.config.timePerQuestion;
    
    this.logger.log(`➡️ Avanzando a pregunta ${this.gameState.currentQuestion + 1}/${triviaQuestions.length}`);
    
    return true;
  }

  finishGame() {
    this.gameState.phase = 'final';
    
    // Limpiar timer si existe
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.logger.log('🏁 Juego terminado - calculando puntuaciones finales');
    
    const finalScores = this.calculateFinalScores();
    
    // Log del ranking final
    const ranking = Object.entries(finalScores)
      .map(([socketId, score]) => {
        const player = this.gameState.players.get(socketId);
        return { name: player?.name || 'Desconocido', score };
      })
      .sort((a, b) => b.score - a.score);
    
    this.logger.log('🏆 RANKING FINAL:');
    ranking.forEach((player, index) => {
      this.logger.log(`${index + 1}. ${player.name}: ${player.score}/${triviaQuestions.length}`);
    });

    return finalScores;
  }

  // MEJORADO: calculateFinalScores con logs más detallados
  private calculateFinalScores(): Record<string, number> {
    const scores: Record<string, number> = {};
    
    this.logger.log('🧮 === CALCULANDO PUNTUACIONES FINALES ===');
    
    this.gameState.players.forEach((player, socketId) => {
      if (player.isJoel) {
        this.logger.log(`👑 Joel (${player.name}) no compite por puntuación - es el moderador`);
        return; // Joel no compite
      }
      
      let score = 0;
      let answeredQuestions = 0;
      
      this.gameState.answers.forEach((questionAnswers, questionId) => {
        const question = triviaQuestions.find(q => q.id === questionId);
        const playerAnswer = questionAnswers.get(socketId);
        
        if (playerAnswer !== undefined) {
          answeredQuestions++;
          
          // Usar joelAnswers primero, luego question.joelAnswer
          const correctAnswer = this.gameState.joelAnswers.get(questionId) || question?.joelAnswer;
          
          const isCorrect = playerAnswer === correctAnswer;
          if (isCorrect) {
            score++;
          }
          
          this.logger.log(`   Pregunta ${questionId}: "${playerAnswer}" vs "${correctAnswer}" = ${isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO'}`);
        }
      });
      
      scores[socketId] = score;
      this.logger.log(`📊 ${player.name}: ${score}/${answeredQuestions} respuestas correctas`);
    });
    
    return scores;
  }

  // MEJORADO: haveAllPlayersAnswered con mejor logging
  private haveAllPlayersAnswered(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    
    if (!currentQuestion) {
      this.logger.log(`❌ No hay pregunta actual para verificar respuestas`);
      return false;
    }

    const questionId = currentQuestion.id;
    const questionAnswers = this.gameState.answers.get(questionId);
    
    if (!questionAnswers) {
      this.logger.log(`📊 No hay respuestas para pregunta ${questionId}`);
      return false;
    }
    
    const totalPlayers = this.gameState.players.size;
    const answeredPlayers = questionAnswers.size;
    
    this.logger.log(`📊 Progreso pregunta ${questionId}: ${answeredPlayers}/${totalPlayers} jugadores han respondido`);
    
    // Log detallado de quién ha respondido
    const answeredPlayerNames: string[] = [];
    const pendingPlayerNames: string[] = [];
    
    this.gameState.players.forEach((player, socketId) => {
      if (questionAnswers.has(socketId)) {
        const answer = questionAnswers.get(socketId);
        answeredPlayerNames.push(`${player.name}("${answer}")`);
      } else {
        pendingPlayerNames.push(player.name);
      }
    });
    
    this.logger.log(`✅ Han respondido: ${answeredPlayerNames.join(', ')}`);
    if (pendingPlayerNames.length > 0) {
      this.logger.log(`⏳ Faltan: ${pendingPlayerNames.join(', ')}`);
    }
    
    const allAnswered = answeredPlayers === totalPlayers;
    if (allAnswered) {
      this.logger.log(`🎉 ¡Todos han respondido la pregunta ${questionId}!`);
    }
    
    return allAnswered;
  }

  resetGame(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    // Mantener jugadores conectados pero resetear estado del juego
    const currentPlayers = this.gameState.players;
    const currentRoomCode = this.gameState.roomCode;
    
    this.gameState = {
      phase: 'lobby',
      players: currentPlayers,
      currentQuestion: 0,
      questionStartTime: null,
      timeLeft: 30,
      answers: new Map(),
      joelAnswers: new Map(),
      roomCode: currentRoomCode,
      playersReadyForNext: new Set(),
      config: {
        timePerQuestion: 30,
        showResultsAfterEachQuestion: true,
        skipToNextWhenAllAnswered: true,
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

  // MEJORADO: markPlayerReadyForNext con mejor lógica
  markPlayerReadyForNext(socketId: string): boolean {
    const player = this.gameState.players.get(socketId);
    
    if (!player) {
      this.logger.log(`❌ markPlayerReadyForNext falló - Player no encontrado: ${socketId}`);
      return false;
    }
    
    if (this.gameState.phase !== 'results') {
      this.logger.log(`❌ markPlayerReadyForNext falló - Fase incorrecta: ${this.gameState.phase} (se esperaba 'results')`);
      return false;
    }

    // Si ya está marcado como listo
    if (this.gameState.playersReadyForNext.has(socketId)) {
      if (player.isJoel && this.gameState.config.allowJoelToSkipResults) {
        this.logger.log(`👑 Joel (${player.name}) puede forzar siguiente pregunta - ya estaba listo`);
        return true; // Joel puede "forzar" múltiples veces
      } else {
        this.logger.log(`⚠️ ${player.name} ya estaba marcado como listo`);
        return false;
      }
    }

    // Marcar como listo
    this.gameState.playersReadyForNext.add(socketId);
    
    const readyCount = this.gameState.playersReadyForNext.size;
    const totalCount = this.gameState.players.size;
    
    this.logger.log(`✅ ${player.name} ${player.isJoel ? '(Joel 👑)' : ''} listo para siguiente pregunta (${readyCount}/${totalCount})`);
    
    return true;
  }

  // MEJORADO: areAllPlayersReadyForNext con logging detallado
  public areAllPlayersReadyForNext(): boolean {
    const totalPlayers = this.gameState.players.size;
    const readyPlayers = this.gameState.playersReadyForNext.size;
    
    // Obtener nombres de jugadores listos y pendientes
    const readyPlayerNames: string[] = [];
    const pendingPlayerNames: string[] = [];
    
    this.gameState.players.forEach((player, socketId) => {
      if (this.gameState.playersReadyForNext.has(socketId)) {
        readyPlayerNames.push(`${player.name}${player.isJoel ? '👑' : ''}`);
      } else {
        pendingPlayerNames.push(`${player.name}${player.isJoel ? '👑' : ''}`);
      }
    });
    
    this.logger.log(`🔄 Jugadores listos: ${readyPlayers}/${totalPlayers}`);
    this.logger.log(`✅ Listos: ${readyPlayerNames.join(', ')}`);
    if (pendingPlayerNames.length > 0) {
      this.logger.log(`⏳ Pendientes: ${pendingPlayerNames.join(', ')}`);
    }
    
    const allReady = readyPlayers === totalPlayers;
    if (allReady) {
      this.logger.log(`🎉 ¡Todos los jugadores están listos para continuar!`);
    }
    
    return allReady;
  }

  getPlayersReadyStatus(): string[] {
    return Array.from(this.gameState.playersReadyForNext);
  }

  resetPlayersReadyStatus(): void {
    const previousCount = this.gameState.playersReadyForNext.size;
    this.gameState.playersReadyForNext.clear();
    this.logger.log(`🔄 Estado de jugadores listos reiniciado (${previousCount} → 0)`);
  }

  // MEJORADO: debugGameState con información más completa
  debugGameState(): void {
    this.logger.log('🔍 =============== DEBUG ESTADO DEL JUEGO ===============');
    this.logger.log(`📊 Fase actual: ${this.gameState.phase}`);
    this.logger.log(`❓ Pregunta: ${this.gameState.currentQuestion + 1}/${triviaQuestions.length}`);
    this.logger.log(`⏰ Tiempo restante: ${this.gameState.timeLeft}s`);
    this.logger.log(`🏠 Código de sala: ${this.gameState.roomCode}`);
    
    this.logger.log(`👥 Jugadores (${this.gameState.players.size}):`);
    this.gameState.players.forEach((player, socketId) => {
      this.logger.log(`   - ${player.name} ${player.isJoel ? '👑' : ''} (Socket: ${socketId})`);
    });
    
    this.logger.log(`💬 Respuestas de Joel: ${JSON.stringify(Array.from(this.gameState.joelAnswers.entries()))}`);
    
    this.logger.log(`📝 Todas las respuestas:`);
    this.gameState.answers.forEach((questionAnswers, questionId) => {
      const answersArray: string[] = [];
      questionAnswers.forEach((answer, socketId) => {
        const player = this.gameState.players.get(socketId);
        answersArray.push(`${player?.name || 'Unknown'}:"${answer}"`);
      });
      this.logger.log(`   Pregunta ${questionId}: ${answersArray.join(', ')}`);
    });
    
    this.logger.log(`✅ Jugadores listos (${this.gameState.playersReadyForNext.size}): ${Array.from(this.gameState.playersReadyForNext).map(socketId => {
      const player = this.gameState.players.get(socketId);
      return player?.name || 'Unknown';
    }).join(', ')}`);
    
    this.logger.log(`⚙️ Configuración: ${JSON.stringify(this.gameState.config, null, 2)}`);
    this.logger.log('🔍 ================================================');
  }
}