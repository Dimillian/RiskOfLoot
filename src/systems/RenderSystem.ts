import { System } from '../ecs/System.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import type { Entity } from '../ecs/Entity.js';
import { POSITION_COMPONENT, type Position } from '../components/Position.js';
import {
  RENDERABLE_COMPONENT,
  type Renderable
} from '../components/Renderable.js';
import { STATS_COMPONENT, type Stats } from '../components/Stats.js';
import { MONSTER_COMPONENT } from '../components/Monster.js';
import { HEALTH_COMPONENT, type Health } from '../components/Health.js';

export class RenderSystem extends System {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerEntity: Entity;
  private gridSize = 50;
  private elapsedSeconds = 0;
  private forestColors = [
    '#0d2818', // Dark forest green
    '#1a4d2e', // Medium dark green
    '#2d5a3d', // Medium green
    '#3d6b47', // Lighter green
    '#4a7c59', // Light green
    '#2d5016', // Olive green
    '#1b4332', // Dark teal green
  ];

  private getViewportSize(): { width: number; height: number } {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    return { width, height };
  }

  constructor(
    componentRegistry: ComponentRegistry,
    canvas: HTMLCanvasElement,
    playerEntity: Entity
  ) {
    super(componentRegistry);
    this.canvas = canvas;
    this.playerEntity = playerEntity;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = context;
  }

  private getCameraOffset(): { x: number; y: number } {
    const playerPosition = this.componentRegistry.get<Position>(
      this.playerEntity,
      POSITION_COMPONENT
    );

    if (!playerPosition) {
      return { x: 0, y: 0 };
    }

    const { width, height } = this.getViewportSize();

    // Camera is centered on player
    return {
      x: playerPosition.x - width / 2,
      y: playerPosition.y - height / 2
    };
  }

  private drawGrid(cameraOffset: { x: number; y: number }): void {
    const { width, height } = this.getViewportSize();

    // Calculate which grid cells are visible based on camera position
    const startCol = Math.floor(cameraOffset.x / this.gridSize);
    const endCol = Math.ceil((cameraOffset.x + width) / this.gridSize);
    const startRow = Math.floor(cameraOffset.y / this.gridSize);
    const endRow = Math.ceil((cameraOffset.y + height) / this.gridSize);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const worldX = col * this.gridSize;
        const worldY = row * this.gridSize;

        // Convert world coordinates to screen coordinates
        const screenX = worldX - cameraOffset.x;
        const screenY = worldY - cameraOffset.y;

        // Use a simple hash function to get consistent colors per cell
        const hash = (col * 31 + row * 17) % this.forestColors.length;
        const color = this.forestColors[Math.abs(hash)];

        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, this.gridSize, this.gridSize);

        // Add subtle grid lines
        this.ctx.strokeStyle = '#0a1f0f';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, this.gridSize, this.gridSize);
      }
    }
  }

  private drawTimer(): void {
    const { width } = this.getViewportSize();
    const totalSeconds = Math.floor(this.elapsedSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    this.ctx.save();
    this.ctx.font = '700 20px "Trebuchet MS", "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(width / 2 - 60, 10, 120, 30);
    this.ctx.fillStyle = '#f5f1e6';
    this.ctx.fillText(timerText, width / 2, 14);
    this.ctx.restore();
  }

  private drawBar(
    x: number,
    y: number,
    width: number,
    height: number,
    fillRatio: number,
    fillColor: string,
    label: string
  ): void {
    const clampedRatio = Math.max(0, Math.min(1, fillRatio));

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(x, y, width, height);

    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x + 2, y + 2, (width - 4) * clampedRatio, height - 4);

    this.ctx.strokeStyle = '#f5f1e6';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.font = '600 14px "Trebuchet MS", "Segoe UI", sans-serif';
    this.ctx.fillStyle = '#f5f1e6';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x + 10, y + height / 2);
    this.ctx.restore();
  }

  private drawHealthBar(
    x: number,
    y: number,
    width: number,
    height: number,
    fillRatio: number
  ): void {
    const clampedRatio = Math.max(0, Math.min(1, fillRatio));

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(x, y, width, height);

    this.ctx.fillStyle = '#e84545';
    this.ctx.fillRect(x + 1, y + 1, (width - 2) * clampedRatio, height - 2);

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.restore();
  }

  private drawHud(): void {
    const stats = this.componentRegistry.get<Stats>(
      this.playerEntity,
      STATS_COMPONENT
    );
    if (!stats) return;

    const { width, height } = this.getViewportSize();
    const barWidth = Math.min(420, Math.floor(width * 0.7));
    const barHeight = 22;
    const left = Math.floor((width - barWidth) / 2);
    const xpY = height - barHeight * 2 - 18;
    const healthY = height - barHeight - 10;

    this.drawBar(
      left,
      xpY,
      barWidth,
      barHeight,
      stats.xpCurrent / stats.xpToNext,
      '#4aa3ff',
      `XP ${stats.xpCurrent}/${stats.xpToNext}  LV ${stats.level}`
    );
    this.drawBar(
      left,
      healthY,
      barWidth,
      barHeight,
      stats.healthCurrent / stats.healthMax,
      '#e84545',
      `HP ${stats.healthCurrent}/${stats.healthMax}`
    );
  }

  update(_deltaTime: number): void {
    this.elapsedSeconds += _deltaTime;
    // Get camera offset (centered on player)
    const cameraOffset = this.getCameraOffset();
    const { width, height } = this.getViewportSize();

    this.ctx.clearRect(0, 0, width, height);

    // Draw forest-like grid background
    this.drawGrid(cameraOffset);

    // Get all entities with renderable component
    const entitiesWithRenderable =
      this.componentRegistry.getEntitiesWith(RENDERABLE_COMPONENT);

    for (const entity of entitiesWithRenderable) {
      const position = this.componentRegistry.get<Position>(
        entity,
        POSITION_COMPONENT
      );
      const renderable = this.componentRegistry.get<Renderable>(
        entity,
        RENDERABLE_COMPONENT
      );

      if (!position || !renderable) continue;

      // Convert world coordinates to screen coordinates
      const screenX = position.x - cameraOffset.x;
      const screenY = position.y - cameraOffset.y;

      // Only render if entity is visible on screen
      if (
        screenX + renderable.radius < 0 ||
        screenX - renderable.radius > width ||
        screenY + renderable.radius < 0 ||
        screenY - renderable.radius > height
      ) {
        continue; // Skip rendering if outside viewport
      }

      // Draw circle
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, renderable.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = renderable.color;
      this.ctx.fill();

      // Draw health bar for monsters if health is not full
      const isMonster = this.componentRegistry.has(entity, MONSTER_COMPONENT);
      if (isMonster) {
        const health = this.componentRegistry.get<Health>(
          entity,
          HEALTH_COMPONENT
        );

        if (health && health.current < health.max) {
          const barWidth = renderable.radius * 2;
          const barHeight = 4;
          const barX = screenX - barWidth / 2;
          const barY = screenY - renderable.radius - barHeight - 4;

          this.drawHealthBar(
            barX,
            barY,
            barWidth,
            barHeight,
            health.current / health.max
          );
        }
      }
    }

    this.drawTimer();
    this.drawHud();
  }
}
