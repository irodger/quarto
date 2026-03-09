// src/components/Navigation.tsx
import React from 'react';

interface NavigationProps {
  currentScreen: 'menu' | 'game' | 'settings' | 'profiles' | 'achievements';
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen }) => {
  const navigationItems = [
    { id: 'menu', label: 'Главное меню', icon: '🎮' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
    { id: 'profiles', label: 'Профили', icon: '👥' },
    { id: 'achievements', label: 'Достижения', icon: '🏆' }
  ];

  const handleNavClick = (itemId: string) => {
    switch (itemId) {
      case 'menu':
        // Будем управлять через состояние App
        window.location.reload(); // Временно возвращаем к выбору режима
        break;
      case 'settings':
        console.log('Открыть настройки');
        // TODO: Открыть настройки
        break;
      case 'profiles':
        console.log('Открыть профили');
        // TODO: Открыть профили
        break;
      case 'achievements':
        console.log('Открыть достижения');
        // TODO: Открыть достижения
        break;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-b-xl mx-4 mb-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎮</span>
            <span className="font-bold text-xl text-gray-800">Quarto</span>
          </div>

          {/* Навигационные кнопки */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentScreen === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden sm:inline text-sm font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Информация о игроке */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
            <span className="text-lg">👤</span>
            <span className="text-sm font-medium text-green-800 hidden sm:inline">
              Игрок 1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};