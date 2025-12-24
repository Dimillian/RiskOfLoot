import { System } from '../ecs/System.js';
import type { Entity } from '../ecs/Entity.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import { VELOCITY_COMPONENT, type Velocity } from '../components/Velocity.js';
import { RENDERABLE_COMPONENT, type Renderable } from '../components/Renderable.js';

export class InputSystem extends System {
  private keys: Set<string> = new Set();
  private playerEntity: Entity;
  private speed = 200; // pixels per second

  constructor(componentRegistry: ComponentRegistry, playerEntity: Entity) {
    super(componentRegistry);
    this.playerEntity = playerEntity;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use e.code for more reliable key detection
      const code = e.code;
      let key: string | null = null;

      // Map physical key codes to our key names
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          key = 'up';
          break;
        case 'KeyS':
        case 'ArrowDown':
          key = 'down';
          break;
        case 'KeyA':
        case 'ArrowLeft':
          key = 'left';
          break;
        case 'KeyD':
        case 'ArrowRight':
          key = 'right';
          break;
      }

      if (key) {
        e.preventDefault();
        e.stopPropagation();
        this.keys.add(key);
        console.log('Key pressed:', key, 'All keys:', Array.from(this.keys));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      let key: string | null = null;

      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          key = 'up';
          break;
        case 'KeyS':
        case 'ArrowDown':
          key = 'down';
          break;
        case 'KeyA':
        case 'ArrowLeft':
          key = 'left';
          break;
        case 'KeyD':
        case 'ArrowRight':
          key = 'right';
          break;
      }

      if (key) {
        e.preventDefault();
        e.stopPropagation();
        this.keys.delete(key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }

  update(_deltaTime: number): void {
    // Debug: log every update call when keys are pressed
    if (this.keys.size > 0) {
      console.log('InputSystem.update called, keys:', Array.from(this.keys), 'playerEntity:', this.playerEntity);
    }

    // Entity is a number type, so 0 is a valid entity ID
    // No need to check for null/undefined since Entity is always a number

    const velocity = this.componentRegistry.get<Velocity>(
      this.playerEntity,
      VELOCITY_COMPONENT
    );

    if (!velocity) {
      console.warn('InputSystem: Velocity component not found for entity', this.playerEntity);
      return;
    }

    // Reset velocity
    velocity.vx = 0;
    velocity.vy = 0;

    // Update velocity based on pressed keys
    if (this.keys.has('up')) {
      velocity.vy = -this.speed;
    }
    if (this.keys.has('down')) {
      velocity.vy = this.speed;
    }
    if (this.keys.has('left')) {
      velocity.vx = -this.speed;
    }
    if (this.keys.has('right')) {
      velocity.vx = this.speed;
    }

    // Normalize diagonal movement
    if (velocity.vx !== 0 && velocity.vy !== 0) {
      const length = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2);
      velocity.vx = (velocity.vx / length) * this.speed;
      velocity.vy = (velocity.vy / length) * this.speed;
    }

    // Debug: log velocity if keys are pressed and change player color
    if (this.keys.size > 0) {
      console.log('Velocity set to:', { vx: velocity.vx, vy: velocity.vy });

      // Change player color to yellow when moving (visual indicator)
      const renderable = this.componentRegistry.get<Renderable>(
        this.playerEntity,
        RENDERABLE_COMPONENT
      );
      if (renderable) {
        renderable.color = '#ffff00'; // Yellow when moving
      }
    } else {
      // Reset to green when not moving
      const renderable = this.componentRegistry.get<Renderable>(
        this.playerEntity,
        RENDERABLE_COMPONENT
      );
      if (renderable) {
        renderable.color = '#00ff00'; // Green when idle
      }
    }
  }
}
