import { useCallback, useRef, useState } from 'react';
import {
  COLS,
  SEQUENCE,
  TETROMINOS,
  BRICK_GRACE_PERIOD_MS,
  BRICK_MAX_CHANCE,
  BRICK_CHANCE_RAMP_MS,
  BRICK_MAX_ON_FIELD,
} from '@/constants/tetris';
import { getRandomInt } from '@/utils/random';

export const useSequence = () => {
  const [sequence, setSequence] = useState<string[]>(() => {
    const bag = [...SEQUENCE];
    const seq: string[] = [];
    while (bag.length) seq.push(bag.splice(getRandomInt(0, bag.length - 1), 1)[0]);
    return seq;
  });

  // eslint-disable-next-line react-hooks/purity
  const gameStartTime = useRef<number>(Date.now());
  const pendingBrick = useRef<boolean>(false);

  const refill = useCallback(() => {
    const bag = [...SEQUENCE];
    const seq: string[] = [];
    while (bag.length) seq.push(bag.splice(getRandomInt(0, bag.length - 1), 1)[0]);
    setSequence(seq);
    return seq;
  }, []);

  const getBrickChance = useCallback(() => {
    const elapsed = Date.now() - gameStartTime.current;
    if (elapsed < BRICK_GRACE_PERIOD_MS) return 0;
    const rampTime = elapsed - BRICK_GRACE_PERIOD_MS;
    return Math.min(BRICK_MAX_CHANCE, (rampTime / BRICK_CHANCE_RAMP_MS) * BRICK_MAX_CHANCE);
  }, []);

  const tryScheduleBrick = useCallback(
    (brickCountOnField: number) => {
      if (brickCountOnField >= BRICK_MAX_ON_FIELD) return;
      const chance = getBrickChance();
      if (Math.random() < chance) {
        pendingBrick.current = true;
      }
    },
    [getBrickChance],
  );

  const next = useCallback(
    (brickCountOnField: number = 0): { name: string; matrix: number[][]; row: number; col: number } => {
      if (pendingBrick.current && brickCountOnField < BRICK_MAX_ON_FIELD) {
        pendingBrick.current = false;
        const matrix = TETROMINOS['BRICK'];
        const col = Math.floor(COLS / 2);
        return { name: 'BRICK', matrix: matrix.map((r) => r.slice()), row: -1, col };
      }

      let seq = sequence;
      if (seq.length === 0) seq = refill();

      const name = seq[0];
      setSequence(seq.slice(1));

      const matrix = TETROMINOS[name];
      const col = Math.floor(COLS / 2 - matrix[0].length / 2);
      return { name, matrix: matrix.map((r) => r.slice()), row: -2, col };
    },
    [sequence, refill],
  );

  const peek = useCallback(() => {
    if (pendingBrick.current) return 'BRICK';
    if (sequence.length === 0) {
      const filled = refill();
      return filled.length > 0 ? filled[0] : null;
    }
    return sequence[0];
  }, [sequence, refill]);

  const resetStartTime = useCallback(() => {
    gameStartTime.current = Date.now();
    pendingBrick.current = false;
  }, []);

  return { next, peek, sequence, tryScheduleBrick, resetStartTime };
};
