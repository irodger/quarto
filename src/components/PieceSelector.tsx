import React from 'react';
import type { Piece } from '../types';
import { PieceComponent } from './PieceComponent';

interface PieceSelectorProps {
  availablePieces: Piece[];
  selectedPiece: Piece | null;
  onPieceSelect: (piece: Piece) => void;
  isCurrentPlayerSelector: boolean;
  onDragStart?: (piece: Piece) => void;
  onDragEnd?: () => void;
}

export const PieceSelector: React.FC<PieceSelectorProps> = ({
  availablePieces,
  selectedPiece,
  onPieceSelect,
  isCurrentPlayerSelector,
  onDragStart,
  onDragEnd
}) => {
  return (
    <div className="p-4 bg-[#e5e7eb] rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center">
        {isCurrentPlayerSelector 
          ? "Выберите фигуру для противника" 
          : "Доступные фигуры"}
      </h3>
      <div className="grid grid-cols-4 gap-3">
          {availablePieces.map(piece => (
            <div key={piece.id} className="flex justify-center">
              <PieceComponent
                piece={piece}
                isSelected={selectedPiece?.id === piece.id}
                isSelectable={isCurrentPlayerSelector}
                isDraggable={isCurrentPlayerSelector}
                onClick={() => isCurrentPlayerSelector && onPieceSelect(piece)}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
          ))}
      </div>
    </div>
  );
};
