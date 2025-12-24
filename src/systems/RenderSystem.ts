import { System } from '../ecs/System.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import type { Entity } from '../ecs/Entity.js';
import { POSITION_COMPONENT, type Position } from '../components/Position.js';
import {
  RENDERABLE_COMPONENT,
  type Renderable
} from '../components/Renderable.js';

export class RenderSystem extends System {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerEntity: Entity;
  private gridSize = 50;
  private forestColors = [
    '#0d2818', // Dark forest green
    '#1a4d2e', // Medium dark green
    '#2d5a3d', // Medium green
    '#3d6b47', // Lighter green
    '#4a7c59', // Light green
    '#2d5016', // Olive green
    '#1b4332', // Dark teal green
  ];

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

    // Camera is centered on player
    return {
      x: playerPosition.x - this.canvas.width / 2,
      y: playerPosition.y - this.canvas.height / 2
    };
  }

  private drawGrid(cameraOffset: { x: number; y: number }): void {
    // Calculate which grid cells are visible based on camera position
    const startCol = Math.floor(cameraOffset.x / this.gridSize);
    const endCol = Math.ceil((cameraOffset.x + this.canvas.width) / this.gridSize);
    const startRow = Math.floor(cameraOffset.y / this.gridSize);
    const endRow = Math.ceil((cameraOffset.y + this.canvas.height) / this.gridSize);

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

  update(_deltaTime: number): void {
    // Get camera offset (centered on player)
    const cameraOffset = this.getCameraOffset();

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
        screenX - renderable.radius > this.canvas.width ||
        screenY + renderable.radius < 0 ||
        screenY - renderable.radius > this.canvas.height
      ) {
        continue; // Skip rendering if outside viewport
      }

      // Draw circle
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, renderable.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = renderable.color;
      this.ctx.fill();
    }
  }
}
