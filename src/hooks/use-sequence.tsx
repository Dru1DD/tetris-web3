import { useCallback, useState } from "react";
import { COLS, SEQUENCE, TETROMINOS } from "@/constants/tetris";
import { getRandomInt } from "@/utils/random";

export const useSequence = () => {
  const [sequence, setSequence] = useState<string[]>(() => {
    const bag = [...SEQUENCE];
    const seq: string[] = [];
    while (bag.length)
      seq.push(bag.splice(getRandomInt(0, bag.length - 1), 1)[0]);
    return seq;
  });

  // refill теперь ПЕРЕДАЁТ И СОХРАНЯЕТ новую последовательность в state
  const refill = useCallback(() => {
    const bag = [...SEQUENCE];
    const seq: string[] = [];
    while (bag.length)
      seq.push(bag.splice(getRandomInt(0, bag.length - 1), 1)[0]);

    setSequence(seq); // <-- важно сохранять
    return seq;
  }, []);

  const next = useCallback(() => {
    let seq = sequence;
    if (seq.length === 0) {
      seq = refill(); // refill уже сохранит seq в state
    }
    const name = seq[0];
    const newSeq = seq.slice(1);
    setSequence(newSeq);

    const matrix = TETROMINOS[name];
    const col = Math.floor(COLS / 2 - matrix[0].length / 2);
    const row = -2;
    return { name, matrix: matrix.map((r) => r.slice()), row, col };
  }, [sequence, refill]);

  const peek = useCallback(() => {
    if (sequence.length === 0) {
      const filled = refill();
      return filled.length > 0 ? filled[0] : null;
    }
    return sequence[0];
  }, [sequence, refill]);

  return { next, peek, sequence };
};
