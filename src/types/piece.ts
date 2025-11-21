export type Matrix = number[][];

export interface Piece {
  name: string;
  matrix: Matrix;
  row: number;
  col: number;
}
