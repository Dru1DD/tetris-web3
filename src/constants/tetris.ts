import type { Matrix } from '@/types/piece';

export const SEQUENCE = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'] as const;
export const COLORS: Record<string, string> = {
  I: '#00ffff',
  O: '#f5d300',
  T: '#a020f0',
  S: '#00b300',
  Z: '#ff2b2b',
  J: '#2b6df6',
  L: '#ff8c00',
};

export const FIRE_COLORS = [
  'rgba(255, 80, 0, 0.9)',
  'rgba(255, 140, 0, 0.9)',
  'rgba(255, 200, 50, 0.9)',
  'rgba(255, 255, 255, 0.7)',
];

export const TETROMINOS: Record<string, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  BRICK: [[1]],
};

export const IMAGES: Record<string, HTMLImageElement> = {};

for (const key in TETROMINOS) {
  const img = new Image();
  img.src = `/blocks/${key}.png`;
  IMAGES[key] = img;
}

export const ROWS = 20;
export const COLS = 10;
export const GRID = 22;

export const POINTS = 100;

export const CANVAS_WIDTH = COLS * GRID;
export const CANVAS_HEIGHT = ROWS * GRID;

export const PREVIEW_WIDTH = 60;
export const PREVIEW_HEIGHT = 60;

export const PREVIEW_LOGICAL_SIZE = GRID * 4;

export const DROP_SPEED = 500;

export const BRICK_MAX_ON_FIELD = 3;
export const BRICK_GRACE_PERIOD_MS = 2 * 60 * 1000;
export const BRICK_MAX_CHANCE = 0.1;
export const BRICK_CHANCE_RAMP_MS = 60 * 1000;
