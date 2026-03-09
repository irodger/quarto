import type { Piece } from '../types';

export type Board = Array<Array<Piece | null>>;
export type Position = { row: number; col: number };
export interface RuleOptions {
  allowSquareWin?: boolean;
}
export interface WinningPattern {
  cells: Position[];
  type: 'row' | 'column' | 'diagonal' | 'square';
}
export type SharedAttribute = 'color' | 'size' | 'shape' | 'top';

const colors: Array<Piece['color']> = ['light', 'dark'];
const sizes: Array<Piece['size']> = ['small', 'large'];
const shapes: Array<Piece['shape']> = ['round', 'square'];
const tops: Array<Piece['top']> = ['hollow', 'solid'];

export const createPieces = (): Piece[] => {
  const pieces: Piece[] = [];
  let id = 1;

  for (const size of sizes) {
    for (const shape of shapes) {
      for (const color of colors) {
        for (const top of tops) {
          pieces.push({
            id,
            color,
            size,
            shape,
            top,
          });
          id += 1;
        }
      }
    }
  }

  return pieces;
};

export const createEmptyBoard = (): Board =>
  Array.from({ length: 4 }, () => Array<Piece | null>(4).fill(null));

export const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

export const getEmptyPositions = (board: Board): Position[] => {
  const positions: Position[] = [];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) {
        positions.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  return positions;
};

export const placePiece = (board: Board, position: Position, piece: Piece): Board => {
  const nextBoard = cloneBoard(board);
  nextBoard[position.row][position.col] = piece;
  return nextBoard;
};

const getLines = (): WinningPattern[] => {
  const rows = Array.from({ length: 4 }, (_, rowIndex) => ({
    type: 'row' as const,
    cells: Array.from({ length: 4 }, (_, colIndex) => ({ row: rowIndex, col: colIndex })),
  }));
  const columns = Array.from({ length: 4 }, (_, colIndex) => ({
    type: 'column' as const,
    cells: Array.from({ length: 4 }, (_, rowIndex) => ({ row: rowIndex, col: colIndex })),
  }));
  const diagonalA = {
    type: 'diagonal' as const,
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 2 },
      { row: 3, col: 3 },
    ],
  };
  const diagonalB = {
    type: 'diagonal' as const,
    cells: [
      { row: 0, col: 3 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 3, col: 0 },
    ],
  };

  return [...rows, ...columns, diagonalA, diagonalB];
};

const getSquares = (): WinningPattern[] => {
  const squares: WinningPattern[] = [];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      squares.push({
        type: 'square',
        cells: [
          { row, col },
          { row, col: col + 1 },
          { row: row + 1, col },
          { row: row + 1, col: col + 1 },
        ],
      });
    }
  }

  return squares;
};

export const getSharedAttributes = (board: Board, pattern: WinningPattern): SharedAttribute[] => {
  const pieces = pattern.cells.map(({ row, col }) => board[row][col]);

  if (pieces.some((piece) => piece === null)) {
    return [];
  }

  const fullPieces = pieces as Piece[];
  const first = fullPieces[0];
  const shared: SharedAttribute[] = [];

  if (fullPieces.every((piece) => piece.color === first.color)) {
    shared.push('color');
  }
  if (fullPieces.every((piece) => piece.size === first.size)) {
    shared.push('size');
  }
  if (fullPieces.every((piece) => piece.shape === first.shape)) {
    shared.push('shape');
  }
  if (fullPieces.every((piece) => piece.top === first.top)) {
    shared.push('top');
  }

  return shared;
};

const patternHasSharedAttribute = (board: Board, pattern: WinningPattern): boolean =>
  getSharedAttributes(board, pattern).length > 0;

export const getWinningPattern = (board: Board, options: RuleOptions = {}): WinningPattern | null => {
  const lineWin = getLines().find((pattern) => patternHasSharedAttribute(board, pattern));
  if (lineWin) {
    return lineWin;
  }

  if (options.allowSquareWin) {
    return getSquares().find((pattern) => patternHasSharedAttribute(board, pattern)) ?? null;
  }

  return null;
};

export const checkWinner = (board: Board, options: RuleOptions = {}): boolean => {
  return getWinningPattern(board, options) !== null;
};

export const isBoardFull = (board: Board): boolean => getEmptyPositions(board).length === 0;

export const pieceLabel = (piece: Piece): string =>
  [
    piece.color === 'light' ? 'Светлая' : 'Темная',
    piece.size === 'large' ? 'большая' : 'маленькая',
    piece.shape === 'round' ? 'круглая' : 'квадратная',
    piece.top === 'hollow' ? 'полая' : 'сплошная',
  ].join(' ');
