export interface GameSettings {
  mode: 'ai' | 'local' | 'quick' | 'network' | 'tournament' | 'tutorial';
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  allowSquareWin: boolean;
}
