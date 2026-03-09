/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
      }
    }
  },
  safelist: [
    // Градиенты (новый синтаксис Tailwind v4)
    'from-[#eff6ff]', 'to-[#f0fdf4]', 'bg-linear-to-br',
    // Все hex цвета которые используются
    'bg-[#3b82f6]', 'bg-[#2563eb]', 'bg-white',
    'bg-[#fef3c7]', 'bg-[#fde047]',
    'bg-[#f3f4f6]', 'bg-[#e5e7eb]', 'bg-[#d1d5db]', 'bg-[#1f2937]',
    'bg-[#dcfce7]', 'bg-[#bbf7d0]',
    'bg-[#e5e7eb]',
    // Hover состояния с hex цветами
    'hover:bg-[#2563eb]', 'hover:bg-[#bbf7d0]',
    'hover:border-[#22c55e]', 'hover:shadow-md',
    'hover:ring-[#22c55e]', 'hover:ring-[#d97706]',
    'hover:scale-110', 'hover:scale-105', 'hover:-translate-y-1',
    'hover:shadow-lg', 'hover:shadow-md',
    // Текстовые цвета
    'text-[#1f2937]', 'text-[#374151]', 'text-white', 'text-[#fde047]',
    // Ring эффекты
    'ring-[#3b82f6]', 'ring-[#22c55e]', 'ring-[#f59e0b]', 'ring-current',
    'ring-2', 'ring-4',
    // Shadow эффекты
    'shadow-lg', 'shadow-md', 'shadow-xl',
    // Transform эффекты
    '-translate-y-1',
    // Границы
    'border-[#9ca3af]', 'border-[#22c55e]', 'border-[#facc15]', 'border-[#d1d5db]',
    'border-2',
    // Размеры
    'w-16', 'h-16', 'w-12', 'h-12', 'w-8', 'h-8',
    // Отступы
    'p-4', 'py-8', 'px-4', 'mb-2', 'mb-3', 'mb-4', 'mb-6', 'mb-8', 'mt-2', 'mt-4',
    // Формы
    'rounded-lg', 'rounded-sm', 'rounded-full',
    // Скейлинг
    'scale-75', 'scale-100', 'scale-110', 'scale-105',
    // Анимации
    'animate-pulse', 'animate-fade-in',
    // Курсоры
    'cursor-pointer', 'cursor-move'
  ],
  plugins: [],
}