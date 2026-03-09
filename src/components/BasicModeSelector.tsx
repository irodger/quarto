// src/components/BasicModeSelector.tsx - простая версия без сложного JSX
import React from 'react';

export const BasicModeSelector: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 flex items-center justify-center">
      <div className="text-4xl font-bold text-white mb-8">Quarto</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎮 Игра с ИИ</h2>
          <p className="text-gray-600 text-center">
            Основной режим - игра против искусственного интеллекта
          </p>
          <button 
            onClick={() => {}}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
          >
            Начать игру с ИИ
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎮 Два игрока</h2>
          <p className="text-gray-600 text-center">
            Локальная игра на одном устройстве
          </p>
          <button 
            onClick={() => {}}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
          >
            Начать локальную игру
          </button>
        </div>
      </div>
    </div>
  );
};