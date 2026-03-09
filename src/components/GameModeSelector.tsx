import React, { useState } from 'react';
import type { GameSettings } from '../types/game';
import './GameModeSelector.css';

interface GameModeSelectorProps {
  onStartGame: (settings: GameSettings) => void;
  onContinueGame: () => void;
  hasSavedGame: boolean;
  initialSettings: GameSettings | null;
}

type ModeCard = {
  id: GameSettings['mode'];
  title: string;
  meta: string;
  description: string;
  disabled?: boolean;
  icon: React.ReactNode;
};

const iconClassName = 'mode-icon';

const RobotIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <rect x="6" y="7" width="12" height="10" rx="3" />
    <path d="M12 4v3M9 12h.01M15 12h.01M9 17v2M15 17v2M6 12H4M20 12h-2" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <path d="M8 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6ZM16 12a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Z" />
    <path d="M3.5 18.5c.9-2.3 2.8-3.5 4.5-3.5s3.6 1.2 4.5 3.5M13 18.5c.7-1.8 2.2-2.8 3.7-2.8c1.4 0 2.8.9 3.8 2.8" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <circle cx="12" cy="12" r="8" />
    <path d="M4.5 12h15M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <path d="M8 4h8v3a4 4 0 0 1-8 0Z" />
    <path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M12 11v4M9 19h6" />
  </svg>
);

const SparkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7Z" />
  </svg>
);

const SlidersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <path d="M5 6h14M5 18h14M8 6v8M16 10v8" />
    <circle cx="8" cy="15" r="2" />
    <circle cx="16" cy="9" r="2" />
  </svg>
);

const DifficultyBarsIcon = ({ level, color }: { level: 1 | 2 | 3; color: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`${iconClassName} mode-difficulty-icon`}>
    <rect x="4" y="6" width="4" height="12" rx="2" fill={level >= 1 ? color : 'rgb(255 255 255 / 0.1)'} />
    <rect x="10" y="4" width="4" height="14" rx="2" fill={level >= 2 ? color : 'rgb(255 255 255 / 0.1)'} />
    <rect x="16" y="2" width="4" height="16" rx="2" fill={level >= 3 ? color : 'rgb(255 255 255 / 0.1)'} />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`${iconClassName} mode-difficulty-icon`}>
    <path
      d="M9 5.5a3 3 0 0 1 5.4-1.8A3.4 3.4 0 0 1 19 7a3.2 3.2 0 0 1-1.4 2.6A3.4 3.4 0 0 1 18 11a3.5 3.5 0 0 1-3.5 3.5H10A4 4 0 0 1 6 10.5c0-.5.1-1 .3-1.4A3.2 3.2 0 0 1 5 6.5A3.5 3.5 0 0 1 9 5.5Z"
      fill="#8b5cf6"
    />
    <path d="M10 7.5c-1 0-1.8.8-1.8 1.8M13.2 6.8c.8 0 1.5.6 1.5 1.4M11.3 10v4M8.8 10.6h5.7" stroke="#efe7ff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const DifficultyIcon = ({ difficulty }: { difficulty: GameSettings['aiDifficulty'] }) => {
  if (difficulty === 'easy') {
    return <DifficultyBarsIcon level={1} color="#34d399" />;
  }

  if (difficulty === 'medium') {
    return <DifficultyBarsIcon level={2} color="#60a5fa" />;
  }

  if (difficulty === 'hard') {
    return <DifficultyBarsIcon level={3} color="#f87171" />;
  }

  return <BrainIcon />;
};

const ExpandedRulesIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
  </svg>
);

const ClassicRulesIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <path d="M5 5l14 14M19 5L5 19M5 12h14M12 5v14" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
    <path d="M6 5.5h10.5A2.5 2.5 0 0 1 19 8v10.5H8.5A2.5 2.5 0 0 0 6 21V5.5Z" />
    <path d="M6 5.5v13A2.5 2.5 0 0 1 8.5 16H19" />
  </svg>
);

const modeCards: ModeCard[] = [
  {
    id: 'tutorial',
    title: 'Обучение',
    meta: 'Новый режим',
    description: 'Пошаговый урок с подсветкой и гарантированной победой пользователя.',
    icon: <BookIcon />,
  },
  {
    id: 'ai',
    title: 'С ИИ',
    meta: 'Основной режим',
    description: 'Быстрая партия против ИИ с выбором уровня.',
    icon: <RobotIcon />,
  },
  {
    id: 'quick',
    title: 'Быстрая игра',
    meta: '15 сек/ход',
    description: 'Блиц против ИИ: на каждый ваш ход есть только 15 секунд.',
    icon: <SparkIcon />,
  },
  {
    id: 'local',
    title: 'Локально',
    meta: '2 игрока',
    description: 'Одна доска, два игрока, тот же набор правил.',
    icon: <UsersIcon />,
  },
  {
    id: 'network',
    title: 'Сеть',
    meta: 'Скоро',
    description: 'Пока не активен.',
    disabled: true,
    icon: <GlobeIcon />,
  },
  {
    id: 'tournament',
    title: 'Турнир',
    meta: 'Скоро',
    description: 'Пока не активен.',
    disabled: true,
    icon: <TrophyIcon />,
  },
];

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  onStartGame,
  onContinueGame,
  hasSavedGame,
  initialSettings,
}) => {
  const [aiDifficulty, setAiDifficulty] = useState<GameSettings['aiDifficulty']>(initialSettings?.aiDifficulty ?? 'medium');
  const [allowSquareWin, setAllowSquareWin] = useState(initialSettings?.allowSquareWin ?? true);
  const aiDifficultyLabel = aiDifficulty === 'adaptive' ? 'учится' : aiDifficulty;
  const rulesSummary = allowSquareWin ? 'Победа по линии или квадрату 2x2' : 'Победа только по линии';
  const activeRulesIcon = allowSquareWin ? <ExpandedRulesIcon /> : <ClassicRulesIcon />;
  const difficultyHint = aiDifficulty === 'easy'
    ? 'Easy подходит для первой партии: ИИ чаще ошибается и дает больше пространства.'
    : aiDifficulty === 'medium'
      ? 'Medium держит баланс: ошибки встречаются реже, но игра не уходит в жесткую оборону.'
      : aiDifficulty === 'hard'
        ? 'Hard играет плотнее: лучше режет опасные раздачи и чаще наказывает за просчеты.'
        : 'Обучаемый ИИ запоминает ваши партии и подстраивает защиту под любимые ловушки и признаки.';
  const primaryLaunchMode =
    initialSettings?.mode && !['network', 'tournament'].includes(initialSettings.mode)
      ? initialSettings.mode
      : 'ai';

  const handleModeSelect = (mode: GameSettings['mode']) => {
    if (mode === 'network' || mode === 'tournament') {
      return;
    }

    onStartGame({
      mode,
      aiDifficulty: mode === 'ai' || mode === 'quick' ? aiDifficulty : 'easy',
      allowSquareWin,
    });
  };

  return (
    <section className="mode-screen">
      <div className="mode-shell">
        <header className="mode-header">
          <div className="mode-brand">
            <p className="mode-kicker">Quarto Royale</p>
            <h1>Новая партия</h1>
          </div>
          <div className="mode-summary">
            <span className="mode-summary-chip">4x4</span>
            <span className="mode-summary-chip">{allowSquareWin ? 'Квадрат 2x2 включен' : 'Классические линии'}</span>
            <span className="mode-summary-chip">Компактный старт</span>
          </div>
        </header>

        <div className="mode-main">
          <aside className="mode-sidebar">
            <section className="mode-panel">
              <div className="mode-panel-head">
                <div className="mode-panel-label">
                  <SparkIcon />
                  <p className="mode-kicker">Правила</p>
                </div>
                <span className="mode-caption">{rulesSummary}</span>
              </div>
              <div className="mode-pill-row mode-pill-row-rules">
                <button
                  type="button"
                  className={`mode-pill ${allowSquareWin ? 'is-active' : ''}`}
                  onClick={() => setAllowSquareWin(true)}
                >
                  <ExpandedRulesIcon />
                  Хардкор
                </button>
                <button
                  type="button"
                  className={`mode-pill ${!allowSquareWin ? 'is-active' : ''}`}
                  onClick={() => setAllowSquareWin(false)}
                >
                  <ClassicRulesIcon />
                  Классика
                </button>
              </div>
              <div className="mode-rules-note">
                <p>
                  Соберите 4 фигуры с хотя бы одним общим признаком:
                  цвет, размер, форма или верх.
                </p>
                <p>
                  {allowSquareWin
                    ? 'В расширенном режиме победой также считается квадрат 2x2 с общим признаком.'
                    : 'В классике засчитываются только горизонтали, вертикали и диагонали.'}
                </p>
              </div>
            </section>

            <section className="mode-panel">
              <div className="mode-panel-head">
                <div className="mode-panel-label mode-panel-label-nowrap">
                  <SlidersIcon />
                  <p className="mode-kicker">Сложность ИИ</p>
                </div>
              </div>
              <div className="mode-pill-row mode-pill-row-difficulty">
                <button
                  type="button"
                  className={`mode-pill ${aiDifficulty === 'easy' ? 'is-active' : ''}`}
                  onClick={() => setAiDifficulty('easy')}
                >
                  <DifficultyIcon difficulty="easy" />
                  Easy
                </button>
                <button
                  type="button"
                  className={`mode-pill ${aiDifficulty === 'medium' ? 'is-active' : ''}`}
                  onClick={() => setAiDifficulty('medium')}
                >
                  <DifficultyIcon difficulty="medium" />
                  Medium
                </button>
                <button
                  type="button"
                  className={`mode-pill ${aiDifficulty === 'hard' ? 'is-active' : ''}`}
                  onClick={() => setAiDifficulty('hard')}
                >
                  <DifficultyIcon difficulty="hard" />
                  Hard
                </button>
                <button
                  type="button"
                  className={`mode-pill ${aiDifficulty === 'adaptive' ? 'is-active' : ''}`}
                  onClick={() => setAiDifficulty('adaptive')}
                >
                  <DifficultyIcon difficulty="adaptive" />
                  Учится
                </button>
              </div>
              <div className="mode-panel-hint">
                <p>Влияет на режим с ИИ и на Быструю игру.</p>
                <p>{difficultyHint}</p>
              </div>
            </section>

            <section className="mode-panel mode-panel-note">
              <p className="mode-kicker">Запуск</p>
              <p className="mode-note">
                Настройки сохраняются. После перезагрузки страница откроется с теми же правилами и сложностью.
              </p>
              <div className="mode-launch-actions">
                {hasSavedGame && (
                  <button type="button" className="mode-launch-btn" onClick={onContinueGame}>
                    Продолжить игру
                  </button>
                )}
                <button
                  type="button"
                  className="mode-launch-btn is-primary"
                  onClick={() => handleModeSelect(primaryLaunchMode)}
                >
                  Начать новую партию
                </button>
              </div>
            </section>
          </aside>

          <div className="mode-grid">
            {modeCards.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`mode-card ${mode.disabled ? 'is-disabled' : ''}`}
                onClick={() => handleModeSelect(mode.id)}
                disabled={mode.disabled}
              >
                <div className="mode-card-head">
                  <div className="mode-card-title">
                    <div className="mode-card-icon">{mode.icon}</div>
                    <div className="mode-card-title-copy">
                      <h2>{mode.title}</h2>
                    </div>
                  </div>
                  <span className="mode-card-meta">{mode.meta}</span>
                </div>
                <p className="mode-card-description">{mode.description}</p>
                <div className="mode-card-footer">
                  <span className="mode-card-footer-meta">
                    {mode.id === 'ai' ? `ИИ: ${aiDifficultyLabel}` : null}
                    {mode.id === 'quick' ? `Блиц vs ИИ • ${aiDifficultyLabel}` : null}
                    {mode.id === 'quick' ? '15 секунд на ход' : null}
                    <span className="mode-card-rules">
                      {activeRulesIcon}
                      {allowSquareWin ? 'Расширенные правила' : 'Классика'}
                    </span>
                  </span>
                  <strong>{mode.disabled ? 'Недоступно' : 'Играть'}</strong>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
