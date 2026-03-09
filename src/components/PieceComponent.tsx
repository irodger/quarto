import React from 'react';
import type { Piece } from '../types';
import { QuartoPieceSVG } from './QuartoPieceSVG';

interface PieceComponentProps {
  piece: Piece;
  isSelected?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
  size?: 'small' | 'large';
  isDraggable?: boolean;
  onDragStart?: (piece: Piece) => void;
  onDragEnd?: () => void;
  variant?: 'classic' | 'modern';
}

export const PieceComponent: React.FC<PieceComponentProps> = ({
  piece,
  isSelected = false,
  isSelectable = false,
  onClick,
  size = 'small',
  isDraggable = false,
  onDragStart,
  onDragEnd,
  variant = 'classic',
}) => {
  const getPieceSize = () => {
    if (size === 'small') return 'h-14 w-14 sm:h-16 sm:w-16';
    if (size === 'large') return 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]';
    return 'h-14 w-14 sm:h-16 sm:w-16';
  };

  const getSizeClass = () => {
    return piece.size === 'small' ? 'scale-[1.02]' : 'scale-[1.42]';
  };

  const getBorderClass = () => {
    if (isSelected) return 'ring-4 ring-[#3b82f6]';
    if (isSelectable) return 'ring-2 ring-[#22c55e] hover:ring-[#22c55e]';
    if (isDraggable) return 'ring-2 ring-[#f59e0b] hover:ring-[#d97706] cursor-move';
    return '';
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDraggable && onDragStart) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('piece', JSON.stringify(piece));
      onDragStart(piece);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      draggable={isDraggable}
      className={`
        piece-component
        ${getPieceSize()}
        ${getSizeClass()}
        ${getBorderClass()}
        shrink-0 transition-all duration-300 ease-in-out
        ${isDraggable ? 'cursor-move hover:scale-105 hover:shadow-lg' : 'cursor-pointer'}
        ${isSelectable && !isDraggable ? 'hover:scale-110 hover:shadow-lg hover:-translate-y-1' : ''}
        ${isSelected ? 'animate-pulse shadow-xl' : ''}
      `}
      onClick={onClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <QuartoPieceSVG
        color={piece.color}
        size={piece.size}
        shape={piece.shape}
        top={piece.top}
        variant={variant}
      />
    </div>
  );
};
