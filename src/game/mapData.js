/* ================================================================
   NEON BLADE — Map Data & Collision
   Arena layout: rectangular obstacles + circular pillars
   ================================================================ */

// Rectangular obstacles (walls / crates)
export const OBSTACLES = [
  { x: 200, y: 150, w: 60, h: 60 },
  { x: 540, y: 130, w: 70, h: 50 },
  { x: 350, y: 360, w: 100, h: 20 },
  { x: 120, y: 400, w: 50, h: 80 },
  { x: 620, y: 380, w: 60, h: 70 },
  { x: 380, y: 480, w: 40, h: 60 },
];

// Circular pillars (neon-lit columns)
export const PILLARS = [
  { x: 270, y: 250, r: 15 },
  { x: 530, y: 350, r: 15 },
  { x: 400, y: 180, r: 12 },
  { x: 180, y: 500, r: 12 },
  { x: 650, y: 200, r: 12 },
];

/* ── Helpers ─────────────────────────────────────────────────── */

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Circle vs AABB collision
 */
function collidesRect(px, py, pr, rect) {
  const cx = clamp(px, rect.x, rect.x + rect.w);
  const cy = clamp(py, rect.y, rect.y + rect.h);
  return dist({ x: px, y: py }, { x: cx, y: cy }) < pr;
}

/**
 * Circle vs circle collision
 */
function collidesCircle(px, py, pr, circ) {
  return dist({ x: px, y: py }, circ) < pr + circ.r;
}

/**
 * Check if a circle at (px, py) with radius pr collides
 * with any obstacle or pillar on the map.
 */
export function collidesAny(px, py, pr) {
  for (const o of OBSTACLES) {
    if (collidesRect(px, py, pr, o)) return true;
  }
  for (const p of PILLARS) {
    if (collidesCircle(px, py, pr, p)) return true;
  }
  return false;
}
