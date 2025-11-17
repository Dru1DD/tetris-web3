import { COLS, FIRE_COLORS, GRID, ROWS } from "@/constants/tetris";
import type { Matrix, Piece } from "@/types/piece";

export const rotateTetromino = (matrix: Matrix): Matrix => {
    const N = matrix.length - 1;
    return matrix.map((row, i) => row.map((_, j) => matrix[N - j][i]));
};

export const createPlayfield = () => {
    const field: (string | 0)[][] = [];
    for (let r = 0; r < ROWS; r++) {
        field[r] = [];
        for (let c = 0; c < COLS; c++) field[r][c] = 0;
    }
    return field;
};

export const hasCollision = (pf: (string | 0)[][], piece: Piece): boolean => {
    for (let r = 0; r < piece.matrix.length; r++) {
        for (let c = 0; c < piece.matrix[r].length; c++) {
            if (piece.matrix[r][c]) {
                const pr = piece.row + r;
                const pc = piece.col + c;
                if (pc < 0 || pc >= COLS) return true;
                if (pr < 0) continue;
                if (pf[pr] === undefined || pf[pr][pc] === undefined || pf[pr][pc]) {
                    return true;
                }
            }
        }
    }
    return false;
};


export function drawFire(ctx: CanvasRenderingContext2D, c: number, r: number) {
    const x = c * GRID;
    const y = r * GRID;

    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)];
        ctx.fillRect(
            x + Math.random() * GRID,
            y + Math.random() * GRID,
            4 + Math.random() * 6,
            4 + Math.random() * 6
        );
    }
}
