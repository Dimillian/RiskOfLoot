import type { ComponentRegistry } from './Component.js';

export abstract class System {
  protected componentRegistry: ComponentRegistry;

  constructor(componentRegistry: ComponentRegistry) {
    this.componentRegistry = componentRegistry;
  }

  abstract update(deltaTime: number): void;
}
