import { useCallback, useState } from 'react';
import { createPlayfield } from '@/utils/tetris';
import type { Piece } from '@/types/piece';

export const usePlayfield = () => {
  const [playfield, setPlayfield] = useState(createPlayfield);

  const mergePiece = useCallback((pf: (string | 0)[][], piece: Piece) => {
    const newPf = pf.map((row) => row.slice());
    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (piece.matrix[r][c] && piece.row + r >= 0) {
          newPf[piece.row + r][piece.col + c] = piece.name;
        }
      }
    }
    return newPf;
  }, []);

  const clearLines = useCallback((pf: (string | 0)[][]) => {
    const burningRows: number[] = [];

    const newPf = pf.map((row, index) => {
      const isFull = row.every((cell) => cell !== 0);
      const hasBrick = row.some((cell) => cell === 'BRICK');

      if (isFull && !hasBrick) {
        burningRows.push(index);
        return row.map(() => '_burning');
      }
      return row;
    });

    return { newPf, burningRows } as const;
  }, []);

  const countBricks = useCallback((pf: (string | 0)[][]) => {
    let count = 0;
    for (const row of pf) {
      for (const cell of row) {
        if (cell === 'BRICK') count++;
      }
    }
    return count;
  }, []);

  return { playfield, setPlayfield, mergePiece, clearLines, countBricks };
};
