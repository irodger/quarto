import type { GameSettings } from '../../types/game';

export const HeaderModeIcon = () => (
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

export const HeaderDifficultyIcon = ({ difficulty }: { difficulty: GameSettings['aiDifficulty'] }) => {
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

export const HeaderRulesClassicIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <path d="M5 5l14 14M19 5L5 19M5 12h14M12 5v14" />
  </svg>
);

export const HeaderRulesHardcoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
  </svg>
);

export const HeaderClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <circle cx="12" cy="12" r="7" />
    <path d="M12 8v4l3 2" />
  </svg>
);

export const HeaderPiecesIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="game-chip-icon">
    <path d="M6 8.5h5.5V14H6zM12.5 10h5.5v5.5h-5.5zM7.5 15h5.5v3.5H7.5z" />
  </svg>
);
