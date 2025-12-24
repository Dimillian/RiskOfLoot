import type { Entity } from './Entity.js';

export type ComponentType = string;

export class ComponentRegistry {
  private components = new Map<ComponentType, Map<Entity, unknown>>();

  set<T>(entity: Entity, componentType: ComponentType, component: T): void {
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    this.components.get(componentType)!.set(entity, component);
  }

  get<T>(entity: Entity, componentType: ComponentType): T | undefined {
    const componentMap = this.components.get(componentType);
    return componentMap?.get(entity) as T | undefined;
  }

  has(entity: Entity, componentType: ComponentType): boolean {
    return this.components.get(componentType)?.has(entity) ?? false;
  }

  remove(entity: Entity, componentType: ComponentType): void {
    this.components.get(componentType)?.delete(entity);
  }

  getAll<T>(componentType: ComponentType): Map<Entity, T> {
    return (this.components.get(componentType) as Map<Entity, T>) ?? new Map();
  }

  getEntitiesWith(componentType: ComponentType): Entity[] {
    const componentMap = this.components.get(componentType);
    return componentMap ? Array.from(componentMap.keys()) : [];
  }
}
