/* ================================================================
   NEON BLADE — Game Constants
   All tunable gameplay parameters (SHOOTER edition)
   ================================================================ */

// Arena dimensions
export const ARENA_W = 800;
export const ARENA_H = 600;

// Player
export const PLAYER_SIZE = 16;
export const PLAYER_SPEED = 180;

// Shooting
export const BULLET_SPEED = 500;
export const BULLET_SIZE = 3;
export const BULLET_DAMAGE = 1;
export const BULLET_LIFETIME = 1.5;       // seconds before despawn
export const FIRE_RATE = 0.12;            // seconds between shots (auto-fire)
export const MUZZLE_FLASH_DURATION = 0.06;
export const GUN_LENGTH = 22;             // visual barrel length from center
export const BULLET_TRAIL_LENGTH = 12;    // trail tail length in px

// Dash
export const DASH_SPEED = 550;
export const DASH_DURATION = 0.15;        // seconds
export const DASH_COOLDOWN = 3.0;         // seconds
export const DASH_STAMINA_COST = 25;

// Stamina
export const STAMINA_REGEN_RATE = 12;     // per second

// Enemy
export const ENEMY_SIZE = 14;
export const ENEMY_SPEED_BASE = 50;
export const ENEMY_DAMAGE_NORMAL = 8;
export const ENEMY_DAMAGE_FAST = 5;
export const ENEMY_DAMAGE_TANK = 14;
export const PLAYER_INVULN_TIME = 0.5;    // seconds after taking damage

// Spawning
export const SPAWN_MARGIN = 60;
export const MAX_ENEMIES_BASE = 12;
export const MAX_ENEMIES_PER_WAVE = 2;
export const INITIAL_ENEMY_COUNT = 4;
export const WAVE_BURST_BASE = 3;

// Waves
export const WAVE_INTERVAL = 25;          // seconds per wave

// Combo
export const COMBO_TIMEOUT = 2500;        // ms
export const KILL_SCORE_BASE = 50;
export const KILL_SCORE_PER_COMBO = 10;
export const PASSIVE_SCORE_RATE = 2;      // per second

// Visual / Screen shake
export const SCREEN_SHAKE_HIT = 0.06;
export const SCREEN_SHAKE_KILL = 0.1;
export const SCREEN_SHAKE_DAMAGE = 0.15;
export const SHAKE_INTENSITY_HIT = 2;
export const SHAKE_INTENSITY_KILL = 4;
export const SHAKE_INTENSITY_DAMAGE = 6;
