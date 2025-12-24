import { System } from '../ecs/System.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import type { Entity } from '../ecs/Entity.js';
import type { World } from '../ecs/World.js';
import { HEALTH_COMPONENT, type Health } from '../components/Health.js';
import { MONSTER_COMPONENT, type Monster } from '../components/Monster.js';
import { STATS_COMPONENT, type Stats } from '../components/Stats.js';

export class CombatSystem extends System {
  private world: World;
  private playerEntity: Entity;

  constructor(
    componentRegistry: ComponentRegistry,
    world: World,
    playerEntity: Entity
  ) {
    super(componentRegistry);
    this.world = world;
    this.playerEntity = playerEntity;
  }

  update(_deltaTime: number): void {
    const monsters = this.componentRegistry.getEntitiesWith(MONSTER_COMPONENT);
    const deadMonsters: Entity[] = [];

    // Check for dead monsters and collect XP
    for (const monsterEntity of monsters) {
      const monsterHealth = this.componentRegistry.get<Health>(
        monsterEntity,
        HEALTH_COMPONENT
      );
      const monster = this.componentRegistry.get<Monster>(
        monsterEntity,
        MONSTER_COMPONENT
      );

      if (!monsterHealth || !monster) continue;

      // Check if monster is dead
      if (monsterHealth.current <= 0) {
        deadMonsters.push(monsterEntity);

        // Grant XP to player
        const playerStats = this.componentRegistry.get<Stats>(
          this.playerEntity,
          STATS_COMPONENT
        );

        if (playerStats) {
          playerStats.xpCurrent += monster.xpReward;
        }
      }
    }

    // Remove dead monsters
    for (const deadMonster of deadMonsters) {
      this.world.destroyEntity(deadMonster);
    }
  }
}
