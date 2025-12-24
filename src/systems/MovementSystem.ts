import { System } from '../ecs/System.js';
import { POSITION_COMPONENT, type Position } from '../components/Position.js';
import { VELOCITY_COMPONENT, type Velocity } from '../components/Velocity.js';

export class MovementSystem extends System {
  update(deltaTime: number): void {
    const entitiesWithVelocity = this.componentRegistry.getEntitiesWith(
      VELOCITY_COMPONENT
    );

    for (const entity of entitiesWithVelocity) {
      const velocity = this.componentRegistry.get<Velocity>(
        entity,
        VELOCITY_COMPONENT
      );
      const position = this.componentRegistry.get<Position>(
        entity,
        POSITION_COMPONENT
      );

      if (!velocity || !position) continue;

      // Update position based on velocity and delta time
      position.x += velocity.vx * deltaTime;
      position.y += velocity.vy * deltaTime;
    }
  }
}
