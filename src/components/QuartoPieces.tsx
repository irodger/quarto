// src/components/QuartoPieces.tsx - Компонент с SVG фигурами Quarto
import React from 'react';

interface QuartoPieceProps {
  color: 'light' | 'dark';
  size: 'small' | 'large';
  shape: 'round' | 'square';
  top: 'hollow' | 'solid';
  className?: string;
}

export const QuartoPiece: React.FC<QuartoPieceProps> = ({ 
  color, 
  size, 
  shape, 
  top, 
  className = '' 
}) => {
  const isLight = color === 'light';
  const isLarge = size === 'large';
  const isRound = shape === 'round';
  const isHollow = top === 'hollow';
  
  const baseSize = 40;
  const size12 = isLarge ? 16 : 12; // Высота фигуры
  const sizeWidth = isLarge ? 24 : 18; // Ширина фигуры
  
  const fillColor = isLight ? '#f59e0b' : '#374151';
  const strokeColor = isLight ? '#d97706' : '#111827';
  
  return (
    <svg 
      width={baseSize} 
      height={baseSize} 
      viewBox={`0 0 ${baseSize} ${baseSize}`}
      className={className}
    >
      {/* Тень */}
      <ellipse
        cx={baseSize/2}
        cy={baseSize - 8}
        rx={sizeWidth/2}
        ry={4}
        fill="#00000020"
      />
      
      {/* Основание фигуры */}
      <g transform={`translate(${baseSize/2}, ${baseSize/2})`}>
        {/* Круглая фигура */}
        {isRound && (
          <>
            {/* Основной круг */}
            <ellipse
              cx={0}
              cy={0}
              rx={sizeWidth/2}
              ry={size12/3}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
            {/* Боковая стенка для 3D эффекта */}
            <ellipse
              cx={2}
              cy={2}
              rx={sizeWidth/2}
              ry={size12/3}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              opacity={0.7}
            />
          </>
        )}
        
        {/* Квадратная фигура */}
        {!isRound && (
          <>
            {/* Основной квадрат в изометрии */}
            <path
              d={`M ${-sizeWidth/2} ${-size12/6} 
                      L ${sizeWidth/2} ${-size12/6}
                      L ${sizeWidth/2 + 6} ${size12/6}
                      L ${-sizeWidth/2 + 6} ${size12/6} Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
            {/* Боковая стенка */}
            <path
              d={`M ${-sizeWidth/2 + 6} ${size12/6} 
                      L ${sizeWidth/2 + 6} ${size12/6}
                      L ${sizeWidth/2 + 6} ${size12/6 + 4}
                      L ${-sizeWidth/2 + 6} ${size12/6 + 4} Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              opacity={0.8}
            />
          </>
        )}
        
        {/* Отверстие для пустых фигур */}
        {isHollow && (
          <ellipse
            cx={0}
            cy={0}
            rx={sizeWidth/4}
            ry={size12/6}
            fill="#ffffff"
            stroke={strokeColor}
            strokeWidth="0.5"
          />
        )}
      </g>
    </svg>
  );
};

// Функция для создания SVG-фигуры
export const createPieceSVG = (color: 'light' | 'dark', size: 'small' | 'large', shape: 'round' | 'square', top: 'hollow' | 'solid') => {
  return <QuartoPiece color={color} size={size} shape={shape} top={top} />;
};

// Компонент для легенды с маленькими фигурами
export const LegendPiece: React.FC<{color: 'light' | 'dark', size: 'small' | 'large', shape: 'round' | 'square', top: 'hollow' | 'solid'}> = ({color, size, shape, top}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 flex items-center justify-center">
        <QuartoPiece color={color} size={size} shape={shape} top={top} />
      </div>
    </div>
  );
};