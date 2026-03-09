// src/components/QuartoWebGL.tsx - Идеальные Canvas фигуры Quarto
import React, { useEffect, useRef } from 'react';

interface QuartoWebGLProps {
  color: 'light' | 'dark';
  size: 'small' | 'large';
  shape: 'round' | 'square';
  top: 'hollow' | 'solid';
  className?: string;
}

export const QuartoWebGL: React.FC<QuartoWebGLProps> = ({ 
  color, 
  size, 
  shape, 
  top, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI поддержка
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 80 * dpr;
    canvas.height = 80 * dpr;
    canvas.style.width = '80px';
    canvas.style.height = '80px';
    ctx.scale(dpr, dpr);

    // Очистка
    ctx.clearRect(0, 0, 80, 80);

    // Параметры фигуры
    const isLight = color === 'light';
    const isLarge = size === 'large';
    const isRound = shape === 'round';
    const isHollow = top === 'hollow';

    // Размеры фигур
    const scale = isLarge ? 1.2 : 1.0;
    const pieceWidth = 20 * scale;
    const pieceHeight = 16 * scale;

    // Цвета Quarto
    const lightColor = '#f4e4c1'; // Warm light beige
    const darkColor = '#6b7280';    // Dark gray
    const lightHole = '#d2b48c';  // Darker beige
    const darkHole = '#4b5563';    // Darker gray

    const fillColor = isLight ? lightColor : darkColor;
    const holeColor = isLight ? lightHole : darkHole;
    const strokeColor = '#000000';

    // Центр
    const centerX = 40;
    const centerY = 40;

    // Рисуем фигуру
    if (isRound) {
      // Круглая фигура
      // Основной цилиндр
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, pieceWidth/2, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Боковые стенки для 3D эффекта
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, pieceWidth/2, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Отверстие для пустых фигур
      if (isHollow) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, pieceWidth/4, 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = holeColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

    } else {
      // Квадратная фигура
      const halfWidth = pieceWidth / 2;
      const halfHeight = pieceHeight / 2;

      // Верхняя грань
      ctx.beginPath();
      ctx.moveTo(centerX - halfWidth - 3, centerY - halfHeight - 3);
      ctx.lineTo(centerX + halfWidth + 3, centerY - halfHeight - 3);
      ctx.lineTo(centerX + halfWidth + 5, centerY - halfHeight);
      ctx.lineTo(centerX + 5, centerY - halfHeight);
      ctx.lineTo(centerX - halfWidth + 5, centerY - halfHeight);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Передняя грань
      ctx.beginPath();
      ctx.moveTo(centerX - halfWidth, centerY - halfHeight);
      ctx.lineTo(centerX + halfWidth, centerY - halfHeight);
      ctx.lineTo(centerX + halfWidth, centerY + halfHeight);
      ctx.lineTo(centerX - halfWidth, centerY + halfHeight);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Правая боковая грань
      ctx.beginPath();
      ctx.moveTo(centerX + halfWidth + 5, centerY - halfHeight);
      ctx.lineTo(centerX + halfWidth + 5, centerY + halfHeight);
      ctx.lineTo(centerX + halfWidth + 5, centerY + halfHeight);
      ctx.lineTo(centerX + halfWidth, centerY + halfHeight);
      ctx.lineTo(centerX + halfWidth, centerY - halfHeight);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Отверстие для пустых фигур
      if (isHollow) {
        const holeSize = Math.min(pieceWidth, pieceHeight) * 0.3;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.rect(-holeSize/2, -holeSize/2, holeSize, holeSize);
        ctx.fillStyle = holeColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Тень
    // Тень
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + pieceHeight/2 + 4, pieceWidth/1.5, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.restore();

  }, [color, size, shape, top]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
};