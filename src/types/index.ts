export interface Piece {
  id: number;
  color: 'light' | 'dark';
  size: 'small' | 'large';
  shape: 'round' | 'square';
  top: 'hollow' | 'solid';
}

export interface Cell {
  row: number;
  col: number;
  piece: Piece | null;
}

export interface GameState {
  board: Cell[][];
  availablePieces: Piece[];
  selectedPiece: Piece | null;
  currentPlayer: 1 | 2;
  winner: number | null;
  gameOver: boolean;
}