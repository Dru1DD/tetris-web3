import { useCallback, useEffect, useRef, useState } from 'react';
import { useSequence } from '@/hooks/use-sequence';
import { usePlayfield } from '@/hooks/use-playfield';
import { useUser } from '@/hooks/use-user';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { createPlayfield, drawFire, hasCollision, rotateTetromino } from '@/utils/tetris';
import { COLS, GRID, POINTS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT, DROP_SPEED, IMAGES } from '@/constants/tetris';
import type { Piece } from '@/types/piece';

const Game = () => {
  const { handleLogout } = useUser();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { peek, next } = useSequence();
  const { playfield, setPlayfield, mergePiece, clearLines } = usePlayfield();

  const [piece, setPiece] = useState<Piece | null>(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);

  const [dropInterval, setDropInterval] = useState(DROP_SPEED);
  const [gameOver, setGameOver] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const dropCounterRef = useRef(0);

  // ====================================
  // Initialization game
  // ====================================

  useEffect(() => {
    setPlayfield(createPlayfield());
    setPiece(next());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====================================
  // Keyboard movements
  // ====================================

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!piece || !running) return;

      if (e.key === 'ArrowLeft') {
        const moved = { ...piece, col: piece.col - 1 };
        if (!hasCollision(playfield, moved)) setPiece(moved);
      }

      if (e.key === 'ArrowRight') {
        const moved = { ...piece, col: piece.col + 1 };
        if (!hasCollision(playfield, moved)) setPiece(moved);
      }

      if (e.key === 'ArrowDown') {
        const moved = { ...piece, row: piece.row + 1 };
        if (!hasCollision(playfield, moved)) setPiece(moved);
      }

      if (e.key === 'ArrowUp') {
        const rotated = { ...piece, matrix: rotateTetromino(piece.matrix) };
        if (!hasCollision(playfield, rotated)) setPiece(rotated);
      }

      if (e.key === ' ') {
        e.preventDefault();
        const moved = { ...piece };
        while (!hasCollision(playfield, { ...moved, row: moved.row + 1 })) moved.row++;
        setPiece(moved);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [piece, playfield, running]);

  // ====================================
  // Game Loop
  // ====================================

  const update = useCallback(
    (time: number) => {
      if (!running) return;
      if (!lastTimeRef.current) lastTimeRef.current = time;

      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      dropCounterRef.current += dt;

      if (dropCounterRef.current > dropInterval) {
        dropCounterRef.current = 0;

        setPiece((curr: Piece | null) => {
          if (!curr) return curr;

          const moved = { ...curr, row: curr.row + 1 };
          if (!hasCollision(playfield, moved)) return moved;

          const merged = mergePiece(playfield, curr);
          const { newPf, burningRows: br } = clearLines(merged);
          setPlayfield(newPf);

          if (br.length > 0) {
            // Wait for fire animation
            setTimeout(() => {
              setPlayfield((pf) => {
                const filtered = pf.filter((_, idx) => !br.includes(idx));
                while (filtered.length < ROWS) filtered.unshift(new Array(COLS).fill(0));
                return filtered;
              });
            }, 300); // fire animation duration

            setScore((s) => s + POINTS * Math.pow(br.length, 2));
            setDropInterval((i) => Math.max(80, i - 20));
          }

          const np = next();
          const canMoveDown = !hasCollision(newPf, { ...np, row: np.row + 1 });

          if (!canMoveDown) {
            setGameOver(true);
            setRunning(false);
            return null;
          }

          return np;
        });
      }

      rafRef.current = requestAnimationFrame(update);
    },
    [running, dropInterval, playfield, mergePiece, clearLines, setPlayfield, next],
  );

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, update]);

  // ====================================
  // Draw playfield + current piece
  // ====================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = Math.max(1, Math.round(rect.width));
    const displayHeight = Math.max(1, Math.round(rect.height));

    const backingWidth = Math.round(displayWidth * dpr);
    const backingHeight = Math.round(displayHeight * dpr);

    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // draw playfield grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= CANVAS_WIDTH; x += GRID) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // draw playfield
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = playfield[r][c];

        if (cell === '_burning') {
          drawFire(ctx, c, r);
          continue;
        }

        if (cell) {
          const img = IMAGES[cell];
          if (img?.complete) {
            ctx.drawImage(img, c * GRID, r * GRID, GRID, GRID);
          }
        }
      }
    }

    // draw current piece
    if (piece) {
      const { matrix, row, col, name } = piece;
      const img = IMAGES[name];

      if (img?.complete) {
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] && row + r >= 0) {
              ctx.drawImage(img, (col + c) * GRID, (row + r) * GRID, GRID, GRID);
            }
          }
        }
      }
    }
  }, [playfield, piece]);

  // ====================================
  // Game State Controllers
  // ====================================

  const handleOnResumeClicked = () => {
    lastTimeRef.current = 0;
    dropCounterRef.current = 0;
    setRunning(true);
  };

  const handleOnResetClicked = () => {
    setPlayfield(createPlayfield());
    setScore(0);
    setGameOver(false);
    setPiece(next());
    lastTimeRef.current = 0;
    dropCounterRef.current = 0;
    setRunning(true);
  };

  const handleOnPauseClicked = () => {
    setRunning(false);
    setGameOver(false);
  };

  const handleOnExitClicked = () => {
    handleLogout();
  };

  // ====================================
  // Movements
  // ====================================
  const handleLeftButtonClicked = () => {
    if (!piece || !running) return;
    const moved = { ...piece, col: piece.col - 1 };
    if (!hasCollision(playfield, moved)) setPiece(moved);
  };

  const handleRightButtonClicked = () => {
    if (!piece || !running) return;
    const moved = { ...piece, col: piece.col + 1 };
    if (!hasCollision(playfield, moved)) setPiece(moved);
  };

  const handleUpButtonClicked = () => {
    if (!piece || !running) return;
    const rotated = { ...piece, matrix: rotateTetromino(piece.matrix) };
    if (!hasCollision(playfield, rotated)) setPiece(rotated);
  };

  const handleDownButtonClicked = () => {
    if (!piece || !running) return;

    const moved = { ...piece };

    while (!hasCollision(playfield, { ...moved, row: moved.row + 1 })) {
      moved.row++;
    }

    setPiece(moved);

    dropCounterRef.current = dropInterval;
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start md:justify-center">
      <div className="w-full">
        <Header userScore={score} handleOnPauseClicked={handleOnPauseClicked} pieceName={peek()} />
      </div>

      <div className="relative flex-1 w-full flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl bg-canvas shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* TODO: Implement Pause and other functionality when design will be ready */}
      {(!running || gameOver) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="relative z-10 flex flex-col items-center gap-3 text-white">
            <h2 className="text-2xl font-semibold">{gameOver ? 'Game Over' : 'Paused'}</h2>
            <div className="flex gap-2">
              {!gameOver && (
                <button
                  onClick={handleOnResumeClicked}
                  className="p-4 bg-white hover:bg-gray-200 text-black  sprite sprite-shadows cursor-pointer"
                >
                  Resume
                </button>
              )}
              <button
                onClick={handleOnResetClicked}
                className="p-4 bg-red-600 hover:bg-red-700 text-black  sprite sprite-shadows cursor-pointer"
              >
                Restart
              </button>
              <button
                onClick={handleOnExitClicked}
                className="p-4 bg-green-600 hover:bg-green-700 text-black  sprite sprite-shadows cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer
        handleLeftButtonClicked={handleLeftButtonClicked}
        handleDownButtonClicked={handleDownButtonClicked}
        handleRightButtonClicked={handleRightButtonClicked}
        handleUpButtonClicked={handleUpButtonClicked}
      />
    </div>
  );
};

export default Game;
