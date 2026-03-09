import type { Piece } from '../types';
import type { GameSettings } from '../types/game';
import type { Board, WinningPattern } from './gameLogic';

export type Phase = 'selectPiece' | 'placePiece' | 'gameOver';
export type PlayerId = 1 | 2;
export type TutorialStep = 'pickPieceForAi' | 'placeWinningPiece' | 'finished';
export type ReserveSortKey = 'default' | 'color' | 'size' | 'shape' | 'top';
export type ReserveFilterKey = 'all' | 'light' | 'dark' | 'small' | 'large' | 'round' | 'square' | 'hollow' | 'solid';
export type ReserveFilters = {
  color: 'all' | 'light' | 'dark';
  size: 'all' | 'small' | 'large';
  shape: 'all' | 'round' | 'square';
  top: 'all' | 'hollow' | 'solid';
};

export interface GameSessionSnapshot {
  version: 2;
  gameSettings: GameSettings;
  startedAt: number | null;
  turnStartedAt: number | null;
  finishedAt: number | null;
  pausedAt: number | null;
  board: Board;
  availablePieces: Piece[];
  phase: Phase;
  turnPlayer: PlayerId;
  activePiece: Piece | null;
  winner: PlayerId | null;
  winningPattern: WinningPattern | null;
  moveLog: string[];
  tutorialStep: TutorialStep | null;
  isWinnerOverlayVisible: boolean;
  isIdlePromptVisible: boolean;
  reserveSort: ReserveSortKey;
  reserveFilters: ReserveFilters;
  showUsedPieces: boolean;
}

export const GAME_SESSION_STORAGE_KEY = 'quarto-active-game-session-v1';

export const loadStoredGameSession = (): GameSessionSnapshot | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(GAME_SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Record<string, unknown>;
    if (
      (parsed.version !== 1 && parsed.version !== 2) ||
      !parsed.gameSettings ||
      !Array.isArray(parsed.board) ||
      !Array.isArray(parsed.availablePieces) ||
      !parsed.phase ||
      !parsed.turnPlayer ||
      !Array.isArray(parsed.moveLog)
    ) {
      return null;
    }

    const reserveFilters = (() => {
      if (parsed.version === 2 && parsed.reserveFilters && typeof parsed.reserveFilters === 'object') {
        const raw = parsed.reserveFilters as Partial<ReserveFilters>;
        return {
          color: raw.color === 'light' || raw.color === 'dark' ? raw.color : 'all',
          size: raw.size === 'small' || raw.size === 'large' ? raw.size : 'all',
          shape: raw.shape === 'round' || raw.shape === 'square' ? raw.shape : 'all',
          top: raw.top === 'hollow' || raw.top === 'solid' ? raw.top : 'all',
        } satisfies ReserveFilters;
      }

      const legacy = parsed.reserveFilter as ReserveFilterKey | undefined;
      return {
        color: legacy === 'light' || legacy === 'dark' ? legacy : 'all',
        size: legacy === 'small' || legacy === 'large' ? legacy : 'all',
        shape: legacy === 'round' || legacy === 'square' ? legacy : 'all',
        top: legacy === 'hollow' || legacy === 'solid' ? legacy : 'all',
      } satisfies ReserveFilters;
    })();

    return {
      ...(parsed as Omit<GameSessionSnapshot, 'version' | 'reserveFilters'>),
      version: 2,
      reserveFilters,
    };
  } catch {
    return null;
  }
};

export const saveStoredGameSession = (snapshot: GameSessionSnapshot) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(GAME_SESSION_STORAGE_KEY, JSON.stringify(snapshot));
};

export const clearStoredGameSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
};
