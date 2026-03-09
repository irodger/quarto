// src/components/MinimalNavigation.tsx
import React from 'react';

export const MinimalNavigation: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#eff6ff] to-[#f0fdf4] py-8">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Quarto</h1>
        <p className="text-white text-center mb-8">
          🎯 Выберите режим игры
        </p>
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => {}}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded"
          >
            🎮 Игра с ИИ
          </button>
          <button 
            onClick={() => {}}
            className="w-full bg-green-500 text-white py-2 px-4 rounded"
          >
            🎮 Возврат в меню
          </button>
        </div>
      </div>
    </div>
  );
};