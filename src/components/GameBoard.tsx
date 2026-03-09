import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './GameBoard.css';
import { PieceComponent } from './PieceComponent';
import type { Piece } from '../types';
import type { GameSettings } from '../types/game';
import {
  checkWinner,
  createEmptyBoard,
  createPieces,
  getEmptyPositions,
  isBoardFull,
  getWinningPattern,
  getSharedAttributes,
  pieceLabel,
  placePiece,
  type Board,
  type Position,
  type WinningPattern,
} from '../utils/gameLogic';
import {
  clearStoredGameSession,
  loadStoredGameSession,
  saveStoredGameSession,
  type GameSessionSnapshot,
  type Phase,
  type PlayerId,
  type ReserveFilters,
  type ReserveSortKey,
  type TutorialStep,
} from '../utils/gameSession';

interface GameBoardProps {
  gameSettings: GameSettings | null;
  onBackToMenu: () => void;
  onSessionPresenceChange: (present: boolean) => void;
  onUpdateGameSettings: (settings: GameSettings) => void;
  onStartGame: (settings: GameSettings) => void;
}
const RESERVE_VISIBILITY_STORAGE_KEY = 'quarto-reserve-visibility-v1';
const GAME_RESULTS_STORAGE_KEY = 'quarto-game-results-v1';
const PLAYER_PROFILE_STORAGE_KEY = 'quarto-player-profile-v1';
const AI_LEARNING_STORAGE_KEY = 'quarto-ai-learning-v1';
const getAiThinkDelayMs = () => 2000 + Math.floor(Math.random() * 2001);
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
const QUICK_TURN_LIMIT_MS = 15_000;
const MOBILE_SIDEBAR_BREAKPOINT = 1024;

type GameResultEntry = {
  id: number;
  summary: string;
  meta: string;
  rules: string;
  badges: string[];
};

type PlayerProfile = {
  name: string;
  avatarBase64: string | null;
  pieceSet: 'classic' | 'modern';
};

type AttributeCounters = {
  color: Record<'light' | 'dark', number>;
  size: Record<'small' | 'large', number>;
  shape: Record<'round' | 'square', number>;
  top: Record<'hollow' | 'solid', number>;
};

type AiLearningProfile = {
  gamesSeen: number;
  handoffPreferences: AttributeCounters;
  playerWinPatterns: AttributeCounters;
  playerPlacements: number[][];
};

const createEmptyAttributeCounters = (): AttributeCounters => ({
  color: { light: 0, dark: 0 },
  size: { small: 0, large: 0 },
  shape: { round: 0, square: 0 },
  top: { hollow: 0, solid: 0 },
});

const createEmptyAiLearningProfile = (): AiLearningProfile => ({
  gamesSeen: 0,
  handoffPreferences: createEmptyAttributeCounters(),
  playerWinPatterns: createEmptyAttributeCounters(),
  playerPlacements: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0)),
});

const loadStoredAiLearningProfile = (): AiLearningProfile => {
  if (typeof window === 'undefined') {
    return createEmptyAiLearningProfile();
  }

  try {
    const rawValue = window.localStorage.getItem(AI_LEARNING_STORAGE_KEY);
    if (!rawValue) {
      return createEmptyAiLearningProfile();
    }

    const parsed = JSON.parse(rawValue) as Partial<AiLearningProfile>;
    return {
      gamesSeen: typeof parsed.gamesSeen === 'number' ? parsed.gamesSeen : 0,
      handoffPreferences: {
        color: {
          light: parsed.handoffPreferences?.color?.light ?? 0,
          dark: parsed.handoffPreferences?.color?.dark ?? 0,
        },
        size: {
          small: parsed.handoffPreferences?.size?.small ?? 0,
          large: parsed.handoffPreferences?.size?.large ?? 0,
        },
        shape: {
          round: parsed.handoffPreferences?.shape?.round ?? 0,
          square: parsed.handoffPreferences?.shape?.square ?? 0,
        },
        top: {
          hollow: parsed.handoffPreferences?.top?.hollow ?? 0,
          solid: parsed.handoffPreferences?.top?.solid ?? 0,
        },
      },
      playerWinPatterns: {
        color: {
          light: parsed.playerWinPatterns?.color?.light ?? 0,
          dark: parsed.playerWinPatterns?.color?.dark ?? 0,
        },
        size: {
          small: parsed.playerWinPatterns?.size?.small ?? 0,
          large: parsed.playerWinPatterns?.size?.large ?? 0,
        },
        shape: {
          round: parsed.playerWinPatterns?.shape?.round ?? 0,
          square: parsed.playerWinPatterns?.shape?.square ?? 0,
        },
        top: {
          hollow: parsed.playerWinPatterns?.top?.hollow ?? 0,
          solid: parsed.playerWinPatterns?.top?.solid ?? 0,
        },
      },
      playerPlacements: Array.isArray(parsed.playerPlacements) && parsed.playerPlacements.length === 4
        ? parsed.playerPlacements.map((row) =>
          Array.isArray(row) && row.length === 4 ? row.map((value) => (typeof value === 'number' ? value : 0)) : [0, 0, 0, 0]
        )
        : createEmptyAiLearningProfile().playerPlacements,
    };
  } catch {
    return createEmptyAiLearningProfile();
  }
};

const saveStoredAiLearningProfile = (profile: AiLearningProfile) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AI_LEARNING_STORAGE_KEY, JSON.stringify(profile));
};

const loadStoredGameResults = (): GameResultEntry[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(GAME_RESULTS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as Array<Partial<GameResultEntry>>;
    return Array.isArray(parsed)
      ? parsed.map((entry) => {
        const badgeRules = Array.isArray(entry.badges)
          ? entry.badges.find((badge) => badge.startsWith('Правила: '))
          : null;

        return {
          id: typeof entry.id === 'number' ? entry.id : Date.now(),
          summary: typeof entry.summary === 'string' ? entry.summary : 'Партия завершена',
          meta: typeof entry.meta === 'string' ? entry.meta : '',
          rules: typeof entry.rules === 'string' && entry.rules
            ? entry.rules
            : badgeRules?.replace('Правила: ', '') ?? 'Правила неизвестны',
          badges: Array.isArray(entry.badges) ? entry.badges.filter((badge) => !badge.startsWith('Правила: ')) : [],
        };
      })
      : [];
  } catch {
    return [];
  }
};

const saveStoredGameResults = (results: GameResultEntry[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(GAME_RESULTS_STORAGE_KEY, JSON.stringify(results));
};

const loadStoredPlayerProfile = (): PlayerProfile => {
  if (typeof window === 'undefined') {
    return {
      name: 'Игрок',
      avatarBase64: null,
      pieceSet: 'classic',
    };
  }

  try {
    const rawValue = window.localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
    if (!rawValue) {
      return {
        name: 'Игрок',
        avatarBase64: null,
        pieceSet: 'classic',
      };
    }

    const parsed = JSON.parse(rawValue) as Partial<PlayerProfile>;
    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : 'Игрок',
      avatarBase64: typeof parsed.avatarBase64 === 'string' ? parsed.avatarBase64 : null,
      pieceSet: parsed.pieceSet === 'modern' ? 'modern' : 'classic',
    };
  } catch {
    return {
      name: 'Игрок',
      avatarBase64: null,
      pieceSet: 'classic',
    };
  }
};

const saveStoredPlayerProfile = (profile: PlayerProfile) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const compressImageToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Не удалось загрузить изображение.'));
      image.onload = () => {
        const maxSide = 192;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Не удалось подготовить изображение.'));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

const playerName = (player: PlayerId, isAiMode: boolean, humanName: string) =>
  isAiMode ? (player === 1 ? humanName : 'Крупье ИИ') : player === 1 ? humanName : `Игрок ${player}`;

const pieceLabelLower = (piece: Piece) => {
  const label = pieceLabel(piece);
  return label.charAt(0).toLowerCase() + label.slice(1);
};

const aiDifficultyLabel = (difficulty: GameSettings['aiDifficulty']) =>
  difficulty === 'adaptive' ? 'учится' : difficulty;

const placementActionText = (actor: PlayerId, isAiMode: boolean, humanName: string, piece: Piece, position: Position) => {
  return `${playerName(actor, isAiMode, humanName)} ставит ${pieceLabelLower(piece)} на ${position.row + 1}:${position.col + 1}.`;
};

const handoffText = (actor: PlayerId, isAiMode: boolean, humanName: string, piece: Piece) => {
  const receiver = isAiMode
    ? actor === 1
      ? 'Крупье ИИ'
      : humanName
    : playerName(actor === 1 ? 2 : 1, false, humanName);

  return `${playerName(actor, isAiMode, humanName)} выбирает ${pieceLabel(piece)} для ${receiver}.`;
};

const reserveSortLabels: Record<ReserveSortKey, string> = {
  default: 'Без сортировки',
  color: 'По цвету',
  size: 'По размеру',
  shape: 'По форме',
  top: 'По верху',
};

const DEFAULT_RESERVE_FILTERS: ReserveFilters = {
  color: 'all',
  size: 'all',
  shape: 'all',
  top: 'all',
};

const reserveFilterCycle = {
  color: ['all', 'light', 'dark'],
  size: ['all', 'small', 'large'],
  shape: ['all', 'round', 'square'],
  top: ['all', 'hollow', 'solid'],
} as const satisfies {
  [Key in keyof ReserveFilters]: readonly ReserveFilters[Key][];
};

const reserveFilterMeta = {
  color: {
    label: 'Цвет',
    states: {
      all: 'Любой цвет',
      light: 'Светлые',
      dark: 'Темные',
    },
  },
  size: {
    label: 'Размер',
    states: {
      all: 'Любой размер',
      small: 'Маленькие',
      large: 'Большие',
    },
  },
  shape: {
    label: 'Форма',
    states: {
      all: 'Любая форма',
      round: 'Круглые',
      square: 'Квадратные',
    },
  },
  top: {
    label: 'Пустота',
    states: {
      all: 'Любой верх',
      hollow: 'Полые',
      solid: 'Сплошные',
    },
  },
} as const;

interface InitialGameState {
  startedAt: number | null;
  turnStartedAt: number | null;
  board: Board;
  availablePieces: Piece[];
  phase: Phase;
  turnPlayer: PlayerId;
  activePiece: Piece | null;
  moveLog: string[];
  tutorialStep: TutorialStep | null;
}

const buildInitialGameState = (mode: GameSettings['mode'], pieces: Piece[]): InitialGameState => {
  if (mode === 'tutorial') {
    const board = createEmptyBoard();
    const getPiece = (id: number) => pieces.find((piece) => piece.id === id)!;
    board[0][0] = getPiece(9);
    board[0][1] = getPiece(12);
    board[0][2] = getPiece(13);

    return {
      startedAt: null,
      turnStartedAt: null,
      board,
      availablePieces: pieces.filter((piece) => ![9, 12, 13].includes(piece.id)),
      phase: 'selectPiece',
      turnPlayer: 1,
      activePiece: null,
      moveLog: [
        'Обучение началось. Выберите подсвеченную фигуру для ИИ.',
        'Подсказка: в верхнем ряду уже лежат три большие фигуры.',
      ],
      tutorialStep: 'pickPieceForAi',
    };
  }

  return {
    startedAt: null,
    turnStartedAt: null,
    board: createEmptyBoard(),
    availablePieces: pieces,
    phase: 'selectPiece',
    turnPlayer: 1,
    activePiece: null,
    moveLog: ['Новая партия. Игрок 1 выбирает фигуру для соперника.'],
    tutorialStep: null,
  };
};

const formatElapsedTime = (elapsedMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const parseDurationLabelToSeconds = (value: string) => {
  const match = value.match(/(\d{2}):(\d{2})/);
  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const HeaderModeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <path d="M7 7h10v10H7z" />
    <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
  </svg>
);

const HeaderDifficultyBarsIcon = ({ level, color }: { level: 1 | 2 | 3; color: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon game-difficulty-icon">
    <rect x="4" y="6" width="4" height="12" rx="2" fill={level >= 1 ? color : 'rgb(255 255 255 / 0.12)'} />
    <rect x="10" y="4" width="4" height="14" rx="2" fill={level >= 2 ? color : 'rgb(255 255 255 / 0.12)'} />
    <rect x="16" y="2" width="4" height="16" rx="2" fill={level >= 3 ? color : 'rgb(255 255 255 / 0.12)'} />
  </svg>
);

const HeaderDifficultyBrainIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon game-difficulty-icon">
    <path
      d="M9 5.5a3 3 0 0 1 5.4-1.8A3.4 3.4 0 0 1 19 7a3.2 3.2 0 0 1-1.4 2.6A3.4 3.4 0 0 1 18 11a3.5 3.5 0 0 1-3.5 3.5H10A4 4 0 0 1 6 10.5c0-.5.1-1 .3-1.4A3.2 3.2 0 0 1 5 6.5A3.5 3.5 0 0 1 9 5.5Z"
      fill="#8b5cf6"
    />
    <path d="M10 7.5c-1 0-1.8.8-1.8 1.8M13.2 6.8c.8 0 1.5.6 1.5 1.4M11.3 10v4M8.8 10.6h5.7" stroke="#efe7ff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const HeaderDifficultyIcon = ({ difficulty }: { difficulty: GameSettings['aiDifficulty'] }) => {
  if (difficulty === 'easy') {
    return <HeaderDifficultyBarsIcon level={1} color="#34d399" />;
  }

  if (difficulty === 'medium') {
    return <HeaderDifficultyBarsIcon level={2} color="#60a5fa" />;
  }

  if (difficulty === 'hard') {
    return <HeaderDifficultyBarsIcon level={3} color="#f87171" />;
  }

  return <HeaderDifficultyBrainIcon />;
};

const HeaderRulesClassicIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <path d="M5 5l14 14M19 5L5 19M5 12h14M12 5v14" />
  </svg>
);

const HeaderRulesHardcoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
  </svg>
);

const HeaderClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <circle cx="12" cy="12" r="7" />
    <path d="M12 8v4l3 2" />
  </svg>
);

const HeaderPiecesIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <path d="M6 8.5h5.5V14H6zM12.5 10h5.5v5.5h-5.5zM7.5 15h5.5v3.5H7.5z" />
  </svg>
);

const formatFinishedAt = (timestamp: number) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);

export const GameBoard: React.FC<GameBoardProps> = ({
  gameSettings,
  onBackToMenu,
  onSessionPresenceChange,
  onUpdateGameSettings,
  onStartGame,
}) => {
  const resolvedSettings: GameSettings = useMemo(() => gameSettings ?? {
    mode: 'local',
    aiDifficulty: 'medium',
    allowSquareWin: true,
  }, [gameSettings]);
  const isAiMode = resolvedSettings.mode === 'ai' || resolvedSettings.mode === 'quick';
  const isQuickMode = resolvedSettings.mode === 'quick';
  const isTutorialMode = resolvedSettings.mode === 'tutorial';
  const initialPieces = useMemo(() => createPieces(), []);
  const restoredSession = useMemo(() => loadStoredGameSession(), []);
  const initialGameState = useMemo(
    () => buildInitialGameState(resolvedSettings.mode, initialPieces),
    [initialPieces, resolvedSettings.mode]
  );

  const hasMatchingRestoredSession = restoredSession?.gameSettings.mode === resolvedSettings.mode;
  const [startedAt, setStartedAt] = useState<number | null>(() => hasMatchingRestoredSession ? restoredSession.startedAt : initialGameState.startedAt);
  const [turnStartedAt, setTurnStartedAt] = useState<number | null>(() => hasMatchingRestoredSession ? (restoredSession.turnStartedAt ?? initialGameState.turnStartedAt) : initialGameState.turnStartedAt);
  const [finishedAt, setFinishedAt] = useState<number | null>(() => hasMatchingRestoredSession ? (restoredSession.finishedAt ?? null) : null);
  const [pausedAt, setPausedAt] = useState<number | null>(() => hasMatchingRestoredSession ? restoredSession.pausedAt : null);
  const [board, setBoard] = useState<Board>(() => hasMatchingRestoredSession ? restoredSession.board : initialGameState.board);
  const [availablePieces, setAvailablePieces] = useState<Piece[]>(() => hasMatchingRestoredSession ? restoredSession.availablePieces : initialGameState.availablePieces);
  const [phase, setPhase] = useState<Phase>(() => hasMatchingRestoredSession ? restoredSession.phase : initialGameState.phase);
  const [turnPlayer, setTurnPlayer] = useState<PlayerId>(() => hasMatchingRestoredSession ? restoredSession.turnPlayer : initialGameState.turnPlayer);
  const [activePiece, setActivePiece] = useState<Piece | null>(() => hasMatchingRestoredSession ? restoredSession.activePiece : initialGameState.activePiece);
  const [draggedPieceId, setDraggedPieceId] = useState<number | null>(null);
  const [winner, setWinner] = useState<PlayerId | null>(() => hasMatchingRestoredSession ? restoredSession.winner : null);
  const [winningPattern, setWinningPattern] = useState<WinningPattern | null>(() => hasMatchingRestoredSession ? restoredSession.winningPattern : null);
  const [lastPlacedCellId, setLastPlacedCellId] = useState<string | null>(null);
  const [pickedReservePieceId, setPickedReservePieceId] = useState<number | null>(null);
  const [pickedReserveActor, setPickedReserveActor] = useState<'player' | 'opponent' | null>(null);
  const [aiReserveHoverId, setAiReserveHoverId] = useState<number | null>(null);
  const [exitingReservePieceIds, setExitingReservePieceIds] = useState<number[]>([]);
  const [moveLog, setMoveLog] = useState<string[]>(() => hasMatchingRestoredSession ? restoredSession.moveLog : initialGameState.moveLog);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isWinnerOverlayVisible, setIsWinnerOverlayVisible] = useState(() => hasMatchingRestoredSession ? restoredSession.isWinnerOverlayVisible : false);
  const [isIdlePromptVisible, setIsIdlePromptVisible] = useState(() => hasMatchingRestoredSession ? restoredSession.isIdlePromptVisible : false);
  const [openSettingsMenu, setOpenSettingsMenu] = useState<'difficulty' | 'rules' | null>(null);
  const [openReserveMenu, setOpenReserveMenu] = useState<'sort' | null>(null);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep | null>(() => hasMatchingRestoredSession ? restoredSession.tutorialStep : initialGameState.tutorialStep);
  const [toastMessages, setToastMessages] = useState<Array<{ id: number; text: string }>>([]);
  const [reserveSort, setReserveSort] = useState<ReserveSortKey>(() => hasMatchingRestoredSession ? restoredSession.reserveSort : 'default');
  const [reserveFilters, setReserveFilters] = useState<ReserveFilters>(() => hasMatchingRestoredSession ? restoredSession.reserveFilters : DEFAULT_RESERVE_FILTERS);
  const [showUsedPieces, setShowUsedPieces] = useState<boolean>(() => {
    if (hasMatchingRestoredSession) {
      return restoredSession.showUsedPieces;
    }

    if (typeof window === 'undefined') {
      return true;
    }

    const rawValue = window.localStorage.getItem(RESERVE_VISIBILITY_STORAGE_KEY);
    return rawValue === null ? true : rawValue === '1';
  });
  const [clockNow, setClockNow] = useState(() => hasMatchingRestoredSession ? (restoredSession.finishedAt ?? restoredSession.pausedAt ?? Date.now()) : Date.now());
  const [gameResults, setGameResults] = useState<GameResultEntry[]>(() => loadStoredGameResults());
  const [aiLearningProfile, setAiLearningProfile] = useState<AiLearningProfile>(() => loadStoredAiLearningProfile());
  const [sidebarView, setSidebarView] = useState<'home' | 'log' | 'profile'>('home');
  const [isMobileSidebarOverlay, setIsMobileSidebarOverlay] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT : false
  );
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => loadStoredPlayerProfile());
  const [profileNameDraft, setProfileNameDraft] = useState(() => loadStoredPlayerProfile().name);
  const [profileAvatarDraft, setProfileAvatarDraft] = useState<string | null>(() => loadStoredPlayerProfile().avatarBase64);
  const [profilePieceSetDraft, setProfilePieceSetDraft] = useState<'classic' | 'modern'>(() => loadStoredPlayerProfile().pieceSet);
  const [isAvatarProcessing, setIsAvatarProcessing] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(hasMatchingRestoredSession ? restoredSession.startedAt : initialGameState.startedAt);
  const playerDisplayName = playerProfile.name.trim() || 'Игрок';
  const isRoundStarted = startedAt !== null;
  const addLog = useCallback((entry: string) => {
    const startedBase = startedAtRef.current;
    const timestampedEntry = `[${formatElapsedTime(startedBase === null ? 0 : Date.now() - startedBase)}] ${entry}`;
    setMoveLog((current) => [timestampedEntry, ...current].slice(0, 18));
  }, []);

  const showToast = useCallback((text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToastMessages((current) => [...current, { id, text }].slice(-3));
    window.setTimeout(() => {
      setToastMessages((current) => current.filter((item) => item.id !== id));
    }, 2200);
  }, []);

  const resetGame = () => {
    const nextState = buildInitialGameState(resolvedSettings.mode, initialPieces);
    startedAtRef.current = nextState.startedAt;
    setStartedAt(nextState.startedAt);
    setTurnStartedAt(nextState.turnStartedAt);
    setFinishedAt(null);
    setPausedAt(null);
    setClockNow(nextState.startedAt);
    setBoard(nextState.board);
    setAvailablePieces(nextState.availablePieces);
    setPhase(nextState.phase);
    setTurnPlayer(nextState.turnPlayer);
    setActivePiece(nextState.activePiece);
    setDraggedPieceId(null);
    setWinner(null);
    setWinningPattern(null);
    setLastPlacedCellId(null);
    setPickedReservePieceId(null);
    setPickedReserveActor(null);
    setAiReserveHoverId(null);
    setExitingReservePieceIds([]);
    setMoveLog(nextState.moveLog);
    setIsWinnerOverlayVisible(false);
    setIsIdlePromptVisible(false);
    setTutorialStep(nextState.tutorialStep);
    setToastMessages([]);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(RESERVE_VISIBILITY_STORAGE_KEY, showUsedPieces ? '1' : '0');
  }, [showUsedPieces]);

  useEffect(() => {
    saveStoredGameResults(gameResults);
  }, [gameResults]);

  useEffect(() => {
    saveStoredAiLearningProfile(aiLearningProfile);
  }, [aiLearningProfile]);

  useEffect(() => {
    saveStoredPlayerProfile(playerProfile);
  }, [playerProfile]);

  useEffect(() => {
    if (exitingReservePieceIds.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setExitingReservePieceIds([]);
    }, 240);

    return () => window.clearTimeout(timer);
  }, [exitingReservePieceIds]);

  useEffect(() => {
    if (!lastPlacedCellId) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLastPlacedCellId(null);
    }, 380);

    return () => window.clearTimeout(timer);
  }, [lastPlacedCellId]);

  useEffect(() => {
    if (startedAt === null || pausedAt !== null || finishedAt !== null) {
      return;
    }

    const timer = window.setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finishedAt, pausedAt, startedAt]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncSidebarMode = () => {
      setIsMobileSidebarOverlay(window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT);
    };

    syncSidebarMode();
    window.addEventListener('resize', syncSidebarMode);

    return () => window.removeEventListener('resize', syncSidebarMode);
  }, []);

  const scheduleIdlePrompt = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }

    if (phase === 'gameOver' || isIdlePromptVisible) {
      idleTimerRef.current = null;
      return;
    }

    idleTimerRef.current = window.setTimeout(() => {
      const now = Date.now();
      setPausedAt((current) => current ?? now);
      setClockNow(now);
      setIsIdlePromptVisible(true);
    }, IDLE_TIMEOUT_MS);
  }, [isIdlePromptVisible, phase]);

  useEffect(() => {
    scheduleIdlePrompt();

    const handleActivity = () => {
      if (isIdlePromptVisible || phase === 'gameOver') {
        return;
      }

      scheduleIdlePrompt();
    };

    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('wheel', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('wheel', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isIdlePromptVisible, phase, scheduleIdlePrompt]);

  useEffect(() => {
    const snapshot: GameSessionSnapshot = {
      version: 2,
      gameSettings: resolvedSettings,
      startedAt,
      turnStartedAt,
      finishedAt,
      pausedAt,
      board,
      availablePieces,
      phase,
      turnPlayer,
      activePiece,
      winner,
      winningPattern,
      moveLog,
      tutorialStep,
      isWinnerOverlayVisible,
      isIdlePromptVisible,
      reserveSort,
      reserveFilters,
      showUsedPieces,
    };

    saveStoredGameSession(snapshot);
    onSessionPresenceChange(true);
  }, [
    activePiece,
    availablePieces,
    board,
    isIdlePromptVisible,
    isWinnerOverlayVisible,
    moveLog,
    onSessionPresenceChange,
    phase,
    reserveFilters,
    reserveSort,
    resolvedSettings,
    pausedAt,
    finishedAt,
    startedAt,
    turnStartedAt,
    showUsedPieces,
    tutorialStep,
    turnPlayer,
    winner,
    winningPattern,
  ]);

  const updateSettings = useCallback((patch: Partial<GameSettings>) => {
    onUpdateGameSettings({
      ...resolvedSettings,
      ...patch,
    });
    setOpenSettingsMenu(null);
  }, [onUpdateGameSettings, resolvedSettings]);

  const ensureRoundStarted = useCallback(() => {
    if (startedAtRef.current !== null) {
      return startedAtRef.current;
    }

    const now = Date.now();
    startedAtRef.current = now;
    setStartedAt(now);
    setTurnStartedAt(now);
    setFinishedAt(null);
    setClockNow(now);
    return now;
  }, []);

  const finishGame = useCallback((nextBoard: Board, winningPlayer: PlayerId | null, pattern: WinningPattern | null) => {
    const endedAt = Date.now();
    const placedPiecesCount = nextBoard.flat().filter((piece): piece is Piece => piece !== null).length;
    const figuresLeft = initialPieces.length - placedPiecesCount;
    const durationLabel = formatElapsedTime(startedAt === null ? 0 : endedAt - startedAt);
    const winnerLabel = winningPlayer === null
      ? 'Ничья'
      : playerName(winningPlayer, isAiMode, playerDisplayName);
    const loserLabel = winningPlayer === null
      ? 'без победителя'
      : playerName(winningPlayer === 1 ? 2 : 1, isAiMode, playerDisplayName);
    const modeSummary = isTutorialMode
      ? 'Обучение'
      : isAiMode
        ? isQuickMode
          ? `Блиц vs ИИ ${aiDifficultyLabel(resolvedSettings.aiDifficulty)}`
          : `ИИ ${aiDifficultyLabel(resolvedSettings.aiDifficulty)}`
        : isQuickMode
          ? 'Быстрая игра'
          : 'Локально';
    const rulesSummary = resolvedSettings.allowSquareWin ? 'Правила: Хардкор' : 'Правила: Классика';
    const resultBadges = [
      `Время ${durationLabel}`,
      `${placedPiecesCount} ходов`,
      `${figuresLeft} фигур осталось`,
      modeSummary,
      formatFinishedAt(endedAt),
    ];

    setBoard(nextBoard);
    setPhase('gameOver');
    setTurnStartedAt(Date.now());
    setFinishedAt(endedAt);
    setClockNow(endedAt);
    setPausedAt(null);
    setIsIdlePromptVisible(false);
    setWinner(winningPlayer);
    setWinningPattern(pattern);
    setIsWinnerOverlayVisible(winningPlayer !== null);
    setGameResults((current) => [
      {
        id: endedAt,
        summary: winningPlayer === null ? 'Партия завершилась вничью' : `${winnerLabel} победил ${loserLabel}`,
        meta: pattern
          ? pattern.type === 'square'
            ? 'Победа по квадрату 2x2'
            : 'Победа по линии'
          : winningPlayer === null
            ? 'Поле заполнено'
            : 'Победа по времени',
        rules: rulesSummary.replace('Правила: ', ''),
        badges: resultBadges,
      },
      ...current,
    ].slice(0, 10));

    if (isAiMode) {
      setAiLearningProfile((current) => {
        const nextProfile: AiLearningProfile = {
          ...current,
          gamesSeen: current.gamesSeen + 1,
        };

        if (winningPlayer === 1 && pattern) {
          const sharedAttributes = getSharedAttributes(nextBoard, pattern);
          const firstWinningPiece = pattern.cells
            .map(({ row, col }) => nextBoard[row][col])
            .find((piece): piece is Piece => piece !== null);

          if (firstWinningPiece) {
            sharedAttributes.forEach((attribute) => {
              nextProfile.playerWinPatterns[attribute][firstWinningPiece[attribute]] += 1;
            });
          }
        }

        return nextProfile;
      });
    }
  }, [initialPieces.length, isAiMode, isQuickMode, isTutorialMode, playerDisplayName, resolvedSettings.aiDifficulty, resolvedSettings.allowSquareWin, startedAt]);

  const simulatePlacement = (currentBoard: Board, piece: Piece, position: Position): Board =>
    placePiece(currentBoard, position, piece);

  const findWinningPlacement = useCallback((currentBoard: Board, piece: Piece): Position | null => {
    for (const position of getEmptyPositions(currentBoard)) {
      if (checkWinner(simulatePlacement(currentBoard, piece, position), { allowSquareWin: resolvedSettings.allowSquareWin })) {
        return position;
      }
    }

    return null;
  }, [resolvedSettings.allowSquareWin]);

  const getDangerScore = useCallback((currentBoard: Board, candidate: Piece) => {
    let threats = 0;

    for (const position of getEmptyPositions(currentBoard)) {
      if (checkWinner(simulatePlacement(currentBoard, candidate, position), { allowSquareWin: resolvedSettings.allowSquareWin })) {
        threats += 1;
      }
    }

    return threats;
  }, [resolvedSettings.allowSquareWin]);

  const commitPlacement = useCallback((position: Position, piece: Piece, actor: PlayerId) => {
    if (board[position.row][position.col]) {
      return;
    }

    ensureRoundStarted();
    if (isAiMode && actor === 1) {
      setAiLearningProfile((current) => ({
        ...current,
        playerPlacements: current.playerPlacements.map((row, rowIndex) =>
          rowIndex === position.row
            ? row.map((value, colIndex) => colIndex === position.col ? value + 1 : value)
            : row
        ),
      }));
    }
    const nextBoard = placePiece(board, position, piece);
    setLastPlacedCellId(`${position.row}-${position.col}`);
    const placementText = placementActionText(actor, isAiMode, playerDisplayName, piece, position);

    const winnerPattern = getWinningPattern(nextBoard, { allowSquareWin: resolvedSettings.allowSquareWin });
    if (winnerPattern) {
      addLog(`${placementText} Quarto!`);
      finishGame(nextBoard, actor, winnerPattern);
      return;
    }

    if (isBoardFull(nextBoard)) {
      addLog(`${placementText} Поле заполнено, ничья.`);
      finishGame(nextBoard, null, null);
      return;
    }

    setBoard(nextBoard);
    setActivePiece(null);
    setPhase('selectPiece');
    setTurnPlayer(actor);
    setTurnStartedAt(Date.now());
    addLog(placementText);
  }, [addLog, board, ensureRoundStarted, finishGame, isAiMode, playerDisplayName, resolvedSettings.allowSquareWin]);

  const handleSelectPiece = useCallback((piece: Piece) => {
    if (phase !== 'selectPiece') {
      return;
    }

    ensureRoundStarted();
    if (isAiMode && turnPlayer === 1) {
      setAiLearningProfile((current) => ({
        ...current,
        handoffPreferences: {
          color: {
            ...current.handoffPreferences.color,
            [piece.color]: current.handoffPreferences.color[piece.color] + 1,
          },
          size: {
            ...current.handoffPreferences.size,
            [piece.size]: current.handoffPreferences.size[piece.size] + 1,
          },
          shape: {
            ...current.handoffPreferences.shape,
            [piece.shape]: current.handoffPreferences.shape[piece.shape] + 1,
          },
          top: {
            ...current.handoffPreferences.top,
            [piece.top]: current.handoffPreferences.top[piece.top] + 1,
          },
        },
      }));
    }
    setPickedReservePieceId(piece.id);
    setPickedReserveActor(turnPlayer === 1 ? 'player' : 'opponent');
    window.setTimeout(() => {
      if (!showUsedPieces) {
        setExitingReservePieceIds((current) => Array.from(new Set([...current, piece.id])));
      }
      setAvailablePieces((current) => current.filter((candidate) => candidate.id !== piece.id));
      setActivePiece(piece);
      setTurnPlayer(turnPlayer === 1 ? 2 : 1);
      setPhase('placePiece');
      setTurnStartedAt(Date.now());
      addLog(handoffText(turnPlayer, isAiMode, playerDisplayName, piece));
      setPickedReservePieceId(null);
      setPickedReserveActor(null);
    }, 240);
  }, [addLog, ensureRoundStarted, isAiMode, phase, playerDisplayName, showUsedPieces, turnPlayer]);

  const handleTutorialPieceSelect = useCallback((piece: Piece) => {
    if (tutorialStep !== 'pickPieceForAi') {
      return false;
    }

    if (piece.id !== 4) {
      showToast('В обучении сначала выберите подсвеченную фигуру для ИИ.');
      return true;
    }

    const winningPiece = initialPieces.find((candidate) => candidate.id === 16)!;
    ensureRoundStarted();
    const nextBoard = placePiece(board, { row: 2, col: 0 }, piece);

    if (!showUsedPieces) {
      setExitingReservePieceIds((current) => Array.from(new Set([...current, piece.id, winningPiece.id])));
    }
    setBoard(nextBoard);
    setAvailablePieces((current) => current.filter((candidate) => candidate.id !== piece.id && candidate.id !== winningPiece.id));
    setActivePiece(winningPiece);
    setTurnPlayer(1);
    setPhase('placePiece');
    setTurnStartedAt(Date.now());
    setTutorialStep('placeWinningPiece');
    addLog(`${playerDisplayName} выбирает ${pieceLabel(piece)} для Крупье ИИ.`);
    addLog(`Крупье ИИ мгновенно ставит ${pieceLabel(piece)} на 3:1 и передает игроку ${playerDisplayName} ${pieceLabel(winningPiece)}.`);
    return true;
  }, [addLog, board, ensureRoundStarted, initialPieces, playerDisplayName, showToast, showUsedPieces, tutorialStep]);

  const handleReserveSelect = useCallback((piece: Piece, isAvailable: boolean, isTemporarilyLocked: boolean) => {
    if (!isAvailable) {
      showToast('Эта фигура уже выбыла из резерва.');
      return;
    }

    if (phase === 'gameOver') {
      showToast('Партия завершена. Начните новую партию, чтобы сыграть еще раз.');
      return;
    }

    if (turnPlayer !== 1) {
      showToast('Сейчас не ваш ход.');
      return;
    }

    if (phase !== 'selectPiece') {
      showToast('Сейчас нужно поставить активную фигуру на поле.');
      return;
    }

    if (isTutorialMode && handleTutorialPieceSelect(piece)) {
      return;
    }

    if (isTemporarilyLocked) {
      showToast('Сейчас выбор фигуры недоступен.');
      return;
    }

    handleSelectPiece(piece);
  }, [handleSelectPiece, handleTutorialPieceSelect, isTutorialMode, phase, showToast, turnPlayer]);

  const handleDropOnCell = (position: Position) => {
    if (phase === 'gameOver') {
      showToast('Партия завершена. Начните новую партию, чтобы сыграть еще раз.');
      return;
    }

    if (turnPlayer !== 1) {
      showToast('Сейчас не ваш ход.');
      return;
    }

    if (phase !== 'placePiece') {
      showToast('Сначала выберите фигуру в резерве.');
      return;
    }

    if (!activePiece) {
      showToast('Сейчас нет активной фигуры для постановки.');
      return;
    }

    if (board[position.row][position.col]) {
      showToast('Эта клетка уже занята.');
      return;
    }

    if (isTutorialMode && tutorialStep === 'placeWinningPiece' && (position.row !== 0 || position.col !== 3)) {
      showToast('В обучении сейчас нужно поставить фигуру в клетку 1-4.');
      return;
    }

    if (draggedPieceId !== null && draggedPieceId !== activePiece.id) {
      return;
    }

    commitPlacement(position, activePiece, turnPlayer);
    setDraggedPieceId(null);
  };

  const chooseAiPlacement = useCallback((): Position | null => {
    if (!activePiece) {
      return null;
    }

    const winningMove = findWinningPlacement(board, activePiece);
    if (winningMove) {
      return winningMove;
    }

    const positions = getEmptyPositions(board);
    const scoredPositions = positions.map((position) => {
      const simulatedBoard = simulatePlacement(board, activePiece, position);
      const threatScore = availablePieces.reduce((sum, piece) => sum + getDangerScore(simulatedBoard, piece), 0);
      const centerBias = Math.abs(1.5 - position.row) + Math.abs(1.5 - position.col);
      const learnedHotCell = aiLearningProfile.playerPlacements[position.row]?.[position.col] ?? 0;

      return {
        position,
        score: threatScore * 10 + centerBias - learnedHotCell * 0.35,
      };
    });

    if (resolvedSettings.aiDifficulty === 'hard') {
      return [...scoredPositions].sort((left, right) => left.score - right.score)[0]?.position ?? null;
    }

    if (resolvedSettings.aiDifficulty === 'adaptive') {
      return [...scoredPositions].sort((left, right) => left.score - right.score)[0]?.position ?? null;
    }

    if (resolvedSettings.aiDifficulty === 'medium') {
      const pool = [...scoredPositions].sort((left, right) => left.score - right.score).slice(0, 3);
      return pool[Math.floor(Math.random() * pool.length)]?.position ?? null;
    }

    return positions[Math.floor(Math.random() * positions.length)] ?? null;
  }, [activePiece, aiLearningProfile.playerPlacements, availablePieces, board, findWinningPlacement, getDangerScore, resolvedSettings.aiDifficulty]);

  const chooseAiPiece = useCallback((): Piece | null => {
    if (availablePieces.length === 0) {
      return null;
    }

    const ranked = [...availablePieces].sort((a, b) => {
      const scorePiece = (piece: Piece) => {
        const danger = getDangerScore(board, piece);
        if (resolvedSettings.aiDifficulty !== 'adaptive') {
          return danger;
        }

        const learnedBias =
          aiLearningProfile.playerWinPatterns.color[piece.color] * 2.4 +
          aiLearningProfile.playerWinPatterns.size[piece.size] * 2 +
          aiLearningProfile.playerWinPatterns.shape[piece.shape] * 2 +
          aiLearningProfile.playerWinPatterns.top[piece.top] * 2.2 +
          aiLearningProfile.handoffPreferences.color[piece.color] * 0.45 +
          aiLearningProfile.handoffPreferences.size[piece.size] * 0.4 +
          aiLearningProfile.handoffPreferences.shape[piece.shape] * 0.4 +
          aiLearningProfile.handoffPreferences.top[piece.top] * 0.45;

        return danger * 1.35 + learnedBias;
      };

      return scorePiece(a) - scorePiece(b);
    });

    if (resolvedSettings.aiDifficulty === 'hard') {
      return ranked[0] ?? null;
    }

    if (resolvedSettings.aiDifficulty === 'adaptive') {
      return ranked[0] ?? null;
    }

    if (resolvedSettings.aiDifficulty === 'medium') {
      const pool = ranked.slice(0, Math.min(4, ranked.length));
      return pool[Math.floor(Math.random() * pool.length)] ?? null;
    }

    return availablePieces[Math.floor(Math.random() * availablePieces.length)] ?? null;
  }, [aiLearningProfile.handoffPreferences.color, aiLearningProfile.handoffPreferences.shape, aiLearningProfile.handoffPreferences.size, aiLearningProfile.handoffPreferences.top, aiLearningProfile.playerWinPatterns.color, aiLearningProfile.playerWinPatterns.shape, aiLearningProfile.playerWinPatterns.size, aiLearningProfile.playerWinPatterns.top, availablePieces, board, getDangerScore, resolvedSettings.aiDifficulty]);

  const buildAiReserveHoverSequence = useCallback((choice: Piece) => {
    const ordered = [...availablePieces].sort((left, right) => left.id - right.id);
    const choiceIndex = ordered.findIndex((piece) => piece.id === choice.id);
    if (choiceIndex === -1) {
      return [choice.id];
    }

    const nearby = ordered
      .slice(Math.max(0, choiceIndex - 2), Math.min(ordered.length, choiceIndex + 3))
      .map((piece) => piece.id)
      .filter((id) => id !== choice.id);

    const shuffled = [...nearby].sort(() => Math.random() - 0.5).slice(0, Math.min(2, nearby.length));
    return [...shuffled, choice.id];
  }, [availablePieces]);

  useEffect(() => {
    if (!isAiMode || turnPlayer !== 2 || phase === 'gameOver' || isIdlePromptVisible) {
      return;
    }

    const hoverTimers: number[] = [];
    const timer = window.setTimeout(() => {
      if (phase === 'placePiece' && activePiece) {
        const target = chooseAiPlacement();
        if (target) {
          commitPlacement(target, activePiece, 2);
        }
        return;
      }

      if (phase === 'selectPiece') {
        const choice = chooseAiPiece();
        if (choice) {
          const hoverSequence = buildAiReserveHoverSequence(choice);
          const hoverTimers: number[] = [];

          hoverSequence.forEach((pieceId, index) => {
            const hoverTimer = window.setTimeout(() => {
              setAiReserveHoverId(pieceId);
            }, index * 180);
            hoverTimers.push(hoverTimer);
          });

          const commitTimer = window.setTimeout(() => {
            setAiReserveHoverId(null);
            handleSelectPiece(choice);
          }, hoverSequence.length * 180 + 90);
          hoverTimers.push(commitTimer);
        }
      }
    }, isQuickMode ? 450 : getAiThinkDelayMs());

    return () => {
      window.clearTimeout(timer);
      hoverTimers.forEach((hoverTimer) => window.clearTimeout(hoverTimer));
      setAiReserveHoverId(null);
    };
  }, [activePiece, buildAiReserveHoverSequence, chooseAiPiece, chooseAiPlacement, commitPlacement, handleSelectPiece, isAiMode, isIdlePromptVisible, isQuickMode, phase, turnPlayer]);

  useEffect(() => {
    if (!isQuickMode || phase === 'gameOver' || pausedAt !== null || turnPlayer !== 1 || turnStartedAt === null) {
      return;
    }

    const remainingMs = Math.max(0, QUICK_TURN_LIMIT_MS - (Date.now() - turnStartedAt));
    const timer = window.setTimeout(() => {
      const winningPlayer = 2;
      addLog(`${playerDisplayName} не уложился в 15 секунд. Крупье ИИ побеждает по времени.`);
      finishGame(board, winningPlayer, null);
    }, remainingMs);

    return () => window.clearTimeout(timer);
  }, [addLog, board, finishGame, isQuickMode, pausedAt, phase, playerDisplayName, turnPlayer, turnStartedAt]);

  const statusTitle = (() => {
    if (isTutorialMode && phase !== 'gameOver') {
      return tutorialStep === 'pickPieceForAi'
        ? 'Шаг 1. Выберите фигуру для ИИ'
        : 'Шаг 2. Поставьте победную фигуру';
    }

    if (phase === 'gameOver') {
      if (winner === null) {
        return 'Ничья';
      }

      if (winner === 1) {
        return 'Вы победили';
      }

      return isAiMode ? 'Крупье ИИ победил' : `Игрок ${winner} победил`;
    }

    if (isAiMode && turnPlayer === 1) {
      return phase === 'selectPiece'
        ? isQuickMode
          ? 'Быстрый ход: выберите фигуру для ИИ'
          : 'Вы выбираете фигуру для ИИ'
        : isQuickMode
          ? 'Быстрый ход: поставьте фигуру на стол'
          : 'Поставьте фигуру на стол';
    }

    if (isAiMode && turnPlayer === 2) {
      return phase === 'selectPiece'
        ? isQuickMode
          ? 'Крупье ИИ выбирает фигуру для вас'
          : 'Крупье ИИ выбирает фигуру для вас'
        : isQuickMode
          ? 'Крупье ИИ быстро ставит фигуру на стол'
          : 'Крупье ИИ ставит фигуру на стол';
    }

    const actorName = playerName(turnPlayer, isAiMode, playerDisplayName);
    return phase === 'selectPiece'
      ? `${actorName} выбирает фигуру сопернику`
      : `${actorName} ставит фигуру на стол`;
  })();

  const statusHint = (() => {
    if (isTutorialMode && phase !== 'gameOver') {
      return tutorialStep === 'pickPieceForAi'
        ? 'Сначала выберите подсвеченную фигуру в резерве. ИИ сразу сделает ответный ход без ожидания.'
        : 'Теперь поставьте переданную вам фигуру в клетку 1-4. Так вы соберете ряд из четырех больших фигур.';
    }

    if (phase === 'gameOver') {
      return winner
        ? winningPattern
          ? 'Партия завершена. Новую партию можно начать из боковой панели.'
          : 'Партия завершена по времени. Новую партию можно начать из боковой панели.'
        : 'Никто не собрал выигрышную фигуру по активным правилам.';
    }

    if (isAiMode && turnPlayer === 2) {
      return phase === 'selectPiece'
        ? 'Крупье ИИ выбирает следующую фигуру для вас.'
        : isQuickMode
          ? 'Это ответ ИИ. Ваш таймер сейчас не идет.'
          : 'Крупье ИИ думает над постановкой фигуры.';
    }

    if (phase === 'selectPiece') {
      return isQuickMode
        ? 'Выберите фигуру в резерве. Она перейдет ИИ, и на этот ход у вас есть 15 секунд.'
        : 'Выберите фишку в резерве. Она перейдет следующему игроку.';
    }

    return activePiece
      ? isQuickMode
        ? 'Поставьте активную фигуру на свободную клетку за 15 секунд.'
        : 'Поставьте активную фигуру на свободную клетку.'
      : 'Ожидание активной фигуры.';
  })();

  const statusTone = (() => {
    if (isTutorialMode && phase !== 'gameOver') {
      return 'player-turn';
    }

    if (phase === 'gameOver') {
      if (winner === null) {
        return 'neutral';
      }

      return winner === 1 ? 'player-win' : 'opponent-win';
    }

    if (turnPlayer === 1) {
      return 'player-turn';
    }

    return 'opponent-turn';
  })();

  const statusBadge = (() => {
    if (isTutorialMode && phase !== 'gameOver') {
      return tutorialStep === 'pickPieceForAi' ? 'Обучение: выбор' : 'Обучение: победный ход';
    }

    if (phase === 'gameOver') {
      if (winner === null) {
        return 'Ничья';
      }

      return winner === 1 ? 'Вы победили' : isAiMode ? 'Победил ИИ' : 'Победил соперник';
    }

    if (turnPlayer === 1) {
      return 'Ваш ход';
    }

    return isAiMode ? 'Ход ИИ' : 'Ход соперника';
  })();
  const shouldPulseStatusTitle = isAiMode && turnPlayer === 1 && phase === 'selectPiece';
  const participants = isAiMode
    ? [
      { id: 1 as const, label: playerDisplayName, icon: 'И' },
      { id: 2 as const, label: 'Крупье', icon: 'К' },
    ]
    : [
      { id: 1 as const, label: playerDisplayName, icon: '1' },
      { id: 2 as const, label: 'Игрок 2', icon: '2' },
    ];

  const modeChipLabel = isTutorialMode
    ? 'Обучение'
    : isAiMode
      ? isQuickMode
        ? `Блиц ${aiDifficultyLabel(resolvedSettings.aiDifficulty)}`
        : `ИИ ${aiDifficultyLabel(resolvedSettings.aiDifficulty)}`
      : 'Локально';
  const rulesChipLabel = resolvedSettings.allowSquareWin ? 'Хардкор' : 'Классика';
  const elapsedLabel = formatElapsedTime(startedAt === null ? 0 : (pausedAt ?? finishedAt ?? clockNow) - startedAt);
  const quickTurnRemainingMs = isQuickMode && phase !== 'gameOver'
    ? turnStartedAt === null
      ? QUICK_TURN_LIMIT_MS
      : Math.max(0, QUICK_TURN_LIMIT_MS - ((pausedAt ?? clockNow) - turnStartedAt))
    : QUICK_TURN_LIMIT_MS;
  const quickTurnLabel = formatElapsedTime(quickTurnRemainingMs);
  const tableNumber = gameResults.length + 1;
  const availablePieceIds = useMemo(() => new Set(availablePieces.map((piece) => piece.id)), [availablePieces]);
  const exitingReservePieceIdSet = useMemo(() => new Set(exitingReservePieceIds), [exitingReservePieceIds]);
  const reservePieces = useMemo(() => {
    const availablePieceIdSet = new Set(availablePieces.map((piece) => piece.id));
    const basePieces = showUsedPieces
      ? initialPieces
      : initialPieces.filter((piece) => availablePieceIdSet.has(piece.id) || exitingReservePieceIdSet.has(piece.id));
    const filteredPieces = basePieces.filter((piece) =>
      (reserveFilters.color === 'all' || piece.color === reserveFilters.color) &&
      (reserveFilters.size === 'all' || piece.size === reserveFilters.size) &&
      (reserveFilters.shape === 'all' || piece.shape === reserveFilters.shape) &&
      (reserveFilters.top === 'all' || piece.top === reserveFilters.top)
    );

    const getSortValue = (piece: Piece) => {
      switch (reserveSort) {
        case 'color':
          return piece.color === 'light' ? '0' : '1';
        case 'size':
          return piece.size === 'small' ? '0' : '1';
        case 'shape':
          return piece.shape === 'round' ? '0' : '1';
        case 'top':
          return piece.top === 'hollow' ? '0' : '1';
        default:
          return '';
      }
    };

    if (reserveSort === 'default') {
      return filteredPieces;
    }

    return [...filteredPieces].sort((left, right) => {
      const leftValue = getSortValue(left);
      const rightValue = getSortValue(right);

      if (leftValue === rightValue) {
        return left.id - right.id;
      }

      return leftValue.localeCompare(rightValue);
    });
  }, [availablePieces, exitingReservePieceIdSet, initialPieces, reserveFilters, reserveSort, showUsedPieces]);
  const winningCellIds = useMemo(
    () => new Set((winningPattern?.cells ?? []).map(({ row, col }) => `${row}-${col}`)),
    [winningPattern]
  );
  const winningAttributeLabels = useMemo(() => {
    if (!winningPattern) {
      return [];
    }

    const winningPieces = winningPattern.cells
      .map(({ row, col }) => board[row][col])
      .filter((piece): piece is Piece => piece !== null);

    if (winningPieces.length === 0) {
      return [];
    }

    const firstPiece = winningPieces[0];
    const labels = {
      color: {
        light: 'светлые',
        dark: 'темные',
      },
      size: {
        small: 'маленькие',
        large: 'большие',
      },
      shape: {
        round: 'круглые',
        square: 'квадратные',
      },
      top: {
        hollow: 'полые',
        solid: 'сплошные',
      },
    } as const;

    return getSharedAttributes(board, winningPattern).map((attribute) => labels[attribute][firstPiece[attribute]]);
  }, [board, winningPattern]);
  const winningReasonTitle = winningAttributeLabels.length > 1 ? 'Победа по признакам' : 'Победа по признаку';
  const boardTurnLabel = phase === 'gameOver'
    ? null
    : `Ходит ${turnPlayer === 1 ? playerDisplayName : isAiMode ? 'Крупье ИИ' : playerName(turnPlayer, false, playerDisplayName)}`;
  const winnerOverlayTitle = winner
    ? winner === 1
      ? 'Вы победили'
      : isAiMode
        ? 'Крупье ИИ победил'
        : `Игрок ${winner} победил`
    : 'Ничья';
  const winnerOverlayHint = winningPattern
    ? isTutorialMode
      ? 'Урок завершен. Нажмите «Новая партия», чтобы перейти к игре против ИИ.'
      : winningPattern.type === 'square'
      ? 'Победный квадрат 2x2 подсвечен на поле.'
      : 'Победная линия подсвечена на поле.'
    : winner
      ? 'Партия завершена по времени.'
      : 'Партия завершена.';
  const isAiThinking = isAiMode && turnPlayer === 2 && phase !== 'gameOver';
  const tutorialTargetCells = useMemo(() => {
    if (!isTutorialMode || phase === 'gameOver') {
      return new Set<string>();
    }

    return tutorialStep === 'pickPieceForAi'
      ? new Set(['0-0', '0-1', '0-2'])
      : new Set(['0-0', '0-1', '0-2', '0-3']);
  }, [isTutorialMode, phase, tutorialStep]);
  const tutorialTargetPieceId = isTutorialMode && tutorialStep === 'pickPieceForAi' ? 4 : null;
  const handlePrimaryAction = () => {
    if (isTutorialMode && phase === 'gameOver') {
      clearStoredGameSession();
      onSessionPresenceChange(false);
      onStartGame({
        mode: 'ai',
        aiDifficulty: resolvedSettings.aiDifficulty,
        allowSquareWin: resolvedSettings.allowSquareWin,
      });
      return;
    }

    resetGame();
  };

  const handleSidebarPrimaryAction = () => {
    handlePrimaryAction();

    if (isMobileSidebarOverlay) {
      setIsLogOpen(false);
      setSidebarView('home');
    }
  };

  const handleResumeAfterIdle = () => {
    if (pausedAt !== null) {
      const now = Date.now();
      const pauseDuration = now - pausedAt;
      setStartedAt((current) => current === null ? null : current + pauseDuration);
      setTurnStartedAt((current) => current === null ? null : current + pauseDuration);
      if (startedAtRef.current !== null) {
        startedAtRef.current += pauseDuration;
      }
      setClockNow(now);
    }

    setPausedAt(null);
    setIsIdlePromptVisible(false);
  };

  const renderLogEntry = useCallback((entry: string) => {
    const match = entry.match(/^\[(\d{2}:\d{2})\]\s*(.*)$/);
    const time = match?.[1] ?? '';
    const body = match?.[2] ?? entry;
    const winnerTone = body.includes('Quarto!')
      ? body.includes('Крупье ИИ')
        ? 'opponent'
        : 'player'
      : null;
    const icon = body.includes('Quarto!')
      ? '✦'
      : body.includes('побеждает по времени') || body.includes('не уложился')
        ? '⏱'
        : body.includes('передает')
          ? '⇄'
          : body.includes('выбирает')
            ? '◈'
            : body.includes('ставит')
              ? '⬢'
              : '•';
    const eventLabel = body.includes('Quarto!')
      ? 'Quarto'
      : body.includes('побеждает по времени') || body.includes('не уложился')
        ? 'Таймер'
        : body.includes('выбирает')
          ? 'Выбор'
          : body.includes('ставит')
            ? 'Ход'
            : 'Событие';
    const eventIconPath = body.includes('Quarto!')
      ? 'M12 4l1.9 4.8L19 10.2l-4 3.3 1.3 5-4.3-2.6-4.3 2.6 1.3-5-4-3.3 5.1-1.4Z'
      : body.includes('побеждает по времени') || body.includes('не уложился')
        ? 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z'
        : body.includes('выбирает')
          ? 'M5 12h14M12 5l7 7-7 7'
          : body.includes('ставит')
            ? 'M7 7h10v10H7zM12 4v3M12 17v3M4 12h3M17 12h3'
            : 'M12 6v6M12 17h.01';

    const parts = body.split(new RegExp(`(${playerDisplayName}|Крупье ИИ|Quarto!)`, 'g'));

    return (
      <>
        <span className={`game-log-icon ${winnerTone ? `is-${winnerTone}` : ''}`} aria-hidden="true">
          {icon}
        </span>
        <div className="game-log-copy">
          <div className="game-log-meta">
            {time ? (
              <span className="game-log-chip game-log-time">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="game-log-chip-icon">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 2" />
                </svg>
                {time}
              </span>
            ) : null}
            <span className={`game-log-chip game-log-event ${winnerTone ? `is-${winnerTone}` : ''}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="game-log-chip-icon">
                <path d={eventIconPath} />
              </svg>
              {eventLabel}
            </span>
          </div>
          <span className="game-log-text">
            {parts.map((part, index) => {
              if (!part) {
                return null;
              }

              if (part === playerDisplayName) {
                return <strong key={`${part}-${index}`} className="game-log-name is-player">{part}</strong>;
              }

              if (part === 'Крупье ИИ') {
                return <strong key={`${part}-${index}`} className="game-log-name is-opponent">{part}</strong>;
              }

              if (part === 'Quarto!') {
                return <strong key={`${part}-${index}`} className={`game-log-quarto ${winnerTone ? `is-${winnerTone}` : ''}`}>{part}</strong>;
              }

              return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
            })}
          </span>
        </div>
      </>
    );
  }, [playerDisplayName]);

  const profileGameResults = gameResults;
  const profileStats = useMemo(() => {
    const totalGames = profileGameResults.length;
    const wins = profileGameResults.filter((result) => result.summary.includes(`${playerDisplayName} победил`)).length;
    const losses = profileGameResults.filter((result) => !result.summary.includes(`${playerDisplayName} победил`) && !result.summary.includes('вничью')).length;
    const draws = totalGames - wins - losses;

    const totals = profileGameResults.reduce((acc, result) => {
      const durationBadge = result.badges.find((badge) => badge.startsWith('Время '));
      const movesBadge = result.badges.find((badge) => badge.endsWith(' ходов'));
      const durationSeconds = durationBadge ? parseDurationLabelToSeconds(durationBadge.replace('Время ', '')) : 0;
      const moves = movesBadge ? Number.parseInt(movesBadge, 10) || 0 : 0;

      return {
        durationSeconds: acc.durationSeconds + durationSeconds,
        moves: acc.moves + moves,
      };
    }, { durationSeconds: 0, moves: 0 });

    const averageMoveSeconds = totals.moves > 0 ? Math.round(totals.durationSeconds / totals.moves) : 0;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const skillFactor = totalGames > 0 ? (wins / totalGames) : 0;
    const fastestWinSeconds = profileGameResults
      .filter((result) => result.summary.includes(`${playerDisplayName} победил`))
      .map((result) => {
        const durationBadge = result.badges.find((badge) => badge.startsWith('Время '));
        return durationBadge ? parseDurationLabelToSeconds(durationBadge.replace('Время ', '')) : Number.POSITIVE_INFINITY;
      })
      .reduce((best, current) => Math.min(best, current), Number.POSITIVE_INFINITY);

    return {
      totalGames,
      wins,
      losses,
      draws,
      winRateLabel: `${winRate}%`,
      skillLabel: skillFactor.toFixed(2),
      averageMoveLabel: totals.moves > 0 ? formatElapsedTime(averageMoveSeconds * 1000) : '00:00',
      fastestWinLabel: Number.isFinite(fastestWinSeconds) ? formatElapsedTime(fastestWinSeconds * 1000) : '—',
    };
  }, [playerDisplayName, profileGameResults]);
  const isProfileDirty =
    profileNameDraft.trim() !== playerProfile.name ||
    profileAvatarDraft !== playerProfile.avatarBase64 ||
    profilePieceSetDraft !== playerProfile.pieceSet;

  const cycleReserveFilter = useCallback((filterKey: keyof ReserveFilters) => {
    setReserveFilters((current) => {
      const sequence = reserveFilterCycle[filterKey] as readonly string[];
      const currentIndex = sequence.indexOf(current[filterKey]);
      const nextValue = sequence[(currentIndex + 1) % sequence.length];
      return {
        ...current,
        [filterKey]: nextValue as ReserveFilters[typeof filterKey],
      };
    });
  }, []);

  const handleProfileAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsAvatarProcessing(true);
    try {
      const compressedBase64 = await compressImageToBase64(file);
      setProfileAvatarDraft(compressedBase64);
      showToast('Аватар подготовлен. Нажмите «Сохранить профиль».');
    } catch {
      showToast('Не удалось обработать изображение профиля.');
    } finally {
      setIsAvatarProcessing(false);
    }
  };

  const handleProfileSave = () => {
    const nextName = profileNameDraft.trim() || 'Игрок';
    setPlayerProfile({
      name: nextName,
      avatarBase64: profileAvatarDraft,
      pieceSet: profilePieceSetDraft,
    });
    setProfileNameDraft(nextName);
    showToast('Профиль сохранен.');
  };

  return (
    <div className="game-screen">
      <div className="game-workspace">
        {isLogOpen && (
          <button
            type="button"
            aria-label="Закрыть меню партии"
            className="game-sidebar-mobile-backdrop"
            onClick={() => setIsLogOpen(false)}
          />
        )}
        <aside className={`game-log-sidebar ${isLogOpen ? 'is-open' : 'is-collapsed'}`}>
          <div className={`game-log-rail ${isLogOpen ? 'is-open' : ''}`}>
            {isLogOpen && (
              <h2 className="game-log-title">Меню партии</h2>
            )}
            <button
              type="button"
              aria-label={isLogOpen ? 'Свернуть сайдбар' : 'Открыть сайдбар'}
              onClick={() => setIsLogOpen((current) => !current)}
              className={`game-log-toggle ${isLogOpen ? 'is-open' : ''}`}
            >
              <span className="game-log-toggle-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>

          {isLogOpen && (
            <>
              {sidebarView === 'home' ? (
                <div className="game-sidebar-home">
                  <button type="button" onClick={onBackToMenu} className="game-btn game-btn-ghost game-log-action-btn">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="game-btn-icon">
                      <path d="M14.5 5.5L8 12l6.5 6.5" />
                    </svg>
                    <span>К выбору игры</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSidebarPrimaryAction}
                    className="game-btn game-btn-gold game-log-action-btn"
                    disabled={!isRoundStarted}
                  >
                    {isRoundStarted ? 'Новая партия' : 'Новая партия начата'}
                  </button>
                  <button type="button" className="game-sidebar-menu-item" onClick={() => setSidebarView('profile')}>
                    <span>Профиль</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="game-btn-icon">
                      <path d="M9.5 5.5L16 12l-6.5 6.5" />
                    </svg>
                  </button>
                  <button type="button" className="game-sidebar-menu-item" onClick={() => setSidebarView('log')}>
                    <span>Лог партии</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="game-btn-icon">
                      <path d="M9.5 5.5L16 12l-6.5 6.5" />
                    </svg>
                  </button>
                </div>
              ) : sidebarView === 'profile' ? (
                <div className="game-profile-panel">
                  <div className="game-sidebar-view-head">
                    <button
                      type="button"
                      className="game-sidebar-back"
                      onClick={() => setSidebarView('home')}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="game-btn-icon">
                        <path d="M14.5 5.5L8 12l6.5 6.5" />
                      </svg>
                    </button>
                    <h3>Профиль</h3>
                  </div>
                  <div className="game-profile-card">
                    {isProfileDirty && (
                      <button
                        type="button"
                        className="game-profile-save-icon"
                        onClick={handleProfileSave}
                        aria-label="Сохранить профиль"
                        title="Сохранить профиль"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="game-btn-icon">
                          <path d="M5 12.5l4.2 4.2L19 7" />
                        </svg>
                      </button>
                    )}
                    <div className="game-profile-avatar-wrap">
                      {profileAvatarDraft ? (
                        <img src={profileAvatarDraft} alt="Аватар игрока" className="game-profile-avatar" />
                      ) : (
                        <div className="game-profile-avatar game-profile-avatar-placeholder">
                          {profileNameDraft.trim().slice(0, 1).toUpperCase() || 'И'}
                        </div>
                      )}
                    </div>
                    <div className="game-profile-main">
                      <label className="game-profile-field">
                        <span>Имя игрока</span>
                        <input
                          type="text"
                          value={profileNameDraft}
                          onChange={(event) => setProfileNameDraft(event.target.value)}
                          maxLength={24}
                          placeholder="Введите имя"
                        />
                      </label>
                    </div>
                    <label className="game-profile-upload game-profile-upload-full">
                      <input type="file" accept="image/*" onChange={handleProfileAvatarChange} />
                      <span>{isAvatarProcessing ? 'Сжимаем аватар...' : 'Загрузить аватар'}</span>
                    </label>
                    <div className="game-profile-field game-profile-piece-set-field">
                      <span>Набор фигур</span>
                      <div className="game-piece-set-picker">
                        <button
                          type="button"
                          className={`game-piece-set-option ${profilePieceSetDraft === 'classic' ? 'is-active' : ''}`}
                          onClick={() => setProfilePieceSetDraft('classic')}
                        >
                          <div className="game-piece-set-preview">
                            <PieceComponent
                              piece={{ id: 1, color: 'light', size: 'small', shape: 'round', top: 'hollow' }}
                              size="small"
                              variant="classic"
                            />
                            <PieceComponent
                              piece={{ id: 2, color: 'dark', size: 'large', shape: 'square', top: 'solid' }}
                              size="small"
                              variant="classic"
                            />
                          </div>
                          <div className="game-piece-set-copy">
                            <strong>Классика</strong>
                            <span>Объемные фигурки</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          className={`game-piece-set-option ${profilePieceSetDraft === 'modern' ? 'is-active' : ''}`}
                          onClick={() => setProfilePieceSetDraft('modern')}
                        >
                          <div className="game-piece-set-preview">
                            <PieceComponent
                              piece={{ id: 3, color: 'light', size: 'small', shape: 'round', top: 'hollow' }}
                              size="small"
                              variant="modern"
                            />
                            <PieceComponent
                              piece={{ id: 4, color: 'dark', size: 'large', shape: 'square', top: 'solid' }}
                              size="small"
                              variant="modern"
                            />
                          </div>
                          <div className="game-piece-set-copy">
                            <strong>Модерн</strong>
                            <span>Тотемные строгие формы</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="game-profile-stats">
                    <div className="game-profile-stat-card">
                      <span>Победы</span>
                      <strong>{profileStats.wins}</strong>
                    </div>
                    <div className="game-profile-stat-card">
                      <span>Поражения</span>
                      <strong>{profileStats.losses}</strong>
                    </div>
                    <div className="game-profile-stat-card">
                      <span>Сыграно игр</span>
                      <strong>{profileStats.totalGames}</strong>
                    </div>
                    <div className="game-profile-stat-card">
                      <span>Win rate</span>
                      <strong>{profileStats.winRateLabel}</strong>
                    </div>
                    <div className="game-profile-stat-card">
                      <span>Скилл</span>
                      <strong>{profileStats.skillLabel}</strong>
                    </div>
                    <div className="game-profile-stat-card">
                      <span>Средний ход</span>
                      <strong>{profileStats.averageMoveLabel}</strong>
                    </div>
                    <div className="game-profile-stat-card">
                      <span>Быстрая победа</span>
                      <strong>{profileStats.fastestWinLabel}</strong>
                    </div>
                    <div className="game-profile-stat-card">
                      <span>Ничьих</span>
                      <strong>{profileStats.draws}</strong>
                    </div>
                  </div>

                  <div className="game-log-stream-head">
                    <p className="game-kicker">Ваши партии</p>
                  </div>
                  <div className="game-results-list">
                    {profileGameResults.length > 0 ? (
                      profileGameResults.map((result) => (
                        <div key={result.id} className="game-result-card">
                          <div className="game-result-summary">{result.summary}</div>
                          <div className="game-result-meta">{result.meta}</div>
                          <div className="game-result-badges">
                            <span className="game-result-badge is-accent">
                              {result.rules}
                            </span>
                            {result.badges.map((badge) => (
                              <span key={`${result.id}-${badge}`} className="game-result-badge">
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="game-result-empty">Здесь появятся итоги партий с вашим участием.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="game-sidebar-log-panel">
                  <div className="game-sidebar-view-head">
                    <button
                      type="button"
                      className="game-sidebar-back"
                      onClick={() => setSidebarView('home')}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="game-btn-icon">
                        <path d="M14.5 5.5L8 12l6.5 6.5" />
                      </svg>
                    </button>
                    <h3>Лог партии</h3>
                  </div>
                  <div className="game-log-list">
                    {moveLog.map((entry, index) => (
                      <div key={`${entry}-${index}`} className="game-log-entry">
                        {renderLogEntry(entry)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

        <section className="game-shell">
        <header className="game-topbar">
          <div className="game-brand">
            <p className="game-brand-inline">Стол № {tableNumber}</p>
          </div>

          <div className="game-title">
            <div className="game-title-emblem">
              <span className="game-title-emblem-cap">Casino table</span>
              <h2>Quarto Royale</h2>
            </div>
          </div>

          <div className="game-settings">
            <div className="game-settings-list">
              <div className="game-settings-menu">
                <button
                  type="button"
                  className={`game-settings-chip ${isAiMode ? 'is-interactive' : ''}`}
                  onClick={() => {
                    if (isAiMode) {
                      setOpenSettingsMenu((current) => current === 'difficulty' ? null : 'difficulty');
                    }
                  }}
                  disabled={!isAiMode}
                >
                  {isAiMode ? <HeaderDifficultyIcon difficulty={resolvedSettings.aiDifficulty} /> : <HeaderModeIcon />}
                  <span>{modeChipLabel}</span>
                </button>
                {isAiMode && openSettingsMenu === 'difficulty' && (
                  <div className="game-settings-dropdown">
                    {(['easy', 'medium', 'hard', 'adaptive'] as const).map((difficulty) => (
                      <button
                        key={difficulty}
                        type="button"
                        className={`game-settings-option ${resolvedSettings.aiDifficulty === difficulty ? 'is-active' : ''}`}
                        onClick={() => updateSettings({ aiDifficulty: difficulty })}
                      >
                        <HeaderDifficultyIcon difficulty={difficulty} />
                        {difficulty === 'adaptive' ? 'учится' : difficulty}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="game-settings-menu">
                <button
                  type="button"
                  className="game-settings-chip is-interactive"
                  onClick={() => setOpenSettingsMenu((current) => current === 'rules' ? null : 'rules')}
                >
                  {resolvedSettings.allowSquareWin ? <HeaderRulesHardcoreIcon /> : <HeaderRulesClassicIcon />}
                  <span>{rulesChipLabel}</span>
                </button>
                {openSettingsMenu === 'rules' && (
                  <div className="game-settings-dropdown">
                    <button
                      type="button"
                      className={`game-settings-option ${resolvedSettings.allowSquareWin ? 'is-active' : ''}`}
                      onClick={() => updateSettings({ allowSquareWin: true })}
                    >
                      Линии + квадрат 2x2
                    </button>
                    <button
                      type="button"
                      className={`game-settings-option ${!resolvedSettings.allowSquareWin ? 'is-active' : ''}`}
                      onClick={() => updateSettings({ allowSquareWin: false })}
                    >
                      Только линии
                    </button>
                  </div>
                )}
              </div>
              <span className="game-settings-chip game-time-chip">
                <HeaderClockIcon />
                <span>{elapsedLabel}</span>
              </span>
              {isQuickMode && (
                <span className={`game-settings-chip game-time-chip ${quickTurnRemainingMs <= 5000 ? 'is-warning' : ''}`}>
                  <HeaderClockIcon />
                  <span>{turnPlayer === 1 && phase !== 'gameOver' ? quickTurnLabel : 'ожидание'}</span>
                </span>
              )}
              <span className="game-settings-chip">
                <HeaderPiecesIcon />
                <span>{availablePieces.length}</span>
              </span>
            </div>
          </div>
        </header>

        <section className={`game-status ${phase === 'gameOver' ? 'is-game-over' : ''} is-${statusTone}`}>
          <div className="game-status-copy" key={`${statusBadge}-${statusTitle}-${statusHint}`}>
            <div className="game-status-badge">{statusBadge}</div>
            <div className={`game-status-title ${shouldPulseStatusTitle ? 'is-pulsing' : ''}`}>{statusTitle}</div>
            <div className="game-status-hint">{statusHint}</div>
            {isAiThinking && (
              <div className="game-status-loader" aria-live="polite">
                <span className="game-status-spinner" aria-hidden="true" />
                <span>ИИ думает...</span>
              </div>
            )}
          </div>
          <div className="game-status-actions">
            <div className="game-turn-indicator" aria-label="Текущий игрок">
              {participants.map((participant) => {
                const isActive = phase !== 'gameOver' && turnPlayer === participant.id;
                const isWinner = phase === 'gameOver' && winner === participant.id;

                return (
                  <div
                    key={participant.id}
                    className={`game-turn-avatar ${isActive ? 'is-active' : ''} ${isWinner ? 'is-winner' : ''}`}
                  >
                    <div className="game-turn-avatar-mark">
                      {participant.id === 1 && playerProfile.avatarBase64 ? (
                        <img src={playerProfile.avatarBase64} alt={participant.label} className="game-turn-avatar-image" />
                      ) : (
                        participant.icon
                      )}
                    </div>
                    <span>{participant.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="game-active-piece">
              <div
                key={`active-piece-${activePiece?.id ?? 'empty'}-${phase}-${turnPlayer}`}
                draggable={Boolean(activePiece && phase === 'placePiece' && (!isAiMode || turnPlayer === 1))}
                onDragStart={() => {
                  if (activePiece) {
                    setDraggedPieceId(activePiece.id);
                  }
                }}
                onDragEnd={() => setDraggedPieceId(null)}
                className={`game-active-chip game-active-animated ${
                  activePiece && phase === 'placePiece' && (!isAiMode || turnPlayer === 1) ? 'is-draggable' : ''
                } ${!activePiece ? 'is-empty' : ''}`}
              >
                {activePiece ? (
                  <PieceComponent piece={activePiece} size="large" variant={playerProfile.pieceSet} />
                ) : (
                  <span className="game-active-plus">+</span>
                )}
              </div>
              <p className={!activePiece ? 'is-placeholder' : ''}>
                {activePiece ? pieceLabel(activePiece) : 'Выбранная фигура'}
              </p>
            </div>
          </div>
        </section>

        <section className="game-main">
          <aside className="game-reserve">
            <div className="game-section-head game-section-head-reserve">
              <div className="game-section-title game-section-title-reserve">
                <h3>Резерв</h3>
                <span className="game-section-meta">{availablePieces.length} фигур</span>
              </div>
              <div className="game-reserve-controls">
                <label className="game-toggle" title="Скрывать уже использованные фигуры">
                    <input
                      type="checkbox"
                      checked={!showUsedPieces}
                      onChange={(event) => {
                        const nextShowUsedPieces = !event.target.checked;
                        if (nextShowUsedPieces) {
                          setExitingReservePieceIds([]);
                        } else {
                          const hiddenIds = initialPieces
                            .filter((piece) => !availablePieceIds.has(piece.id))
                            .map((piece) => piece.id);
                          setExitingReservePieceIds(hiddenIds);
                        }
                        setShowUsedPieces(nextShowUsedPieces);
                      }}
                    />
                  <span>Скрыть выбывшие</span>
                </label>

                <div className="game-settings-menu">
                  <button
                    type="button"
                    className="game-settings-chip is-interactive"
                    onClick={() => setOpenReserveMenu((current) => current === 'sort' ? null : 'sort')}
                  >
                    {reserveSortLabels[reserveSort]}
                  </button>
                  {openReserveMenu === 'sort' && (
                    <div className="game-settings-dropdown reserve-dropdown">
                      {(Object.keys(reserveSortLabels) as ReserveSortKey[]).map((sortKey) => (
                        <button
                          key={sortKey}
                          type="button"
                          className={`game-settings-option ${reserveSort === sortKey ? 'is-active' : ''}`}
                          onClick={() => {
                            setReserveSort(sortKey);
                            setOpenReserveMenu(null);
                          }}
                        >
                          {reserveSortLabels[sortKey]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="game-reserve-filter-strip" aria-label="Фильтры резерва">
                {(Object.keys(reserveFilterMeta) as Array<keyof ReserveFilters>).map((filterKey) => {
                  const meta = reserveFilterMeta[filterKey];
                  const currentValue = reserveFilters[filterKey];
                  const isActive = currentValue !== 'all';
                  const icon = (() => {
                    if (filterKey === 'color') {
                      return (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
                          <path d="M12 3v18" />
                        </svg>
                      );
                    }

                    if (filterKey === 'size') {
                      return (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 15V9" />
                          <path d="M18 19V5" />
                          <path d="M4 9h4" />
                          <path d="M16 5h4" />
                          <path d="M4 15h4" />
                          <path d="M16 19h4" />
                        </svg>
                      );
                    }

                    if (filterKey === 'shape') {
                      return (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="8" cy="12" r="3.25" />
                          <rect x="13" y="8.5" width="6.5" height="6.5" rx="1.2" />
                        </svg>
                      );
                    }

                    return (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <ellipse cx="12" cy="12" rx="6.5" ry="4.5" />
                        <ellipse cx="12" cy="12" rx="2.4" ry="1.7" />
                      </svg>
                    );
                  })();

                  return (
                    <button
                      key={filterKey}
                      type="button"
                      className={`game-reserve-filter-toggle ${isActive ? 'is-active' : ''}`}
                      title={`${meta.label}: ${meta.states[currentValue]}`}
                      onClick={() => cycleReserveFilter(filterKey)}
                    >
                      <span className="game-reserve-filter-icon">{icon}</span>
                      <span className="game-reserve-filter-copy">
                        <span className="game-reserve-filter-label">{meta.label}</span>
                        <strong>{meta.states[currentValue]}</strong>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="game-reserve-grid">
              {reservePieces.map((piece) => {
                const isAvailable = availablePieceIds.has(piece.id);
                const isTemporarilyLocked = phase !== 'selectPiece' || (isAiMode && turnPlayer === 2);
                const isLocked = !isAvailable || isTemporarilyLocked;
                const isTutorialTarget = tutorialTargetPieceId === piece.id;

                return (
                  <button
                    key={piece.id}
                    type="button"
                    onClick={() => handleReserveSelect(piece, isAvailable, isTemporarilyLocked)}
                    className={`game-reserve-item ${isLocked ? 'is-locked' : ''} ${!isAvailable ? 'is-used' : ''} ${isTutorialTarget ? 'is-tutorial-target' : ''} ${pickedReservePieceId === piece.id ? 'is-picked' : ''} ${pickedReservePieceId === piece.id && pickedReserveActor === 'player' ? 'is-picked-player' : ''} ${pickedReservePieceId === piece.id && pickedReserveActor === 'opponent' ? 'is-picked-opponent' : ''} ${aiReserveHoverId === piece.id ? 'is-ai-hover' : ''} ${aiReserveHoverId === piece.id && turnPlayer === 2 ? 'is-ai-hover-opponent' : ''} ${exitingReservePieceIdSet.has(piece.id) && !showUsedPieces ? 'is-hiding' : ''}`}
                  >
                    <span className="game-piece-id">{piece.id}</span>
                    <div className="game-reserve-piece">
                      <PieceComponent piece={piece} size="small" variant={playerProfile.pieceSet} />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="game-board-panel">
            <div className="game-section-head">
              <div className="game-board-head">
                <h3>Поле</h3>
              </div>
            </div>
            <div className={`game-board-surface ${isAiThinking ? 'is-waiting' : ''}`}>
              {boardTurnLabel && (
                <div className={`game-board-turn-banner ${turnPlayer === 1 ? 'is-player' : 'is-opponent'}`}>
                  {boardTurnLabel}
                </div>
              )}
              {winningAttributeLabels.length > 0 && (
                <div className="game-board-win-banner">
                  <span className="game-board-win-kicker">{winningReasonTitle}</span>
                  <strong>{winningAttributeLabels.join(', ')}</strong>
                </div>
              )}
              {phase === 'gameOver' && winner && isWinnerOverlayVisible && (
                <div className="game-board-result-overlay">
                  <div className="game-board-result-card">
                    <p className="game-kicker">Раунд завершен</p>
                    <h4>{winnerOverlayTitle}</h4>
                    <p>{winnerOverlayHint}</p>
                    {winningAttributeLabels.length > 0 && (
                      <div className="game-board-result-reason">
                        <span>{winningReasonTitle}</span>
                        <strong>{winningAttributeLabels.join(', ')}</strong>
                      </div>
                    )}
                    <div className="game-board-result-actions">
                      <button
                        type="button"
                        className="game-btn game-btn-gold"
                        onClick={handlePrimaryAction}
                      >
                        Новая партия
                      </button>
                      <button
                        type="button"
                        className="game-btn game-btn-ghost"
                        onClick={() => setIsWinnerOverlayVisible(false)}
                      >
                        Скрыть
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="game-board-grid">
                {board.map((row, rowIndex) =>
                  row.map((cellPiece, colIndex) => {
                      const canPlaceHere = phase === 'placePiece' && !cellPiece && (!isAiMode || turnPlayer === 1);
                      const cellId = `${rowIndex}-${colIndex}`;
                      const isWinningCell = winningCellIds.has(cellId);
                      const isTutorialCell = tutorialTargetCells.has(cellId);
                      const isJustPlaced = lastPlacedCellId === cellId;

                      return (
                        <button
                        key={`${rowIndex}-${colIndex}`}
                        type="button"
                        onClick={() => handleDropOnCell({ row: rowIndex, col: colIndex })}
                        onDragOver={(event) => {
                          if (canPlaceHere) {
                            event.preventDefault();
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          handleDropOnCell({ row: rowIndex, col: colIndex });
                        }}
                          className={`game-board-cell ${cellPiece ? 'is-filled' : ''} ${canPlaceHere ? 'is-target' : ''} ${isWinningCell ? 'is-winning' : ''} ${isTutorialCell ? 'is-tutorial' : ''} ${isJustPlaced ? 'is-just-placed' : ''}`}
                        >
                          <span className="game-board-cell-id">{rowIndex + 1}-{colIndex + 1}</span>
                          {cellPiece ? (
                            <div className={`game-board-piece ${isJustPlaced ? 'is-entering' : ''}`}>
                              <PieceComponent piece={cellPiece} size="large" variant={playerProfile.pieceSet} />
                            </div>
                        ) : activePiece && canPlaceHere ? (
                          <div className="game-board-preview">
                            <PieceComponent piece={activePiece} size="large" variant={playerProfile.pieceSet} />
                          </div>
                        ) : (
                          <span className="game-board-plus">+</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </section>
      </section>
      </div>

      <div className="game-toast-stack" aria-live="polite">
        {toastMessages.map((toast) => (
          <div key={toast.id} className="game-toast">
            {toast.text}
          </div>
        ))}
      </div>

      {isIdlePromptVisible && (
        <div className="game-idle-overlay">
          <div className="game-idle-card">
            <p className="game-kicker">Пауза</p>
            <h3>Вы еще здесь?</h3>
            <p>Мы поставили партию на паузу после трех минут без движения. Продолжим с того же места.</p>
            <button
              type="button"
              className="game-btn game-btn-gold"
              onClick={handleResumeAfterIdle}
            >
              Продолжить игру
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
