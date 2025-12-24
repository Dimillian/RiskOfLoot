export interface Weapon {
  damage: number;
  attackCooldown: number;
  cooldownRemaining: number;
  range: number;
}

export const WEAPON_COMPONENT = 'Weapon';
