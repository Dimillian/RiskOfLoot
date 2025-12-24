import { System } from '../ecs/System.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import type { Entity } from '../ecs/Entity.js';
import { POSITION_COMPONENT, type Position } from '../components/Position.js';
import { VELOCITY_COMPONENT, type Velocity } from '../components/Velocity.js';
import { MONSTER_COMPONENT, type Monster } from '../components/Monster.js';

export class MonsterAISystem extends System {
  private playerEntity: Entity;

  constructor(componentRegistry: ComponentRegistry, playerEntity: Entity) {
    super(componentRegistry);
    this.playerEntity = playerEntity;
  }

  update(_deltaTime: number): void {
    const playerPosition = this.componentRegistry.get<Position>(
      this.playerEntity,
      POSITION_COMPONENT
    );

    if (!playerPosition) return;

    const monsters = this.componentRegistry.getEntitiesWith(MONSTER_COMPONENT);

    for (const monsterEntity of monsters) {
      const monsterPosition = this.componentRegistry.get<Position>(
        monsterEntity,
        POSITION_COMPONENT
      );
      const monsterVelocity = this.componentRegistry.get<Velocity>(
        monsterEntity,
        VELOCITY_COMPONENT
      );
      const monster = this.componentRegistry.get<Monster>(
        monsterEntity,
        MONSTER_COMPONENT
      );

      if (!monsterPosition || !monsterVelocity || !monster) continue;

      // Calculate direction vector from monster to player
      const dx = playerPosition.x - monsterPosition.x;
      const dy = playerPosition.y - monsterPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Normalize direction and apply monster speed
      if (distance > 0) {
        monsterVelocity.vx = (dx / distance) * monster.speed;
        monsterVelocity.vy = (dy / distance) * monster.speed;
      } else {
        monsterVelocity.vx = 0;
        monsterVelocity.vy = 0;
      }
    }
  }
}
