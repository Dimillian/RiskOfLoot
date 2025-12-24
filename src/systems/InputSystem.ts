import { System } from '../ecs/System.js';
import type { Entity } from '../ecs/Entity.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import { VELOCITY_COMPONENT, type Velocity } from '../components/Velocity.js';

type MovementKey = 'up' | 'down' | 'left' | 'right';

const KEY_TO_DIRECTION: Record<string, MovementKey> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right'
};

export class InputSystem extends System {
  private keys: Set<MovementKey> = new Set();
  private playerEntity: Entity;
  private readonly speed = 200; // pixels per second

  constructor(componentRegistry: ComponentRegistry, playerEntity: Entity) {
    super(componentRegistry);
    this.playerEntity = playerEntity;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const handleKeyChange = (e: KeyboardEvent, isDown: boolean) => {
      const key = KEY_TO_DIRECTION[e.code];
      if (!key) return;
      e.preventDefault();
      e.stopPropagation();
      if (isDown) {
        this.keys.add(key);
      } else {
        this.keys.delete(key);
      }
    };

    document.addEventListener('keydown', (e) => handleKeyChange(e, true));
    document.addEventListener('keyup', (e) => handleKeyChange(e, false));
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  update(_deltaTime: number): void {
    const velocity = this.componentRegistry.get<Velocity>(
      this.playerEntity,
      VELOCITY_COMPONENT
    );

    if (!velocity) {
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
  }
}
