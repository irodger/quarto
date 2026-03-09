import React, { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { GameModeSelector } from './components/GameModeSelector';
import { GameBoard } from './components/GameBoard';
import type { GameSettings } from './types/game';
import { clearStoredGameSession, loadStoredGameSession } from './utils/gameSession';

const GAME_SETTINGS_STORAGE_KEY = 'quarto-game-settings-v1';

const loadStoredGameSettings = (): GameSettings | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(GAME_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<GameSettings>;
    if (!parsed.mode || !parsed.aiDifficulty || typeof parsed.allowSquareWin !== 'boolean') {
      return null;
    }

    return {
      mode: parsed.mode,
      aiDifficulty: parsed.aiDifficulty,
      allowSquareWin: parsed.allowSquareWin,
    };
  } catch {
    return null;
  }
};

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'settings' | 'profiles' | 'achievements'>('menu');
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(() => loadStoredGameSettings());
  const [gameSessionId, setGameSessionId] = useState(0);
  const [hasSavedGame, setHasSavedGame] = useState(() => loadStoredGameSession() !== null);

  useEffect(() => {
    if (typeof window === 'undefined' || !gameSettings) {
      return;
    }

    window.localStorage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(gameSettings));
  }, [gameSettings]);

  const handleGameStart = (settings: GameSettings) => {
    clearStoredGameSession();
    setHasSavedGame(false);
    setGameSettings(settings);
    setGameSessionId((current) => current + 1);
    setCurrentScreen('game');
  };

  const handleGameSettingsUpdate = (settings: GameSettings) => {
    setGameSettings(settings);
  };

  const handleContinueGame = () => {
    const storedSession = loadStoredGameSession();
    if (!storedSession) {
      setHasSavedGame(false);
      return;
    }

    setGameSettings(storedSession.gameSettings);
    setCurrentScreen('game');
  };

  const handleSessionPresenceChange = (present: boolean) => {
    setHasSavedGame(present);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <GameModeSelector
            onStartGame={handleGameStart}
            onContinueGame={handleContinueGame}
            hasSavedGame={hasSavedGame}
            initialSettings={gameSettings}
          />
        );
      case 'game':
        return (
          <GameBoard
            key={gameSessionId}
            gameSettings={gameSettings}
            onBackToMenu={() => setCurrentScreen('menu')}
            onSessionPresenceChange={handleSessionPresenceChange}
            onUpdateGameSettings={handleGameSettingsUpdate}
            onStartGame={handleGameStart}
          />
        );
      case 'settings':
        return <div className="p-8 text-center text-white"><h2 className="text-2xl font-bold">Настройки</h2><p>Раздел пока не используется.</p></div>;
      case 'profiles':
        return <div className="p-8 text-center text-white"><h2 className="text-2xl font-bold">Профили</h2><p>Раздел пока не используется.</p></div>;
      case 'achievements':
        return <div className="p-8 text-center text-white"><h2 className="text-2xl font-bold">Достижения</h2><p>Раздел пока не используется.</p></div>;
      default:
        return (
          <GameModeSelector
            onStartGame={handleGameStart}
            onContinueGame={handleContinueGame}
            hasSavedGame={hasSavedGame}
            initialSettings={gameSettings}
          />
        );
    }
  };

  return (
    <AppLayout currentScreen={currentScreen}>
      {renderCurrentScreen()}
    </AppLayout>
  );
};
