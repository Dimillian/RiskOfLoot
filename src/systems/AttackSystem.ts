import { System } from '../ecs/System.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import type { Entity } from '../ecs/Entity.js';
import { POSITION_COMPONENT, type Position } from '../components/Position.js';
import { WEAPON_COMPONENT, type Weapon } from '../components/Weapon.js';
import { MONSTER_COMPONENT } from '../components/Monster.js';
import { HEALTH_COMPONENT, type Health } from '../components/Health.js';

export class AttackSystem extends System {
  private playerEntity: Entity;

  constructor(componentRegistry: ComponentRegistry, playerEntity: Entity) {
    super(componentRegistry);
    this.playerEntity = playerEntity;
  }

  private findNearestMonsterInRange(
    playerPosition: Position,
    weapon: Weapon
  ): Entity | null {
    const monsters = this.componentRegistry.getEntitiesWith(MONSTER_COMPONENT);
    let nearestMonster: Entity | null = null;
    let nearestDistance = weapon.range;

    for (const monsterEntity of monsters) {
      const monsterPosition = this.componentRegistry.get<Position>(
        monsterEntity,
        POSITION_COMPONENT
      );

      if (!monsterPosition) continue;

      const dx = monsterPosition.x - playerPosition.x;
      const dy = monsterPosition.y - playerPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= weapon.range && distance < nearestDistance) {
        nearestDistance = distance;
        nearestMonster = monsterEntity;
      }
    }

    return nearestMonster;
  }

  update(deltaTime: number): void {
    const playerPosition = this.componentRegistry.get<Position>(
      this.playerEntity,
      POSITION_COMPONENT
    );
    const weapon = this.componentRegistry.get<Weapon>(
      this.playerEntity,
      WEAPON_COMPONENT
    );

    if (!playerPosition || !weapon) return;

    // Update cooldown
    if (weapon.cooldownRemaining > 0) {
      weapon.cooldownRemaining -= deltaTime;
      if (weapon.cooldownRemaining < 0) {
        weapon.cooldownRemaining = 0;
      }
    }

    // Check if we can attack
    if (weapon.cooldownRemaining > 0) return;

    // Find nearest monster in range
    const targetMonster = this.findNearestMonsterInRange(
      playerPosition,
      weapon
    );

    if (!targetMonster) return;

    // Apply damage to monster
    const monsterHealth = this.componentRegistry.get<Health>(
      targetMonster,
      HEALTH_COMPONENT
    );

    if (monsterHealth) {
      monsterHealth.current -= weapon.damage;
      if (monsterHealth.current < 0) {
        monsterHealth.current = 0;
      }
    }

    // Reset cooldown
    weapon.cooldownRemaining = weapon.attackCooldown;
  }
}
