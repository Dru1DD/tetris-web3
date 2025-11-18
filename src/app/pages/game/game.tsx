import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEventHandler,
} from "react";
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

  function resize() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const cssWidth = Math.min(window.innerWidth, CANVAS_WIDTH);
    const cssHeight = Math.min(window.innerHeight, CANVAS_HEIGHT);

    const scale = Math.min(cssWidth / CANVAS_WIDTH, cssHeight / CANVAS_HEIGHT);

    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;

    canvas.style.width = `${CANVAS_WIDTH * scale}px`;
    canvas.style.height = `${CANVAS_HEIGHT * scale}px`;

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  }

  useEffect(() => {
    resize();
    // resizePreview();
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

    const ctx = canvas.getContext("2d");
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
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!p) return;

    const matrix = TETROMINOS[p];
    const size = GRID;

    const pw = matrix[0].length * size;
    const ph = matrix.length * size;
    const offsetX = (canvas.width - pw) / 2;
    const offsetY = (canvas.height - ph) / 2;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          ctx.drawImage(
            IMAGES[p],
            offsetX + c * size,
            offsetY + r * size,
            size,
            size
          );
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

  // Buttons movement

  const handleLeftButtonClicked: TouchEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (!piece || !running) return;
    const moved = { ...piece, col: piece.col - 1 };
    if (!hasCollision(playfield, moved)) setPiece(moved);
  };

  const handleRightButtonClicked: TouchEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (!piece || !running) return;
    const moved = { ...piece, col: piece.col + 1 };
    if (!hasCollision(playfield, moved)) setPiece(moved);
  };

  const handleUpButtonClicked: TouchEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (!piece || !running) return;
    const rotated = { ...piece, matrix: rotateTetromino(piece.matrix) };
    if (!hasCollision(playfield, rotated)) setPiece(rotated);
  };

  const handleDownButtonClicked: TouchEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (!piece || !running) return;

    const moved = { ...piece };

    while (!hasCollision(playfield, { ...moved, row: moved.row + 1 })) {
      moved.row++;
    }

    setPiece(moved);

    dropCounterRef.current = dropInterval;
  };
  return (
    <div className="h-screen w-full bg-[#1f1f1f] flex flex-col items-center justify-start p-4 md:justify-center md:gap-1">
      <div className="w-full max-w-md md:max-w-xs flex justify-between items-center mb-4 md:mb-0 text-white">
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
        <div className="flex flex-col items-center">
          <h3 className="text-sm text-zinc-400">Next</h3>
          <canvas
            ref={previewRef}
            width={GRID * 4}
            height={GRID * 4}
            className="block rounded-md border border-[#333]"
            style={{
              width: "60px",
              height: "60px",
            }}
          />
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-sm text-zinc-400">Score</h3>
          <div className="text-2xl font-mono">{score}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border border-[#444] bg-black shadow-xl"
        />

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

      <div className="fixed bottom-4 left-0 right-0 flex justify-center md:hidden">
        <div className="flex gap-4 bg-[#2a2a2a] p-3 rounded-2xl shadow-lg border border-[#333]">
          <Button
            onTouchStart={handleLeftButtonClicked}
            className="w-16 h-16 bg-[#444] hover:bg-[#555] text-xl"
          >
            ←
          </Button>

          <Button
            onTouchStart={handleUpButtonClicked}
            className="w-16 h-16 bg-[#444] hover:bg-[#555] text-xl"
          >
            ↑
          </Button>
          <Button
            onTouchStart={handleDownButtonClicked}
            className="w-16 h-16 bg-[#444] hover:bg-[#555] text-xl"
          >
            ↓
          </Button>

          <Button
            onTouchStart={handleRightButtonClicked}
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
