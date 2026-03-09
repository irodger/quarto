import React from 'react';
import type { Cell } from '../types';
import { PieceComponent } from './PieceComponent';

interface BoardCellProps {
  cell: Cell;
  isClickable?: boolean;
  onCellClick?: (row: number, col: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDropTarget?: boolean;
}

export const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  isClickable = false,
  onCellClick,
  onDragOver,
  onDrop,
  isDropTarget = false
}) => {
  const handleClick = () => {
    if (isClickable && onCellClick) {
      onCellClick(cell.row, cell.col);
    }
  };

  return (
    <div
      className={`
        w-16 h-16 border-2 border-[#9ca3af] flex items-center justify-center
        ${isClickable ? 'bg-[#dcfce7] hover:bg-[#bbf7d0] hover:border-[#22c55e] hover:shadow-md cursor-pointer' : 'bg-[#f3f4f6]'}
        ${isDropTarget ? 'bg-[#dcfce7] border-[#22c55e] animate-pulse' : ''}
        transition-all duration-300 ease-in-out
      `}
      onClick={handleClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {cell.piece && (
        <div className="animate-fade-in">
          <PieceComponent piece={cell.piece} size="small" />
        </div>
      )}
    </div>
  );
};
