import { useCallback, useState } from "react";
import { createPlayfield } from "@/utils/tetris";
import type { Piece } from "@/types/piece";

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
      if (row.every((cell) => cell !== 0)) {
        burningRows.push(index);
        return row.map(() => "_burning");
      }
      return row;
    });

    return { newPf, burningRows } as const;
  }, []);

  return { playfield, setPlayfield, mergePiece, clearLines };
};
