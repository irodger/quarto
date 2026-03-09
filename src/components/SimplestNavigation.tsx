// src/components/SimplestNavigation.tsx
import React from 'react';

export const SimplestNavigation: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#eff6ff] to-[#f0fdf4] py-8">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-white mb-8">🎮 Quarto</h1>
          <p className="text-gray-600 text-center">
            🎮 Возвращение к главному меню
          </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 font-medium"
        >
          🏠 В главное меню
        </button>
      </div>
    </div>
  );
};