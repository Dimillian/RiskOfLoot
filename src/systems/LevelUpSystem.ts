import { System } from '../ecs/System.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import type { Entity } from '../ecs/Entity.js';
import { STATS_COMPONENT, type Stats } from '../components/Stats.js';
import { WEAPON_COMPONENT, type Weapon } from '../components/Weapon.js';

export class LevelUpSystem extends System {
  private playerEntity: Entity;

  constructor(componentRegistry: ComponentRegistry, playerEntity: Entity) {
    super(componentRegistry);
    this.playerEntity = playerEntity;
  }

  update(_deltaTime: number): void {
    const stats = this.componentRegistry.get<Stats>(
      this.playerEntity,
      STATS_COMPONENT
    );
    const weapon = this.componentRegistry.get<Weapon>(
      this.playerEntity,
      WEAPON_COMPONENT
    );

    if (!stats || !weapon) return;

    // Check if player should level up
    while (stats.xpCurrent >= stats.xpToNext) {
      // Level up
      stats.level += 1;
      stats.xpCurrent -= stats.xpToNext;

      // Increase max health by 20%
      stats.healthMax = Math.floor(stats.healthMax * 1.2);
      // Heal to full on level up
      stats.healthCurrent = stats.healthMax;

      // Increase weapon damage by 10%
      weapon.damage = Math.floor(weapon.damage * 1.1);

      // Increase attack speed by 5% (reduce cooldown)
      weapon.attackCooldown *= 0.95;
      // Ensure cooldown doesn't go below a minimum
      if (weapon.attackCooldown < 0.1) {
        weapon.attackCooldown = 0.1;
      }

      // Calculate new XP requirement (scales linearly with level)
      stats.xpToNext = 100 * stats.level;
    }
  }
}
