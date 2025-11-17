import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSequence } from "@/hooks/use-sequence";
import { usePlayfield } from "@/hooks/use-playfield";
import { Button } from "@/components/ui/button";
import {
  createPlayfield,
  drawFire,
  hasCollision,
  rotateTetromino,
} from "@/utils/tetris";
import {
  COLORS,
  COLS,
  GRID,
  POINTS,
  ROWS,
  TETROMINOS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DROP_SPEED,
  IMAGES,
} from "@/constants/tetris";
import type { Piece } from "@/types/piece";

const Game = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const { next, peek } = useSequence();
  const { playfield, setPlayfield, mergePiece, clearLines } = usePlayfield();

  const [piece, setPiece] = useState<Piece | null>(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);

  const [dropInterval, setDropInterval] = useState(DROP_SPEED);
  const [gameOver, setGameOver] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const dropCounterRef = useRef(0);

  // init
  useEffect(() => {
    setPlayfield(createPlayfield());
    setPiece(next());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!piece || !running) return;

      if (e.key === "ArrowLeft") {
        const moved = { ...piece, col: piece.col - 1 };
        if (!hasCollision(playfield, moved)) setPiece(moved);
      }

      if (e.key === "ArrowRight") {
        const moved = { ...piece, col: piece.col + 1 };
        if (!hasCollision(playfield, moved)) setPiece(moved);
      }

      if (e.key === "ArrowDown") {
        const moved = { ...piece, row: piece.row + 1 };
        if (!hasCollision(playfield, moved)) setPiece(moved);
      }

      if (e.key === "ArrowUp") {
        const rotated = { ...piece, matrix: rotateTetromino(piece.matrix) };
        if (!hasCollision(playfield, rotated)) setPiece(rotated);
      }

      if (e.key === " ") {
        e.preventDefault();
        const moved = { ...piece };
        while (!hasCollision(playfield, { ...moved, row: moved.row + 1 }))
          moved.row++;
        setPiece(moved);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [piece, playfield, running]);

  useEffect(() => {
    if (!piece || !running) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    const minSwipe = 20; // px threshold

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      endX = t.clientX;
      endY = t.clientY;
    };

    const onTouchEnd = () => {
      const dx = endX - startX;
      const dy = endY - startY;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absX < minSwipe && absY < minSwipe) {
        // rotate
        const rotated = { ...piece, matrix: rotateTetromino(piece.matrix) };
        if (!hasCollision(playfield, rotated)) setPiece(rotated);
        return;
      }

      if (absX > absY) {
        if (dx < 0) {
          // swipe left
          const moved = { ...piece, col: piece.col - 1 };
          if (!hasCollision(playfield, moved)) setPiece(moved);
        } else {
          // swipe right
          const moved = { ...piece, col: piece.col + 1 };
          if (!hasCollision(playfield, moved)) setPiece(moved);
        }
      } else {
        if (dy > 0) {
          // swipe down
          const moved = { ...piece, row: piece.row + 1 };
          if (!hasCollision(playfield, moved)) setPiece(moved);
        } else {
          // swipe up → rotate (optional: same as tap)
          const rotated = { ...piece, matrix: rotateTetromino(piece.matrix) };
          if (!hasCollision(playfield, rotated)) setPiece(rotated);
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [piece, playfield, running]);

  // game loop
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
                while (filtered.length < ROWS)
                  filtered.unshift(new Array(COLS).fill(0));
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
    [
      running,
      dropInterval,
      playfield,
      mergePiece,
      clearLines,
      setPlayfield,
      next,
    ]
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

  // draw playfield + current piece
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // draw playfield
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = playfield[r][c];

        if (cell === "_burning") {
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
              ctx.drawImage(
                img,
                (col + c) * GRID,
                (row + r) * GRID,
                GRID,
                GRID
              );
            }
          }
        }
      }
    }
  }, [playfield, piece]);

  // preview window
  useEffect(() => {
    const p = peek();
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!p) return;

    const matrix = TETROMINOS[p];
    const size = GRID;

    const pw = matrix[0].length * size;
    const ph = matrix.length * size;
    const offsetX = (canvas.width - pw) / 2;
    const offsetY = (canvas.height - ph) / 2;

    ctx.fillStyle = COLORS[p];

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(offsetX + c * size, offsetY + r * size, size, size);
        }
      }
    }
  }, [peek]);

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

  const handleOnStopClicked = () => {
    setRunning(false);
    setGameOver(false);
  };

  const handleLogoutClicked = () => {
    // TODO: add logout functionality
    navigate("/");
  };

  const handleMobileControllerClicked = (
    buttonType: "left" | "rotate" | "right"
  ) => {
    if (buttonType === "left") {
      if (!piece || !running) return;
      const moved = { ...piece, col: piece.col - 1 };
      if (!hasCollision(playfield, moved)) setPiece(moved);
    }

    if (buttonType === "rotate") {
      if (!piece || !running) return;
      const rotated = {
        ...piece,
        matrix: rotateTetromino(piece.matrix),
      };
      if (!hasCollision(playfield, rotated)) setPiece(rotated);
    }

    if (buttonType === "right") {
      if (!piece || !running) return;
      const moved = { ...piece, col: piece.col + 1 };
      if (!hasCollision(playfield, moved)) setPiece(moved);
    }
  };

  return (
    <div className="h-screen w-full bg-[#1f1f1f] flex flex-col items-center justify-start p-4 md:flex-row md:justify-center md:gap-10">
      {/* --- HUD PANEL (Desktop + Mobile Top) --- */}
      <div className="w-full max-w-md md:max-w-xs flex justify-between items-center mb-4 text-white">
        {/* Left buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleLogoutClicked}
            className="bg-[#444] hover:bg-[#555] text-sm px-3 py-1"
          >
            Logout
          </Button>

          <Button
            onClick={handleOnStopClicked}
            className="bg-yellow-600 hover:bg-yellow-700 text-sm px-3 py-1"
          >
            Pause
          </Button>

          <Button
            onClick={handleOnResetClicked}
            className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1"
          >
            Reset
          </Button>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm text-zinc-400">Score</h3>
          <div className="text-2xl font-mono">{score}</div>
        </div>
      </div>

      {/* --- NEXT Preview Panel (stay where it was) --- */}
      <div className="w-full max-w-md md:max-w-xs flex justify-center gap-5 items-start mb-4 text-white">
        <div className="flex flex-col items-center">
          <h3 className="text-sm text-zinc-400">Next</h3>
          <canvas
            ref={previewRef}
            width={GRID * 4}
            height={GRID * 4}
            className="block rounded-md border border-[#333]"
            style={{
              imageRendering: "pixelated",
              width: "60px",
              height: "60px",
            }}
          />
        </div>
      </div>

      {/* --- MAIN GAME CANVAS --- */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border border-[#444] bg-black shadow-xl"
          style={{
            imageRendering: "pixelated",
          }}
        />

        {/* Pause / Game Over Overlay */}
        {(!running || gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            <div className="absolute inset-0 bg-black/70 rounded-xl backdrop-blur-sm" />

            <div className="relative z-10 flex flex-col items-center gap-3 text-white">
              <h2 className="text-2xl font-semibold">
                {gameOver ? "Game Over" : "Paused"}
              </h2>
              <div className="flex gap-2">
                {!gameOver && (
                  <Button onClick={handleOnResumeClicked}>Resume</Button>
                )}
                <Button
                  onClick={handleOnResetClicked}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Restart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MOBILE CONTROLS --- */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center md:hidden">
        <div className="flex gap-4 bg-[#2a2a2a] p-3 rounded-2xl shadow-lg border border-[#333]">
          <Button
            onClick={() => handleMobileControllerClicked("left")}
            className="w-16 h-16 bg-[#444] hover:bg-[#555] text-xl"
          >
            ←
          </Button>

          <Button
            onClick={() => handleMobileControllerClicked("rotate")}
            className="w-16 h-16 bg-[#444] hover:bg-[#555] text-xl"
          >
            ↻
          </Button>

          <Button
            onClick={() => handleMobileControllerClicked("right")}
            className="w-16 h-16 bg-[#444] hover:bg-[#555] text-xl"
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
