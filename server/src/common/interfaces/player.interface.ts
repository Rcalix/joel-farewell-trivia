export interface Player {
  id: string;
  name: string;
  isJoel: boolean;
  connected: boolean;
  joinedAt: string;
  socketId: string;
}

export interface GameConfig {
  timePerQuestion: number;
  showResultsAfterEachQuestion: boolean;
  skipToNextWhenAllAnswered: boolean;
  allowJoelToSkipResults: boolean;
  maxWaitTimeForResults: number;
}

export interface GameState {
  phase: 'lobby' | 'playing' | 'results' | 'final';
  players: Map<string, Player>;
  currentQuestion: number;
  questionStartTime: Date | null;
  timeLeft: number;
  answers: Map<number, Map<string, string>>;
  joelAnswers: Map<number, string>;
  roomCode: string;
  config: GameConfig;
  playersReadyForNext: Set<string>; 
}

export interface QuestionResults {
  question: any;
  answers: Record<string, string>;
  joelAnswer: string | null;
  correctAnswer: string | null;
}