/* ================================================================
   NEON BLADE — Entity Factories
   Functions to create enemies and damage particles
   ================================================================ */

import {
  ARENA_W, ARENA_H, SPAWN_MARGIN,
  ENEMY_SIZE, ENEMY_SPEED_BASE,
  ENEMY_FIRE_RATE_NORMAL, ENEMY_FIRE_RATE_TANK, ENEMY_FIRE_RATE_FAST,
} from './constants.js';

/**
 * Spawn a new enemy at a random edge of the arena.
 * Enemy type is randomized based on wave number.
 *
 * @param {number} wave - Current wave number (affects stats)
 * @returns {object} Enemy entity
 */
export function spawnEnemy(wave) {
  // Pick a random edge
  const sides = [
    { x: Math.random() * ARENA_W, y: -SPAWN_MARGIN },
    { x: Math.random() * ARENA_W, y: ARENA_H + SPAWN_MARGIN },
    { x: -SPAWN_MARGIN, y: Math.random() * ARENA_H },
    { x: ARENA_W + SPAWN_MARGIN, y: Math.random() * ARENA_H },
  ];
  const pos = sides[Math.floor(Math.random() * 4)];

  // Determine type
  const isFast = Math.random() < 0.2 + wave * 0.02;
  const isTank = !isFast && Math.random() < 0.15 + wave * 0.01;

  if (isTank) {
    return {
      x: pos.x, y: pos.y,
      hp: 3, maxHp: 3,
      speed: ENEMY_SPEED_BASE * 0.7,
      size: 18,
      type: 'tank',
      color: '#f59e0b',
      hitFlash: 0,
      alive: true,
      angle: 0,
      fireCd: ENEMY_FIRE_RATE_TANK * Math.random(), // stagger initial shots
      fireRate: ENEMY_FIRE_RATE_TANK,
    };
  }

  if (isFast) {
    return {
      x: pos.x, y: pos.y,
      hp: 1, maxHp: 1,
      speed: ENEMY_SPEED_BASE * 1.6,
      size: 11,
      type: 'fast',
      color: '#ef4444',
      hitFlash: 0,
      alive: true,
      angle: 0,
      fireCd: ENEMY_FIRE_RATE_FAST * Math.random(),
      fireRate: ENEMY_FIRE_RATE_FAST,
    };
  }

  // Normal
  return {
    x: pos.x, y: pos.y,
    hp: 1, maxHp: 1,
    speed: ENEMY_SPEED_BASE + wave * 3,
    size: ENEMY_SIZE,
    type: 'normal',
    color: '#a855f7',
    hitFlash: 0,
    alive: true,
    angle: 0,
    fireCd: ENEMY_FIRE_RATE_NORMAL * Math.random(),
    fireRate: ENEMY_FIRE_RATE_NORMAL,
  };
}

/**
 * Create a burst of damage/death particles at a position.
 *
 * @param {number} x
 * @param {number} y
 * @param {string} color - CSS color
 * @param {number} count - Number of particles
 * @returns {object[]} Array of particle entities
 */
export function spawnParticles(x, y, color, count = 6) {
  return Array.from({ length: count }, () => {
    const life = 0.3 + Math.random() * 0.3;
    return {
      x, y,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      life,
      maxLife: life,
      size: 2 + Math.random() * 3,
      color,
    };
  });
}
