import type { Entity } from './Entity.js';
import { ComponentRegistry } from './Component.js';
import type { System } from './System.js';

export class World {
  private nextEntityId = 0;
  private componentRegistry: ComponentRegistry;
  private systems: System[] = [];

  constructor() {
    this.componentRegistry = new ComponentRegistry();
  }

  createEntity(): Entity {
    return this.nextEntityId++;
  }

  getComponentRegistry(): ComponentRegistry {
    return this.componentRegistry;
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  update(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }
}
