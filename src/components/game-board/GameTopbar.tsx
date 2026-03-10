import type { GameSettings } from '../../types/game';
import {
  HeaderClockIcon,
  HeaderDifficultyIcon,
  HeaderModeIcon,
  HeaderPiecesIcon,
  HeaderRulesClassicIcon,
  HeaderRulesHardcoreIcon,
} from './HeaderIcons';

type GameTopbarProps = {
  tableNumber: number;
  isAiMode: boolean;
  isQuickMode: boolean;
  openSettingsMenu: 'difficulty' | 'rules' | null;
  setOpenSettingsMenu: React.Dispatch<React.SetStateAction<'difficulty' | 'rules' | null>>;
  resolvedSettings: GameSettings;
  modeChipLabel: string;
  rulesChipLabel: string;
  elapsedLabel: string;
  quickTurnRemainingMs: number;
  quickTurnLabel: string;
  availablePiecesCount: number;
  updateSettings: (patch: Partial<GameSettings>) => void;
};

export const GameTopbar = ({
  tableNumber,
  isAiMode,
  isQuickMode,
  openSettingsMenu,
  setOpenSettingsMenu,
  resolvedSettings,
  modeChipLabel,
  rulesChipLabel,
  elapsedLabel,
  quickTurnRemainingMs,
  quickTurnLabel,
  availablePiecesCount,
  updateSettings,
}: GameTopbarProps) => (
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
            <span>{quickTurnLabel}</span>
          </span>
        )}

        <span className="game-settings-chip">
          <HeaderPiecesIcon />
          <span>{availablePiecesCount}</span>
        </span>
      </div>
    </div>
  </header>
);
