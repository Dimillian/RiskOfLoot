import { System } from '../ecs/System.js';
import type { ComponentRegistry } from '../ecs/Component.js';
import type { Entity } from '../ecs/Entity.js';
import type { World } from '../ecs/World.js';
import { POSITION_COMPONENT, type Position } from '../components/Position.js';
import { VELOCITY_COMPONENT, type Velocity } from '../components/Velocity.js';
import {
  RENDERABLE_COMPONENT,
  type Renderable
} from '../components/Renderable.js';
import { HEALTH_COMPONENT, type Health } from '../components/Health.js';
import { MONSTER_COMPONENT, type Monster } from '../components/Monster.js';

export class MonsterSpawnSystem extends System {
  private world: World;
  private playerEntity: Entity;
  private spawnTimer = 0;
  private readonly spawnInterval = 5; // seconds
  private readonly spawnDistance = 400; // pixels from player

  constructor(
    componentRegistry: ComponentRegistry,
    world: World,
    playerEntity: Entity
  ) {
    super(componentRegistry);
    this.world = world;
    this.playerEntity = playerEntity;
  }

  private getViewportSize(): { width: number; height: number } {
    // Approximate viewport size for spawn calculations
    return { width: 1920, height: 1080 };
  }

  private spawnMonster(): void {
    const playerPosition = this.componentRegistry.get<Position>(
      this.playerEntity,
      POSITION_COMPONENT
    );

    if (!playerPosition) return;

    const { width, height } = this.getViewportSize();
    const spawnRadius = Math.max(width, height) / 2 + this.spawnDistance;

    // Random angle around player
    const angle = Math.random() * Math.PI * 2;
    const spawnX = playerPosition.x + Math.cos(angle) * spawnRadius;
    const spawnY = playerPosition.y + Math.sin(angle) * spawnRadius;

    // Create monster entity
    const monsterEntity = this.world.createEntity();

    // Add components
    this.componentRegistry.set<Position>(monsterEntity, POSITION_COMPONENT, {
      x: spawnX,
      y: spawnY
    });

    this.componentRegistry.set<Velocity>(monsterEntity, VELOCITY_COMPONENT, {
      vx: 0,
      vy: 0
    });

    this.componentRegistry.set<Renderable>(
      monsterEntity,
      RENDERABLE_COMPONENT,
      {
        color: '#ff0000',
        radius: 15
      }
    );

    this.componentRegistry.set<Health>(monsterEntity, HEALTH_COMPONENT, {
      current: 50,
      max: 50
    });

    this.componentRegistry.set<Monster>(monsterEntity, MONSTER_COMPONENT, {
      speed: 100,
      xpReward: 10
    });
  }

  update(deltaTime: number): void {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnMonster();
      this.spawnTimer = 0;
    }
  }
}
