import { World } from '../ecs/World.js';
import type { Entity } from '../ecs/Entity.js';
import { POSITION_COMPONENT, type Position } from '../components/Position.js';
import { VELOCITY_COMPONENT, type Velocity } from '../components/Velocity.js';
import {
  RENDERABLE_COMPONENT,
  type Renderable
} from '../components/Renderable.js';
import { InputSystem } from '../systems/InputSystem.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { RenderSystem } from '../systems/RenderSystem.js';

export class Game {
  private world: World;
  private canvas: HTMLCanvasElement;
  private playerEntity: Entity;
  private lastTime = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.world = new World();

    // Create player entity
    this.playerEntity = this.world.createEntity();

    // Add components to player
    const componentRegistry = this.world.getComponentRegistry();
    // Start player at world position - camera will center on them
    // Using a reasonable starting position in world space
    componentRegistry.set<Position>(this.playerEntity, POSITION_COMPONENT, {
      x: 1000,
      y: 1000
    });
    componentRegistry.set<Velocity>(this.playerEntity, VELOCITY_COMPONENT, {
      vx: 0,
      vy: 0
    });
    componentRegistry.set<Renderable>(this.playerEntity, RENDERABLE_COMPONENT, {
      color: '#00ff00',
      radius: 20
    });

    // Add systems
    this.world.addSystem(
      new InputSystem(componentRegistry, this.playerEntity)
    );
    this.world.addSystem(new MovementSystem(componentRegistry));
    this.world.addSystem(new RenderSystem(componentRegistry, canvas, this.playerEntity));

    // Refocus canvas on click to ensure keyboard input works
    canvas.addEventListener('click', () => {
      canvas.focus();
    });
  }

  start(): void {
    // Focus the canvas so it can receive keyboard events
    this.canvas.focus();
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
  }

  private gameLoop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    let deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds

    // Clamp deltaTime to prevent large jumps (e.g., when tab is inactive)
    deltaTime = Math.min(deltaTime, 0.1); // Max 100ms per frame

    this.lastTime = currentTime;

    // Update all systems
    this.world.update(deltaTime);

    // Request next frame
    requestAnimationFrame(this.gameLoop);
  };
}
