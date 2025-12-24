import { Game } from './game/Game.js';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (!canvas) {
  throw new Error('Canvas element not found');
}

const resizeCanvasForHiDpi = (target: HTMLCanvasElement): void => {
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = target.width;
  const logicalHeight = target.height;

  target.style.width = `${logicalWidth}px`;
  target.style.height = `${logicalHeight}px`;
  target.width = Math.max(1, Math.floor(logicalWidth * dpr));
  target.height = Math.max(1, Math.floor(logicalHeight * dpr));

  const context = target.getContext('2d');
  if (context) {
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
};

resizeCanvasForHiDpi(canvas);

const game = new Game(canvas);
game.start();
