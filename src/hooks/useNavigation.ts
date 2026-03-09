// src/hooks/useNavigation.ts
import { useState, useCallback } from 'react';

type ScreenType = 'auth' | 'menu' | 'game' | 'settings' | 'profiles' | 'achievements';

interface NavigationState {
  currentScreen: ScreenType;
  isTransitioning: boolean;
}

export const useNavigation = () => {
  const [state, setState] = useState<NavigationState>({
    currentScreen: 'auth',
    isTransitioning: false
  });

  const navigate = useCallback((screen: ScreenType, callback?: () => void) => {
    if (state.currentScreen === screen) return;
    
    setState(prev => ({ ...prev, isTransitioning: true }));
    
    setTimeout(() => {
      setState(prev => ({ ...prev, currentScreen: screen, isTransitioning: false }));
      callback?.();
    }, 100);
  }, []);

  const navigateToAuth = useCallback(() => {
    navigate('auth');
  }, [navigate]);

  const navigateToMenu = useCallback(() => {
    navigate('menu');
  }, [navigate]);

  const navigateToGame = useCallback((config?: any) => {
    navigate('game');
  }, [navigate]);

  const navigateToSettings = useCallback(() => {
    navigate('settings');
  }, [navigate]);

  const navigateToProfiles = useCallback(() => {
    navigate('profiles');
  }, [navigate]);

  const navigateToAchievements = useCallback(() => {
    navigate('achievements');
  }, [navigate]);

  return {
    ...state,
    navigateToAuth,
    navigateToMenu,
    navigateToGame,
    navigateToSettings,
    navigateToProfiles,
    navigateToAchievements,
    setCurrentScreen: (screen: ScreenType) => setState(prev => ({ ...prev, currentScreen: screen, isTransitioning: true }))
  };
};