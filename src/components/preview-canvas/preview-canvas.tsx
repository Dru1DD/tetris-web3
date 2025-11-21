import React, { useEffect, useRef } from 'react';
import { GRID, IMAGES, TETROMINOS } from '@/constants/tetris';

interface PreviewProps {
  pieceName: string | null;
}

const SIZE_PX = 50;
const Preview: React.FC<PreviewProps> = ({ pieceName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    const cssWidth = SIZE_PX;
    const cssHeight = SIZE_PX;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    if (!pieceName) return;

    const matrix = TETROMINOS[pieceName];
    if (!matrix) return;

    const blockSize = GRID;

    const pw = matrix[0].length * blockSize;
    const ph = matrix.length * blockSize;

    const scaleFactor = Math.min(cssWidth / pw, cssHeight / ph);

    const displayBlock = blockSize * scaleFactor;

    const totalW = matrix[0].length * displayBlock;
    const totalH = matrix.length * displayBlock;

    const offsetX = (cssWidth - totalW) / 2;
    const offsetY = (cssHeight - totalH) / 2;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const img = IMAGES[pieceName];
          if (!img) continue;
          ctx.drawImage(img, offsetX + c * displayBlock, offsetY + r * displayBlock, displayBlock, displayBlock);
        }
      }
    }
  }, [pieceName]);

  return (
    <canvas
      ref={canvasRef}
      className="bg-white text-black w-13 h-13 sprite sprite-shadows"
      style={{
        width: `${SIZE_PX}px`,
        height: `${SIZE_PX}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default Preview;
