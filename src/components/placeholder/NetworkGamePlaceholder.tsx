// src/components/placeholder/NetworkGamePlaceholder.tsx
import React from 'react';

export const NetworkGamePlaceholder: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#eff6ff] to-[#f0fdf4] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Сетьевая иконка */}
          <div className="mb-6">
            <div className="text-6xl mb-4">🌐</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">Сетевая игра</div>
            <div className="text-gray-600">Скоро станет доступно!</div>
          </div>

          {/* Список фич */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-2xl mb-4 text-blue-500">🌐</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Многопользовательская игра</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Играйте против оппонентов онлайн</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Система рейтингов и лиги</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Турниры и соревнования</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Чат с оппонентами</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Глобальный рейтинг</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-2xl mb-4 text-purple-500">🏆</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Турниры</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">🏅</span>
                  <span className="text-gray-700">Еженедельные турниры</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">🏆</span>
                  <span className="text-gray-700">Крупные чемпионаты</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">🎖</span>
                  <span className="text-gray-700">Сезонные события</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">🎗</span>
                  <span className="text-gray-700">Награды и достижения</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Сроки разработки */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">📅 Разработка</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Ожидайте запуск в ближайшее время</p>
              <p>• Следите за обновлениями в нашем сообществе</p>
              <p>• Присоединяйтесь к beta-тестированию</p>
            </div>
          </div>

          {/* Призыв к действию */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">🚀 Будущее Quarto</h4>
            <div className="text-sm text-blue-700">
              <p>Современная классическая Quarto встречает в новой эре!</p>
              <p>Децентрализованная игра с возможностью:</p>
              <ul className="mt-2 ml-4">
                <li>🔐 Полной безопасности и прозрачности</li>
                <li>⚖️ Истинное владение игровыми активами</li>
                <li>🏆 Крипто-турниры с реальными призами</li>
                <li>🎮 Игровой опыт нового поколения</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};