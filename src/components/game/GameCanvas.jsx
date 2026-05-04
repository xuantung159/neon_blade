/* ================================================================
   NEON BLADE — GameCanvas
   CONTROLS:  Left-click  = move to clicked position
              Right-click (hold) = auto-fire toward cursor
              Middle-click / double-click = dash
   No keyboard needed — works in iframe/web.
   ================================================================ */

import React, { useEffect, useRef } from 'react';
import {
  ARENA_W, ARENA_H, PLAYER_SIZE, PLAYER_SPEED,
  BULLET_SPEED, BULLET_SIZE, BULLET_DAMAGE, BULLET_LIFETIME,
  FIRE_RATE, MUZZLE_FLASH_DURATION, GUN_LENGTH, BULLET_TRAIL_LENGTH,
  DASH_SPEED, DASH_DURATION, DASH_COOLDOWN, DASH_STAMINA_COST,
  STAMINA_REGEN_RATE, ENEMY_DAMAGE_NORMAL, ENEMY_DAMAGE_FAST,
  ENEMY_DAMAGE_TANK, PLAYER_INVULN_TIME,
  MAX_ENEMIES_BASE, MAX_ENEMIES_PER_WAVE, INITIAL_ENEMY_COUNT,
  WAVE_BURST_BASE, WAVE_INTERVAL, COMBO_TIMEOUT,
  KILL_SCORE_BASE, KILL_SCORE_PER_COMBO, PASSIVE_SCORE_RATE,
  SCREEN_SHAKE_HIT, SCREEN_SHAKE_KILL, SCREEN_SHAKE_DAMAGE,
  SHAKE_INTENSITY_HIT, SHAKE_INTENSITY_KILL, SHAKE_INTENSITY_DAMAGE,
  ENEMY_BULLET_SPEED, ENEMY_BULLET_SIZE, ENEMY_BULLET_DAMAGE,
  ENEMY_BULLET_LIFETIME, ENEMY_SHOOT_RANGE, ENEMY_SHOOT_MIN_RANGE,
  ENEMY_BULLET_SPREAD,
} from '../../game/constants.js';
import { OBSTACLES, PILLARS, collidesAny } from '../../game/mapData.js';
import { spawnEnemy, spawnParticles } from '../../game/entities.js';

/* ── Helpers ──────────────────────────────────────────── */
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

const ARRIVE_THRESHOLD = 5; // stop moving when within this distance of target

export default function GameCanvas({ paused, onDeath, onUpdate }) {
  const canvasRef   = useRef(null);
  const stateRef    = useRef(null);
  const rafRef      = useRef(null);
  const lastRef     = useRef(0);
  const pausedRef   = useRef(paused);
  const onDeathRef  = useRef(onDeath);
  const onUpdateRef = useRef(onUpdate);

  // Mouse / input state
  const mouseRef = useRef({ x: ARENA_W / 2, y: ARENA_H / 2 });
  const moveTargetRef = useRef(null);       // {x, y} or null
  const rightDownRef  = useRef(false);      // right mouse held
  const wantDashRef   = useRef(false);

  useEffect(() => { onDeathRef.current = onDeath; }, [onDeath]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  /* ── Init ──────────────────────────────────────────────── */
  useEffect(() => {
    const enemies = [];
    for (let i = 0; i < INITIAL_ENEMY_COUNT; i++) enemies.push(spawnEnemy(1));

    stateRef.current = {
      player: {
        x: ARENA_W / 2, y: ARENA_H / 2, angle: 0,
        fireCd: 0, muzzleFlash: 0,
        dashing: false, dashTimer: 0, dashCd: 0, dashAngle: 0,
        hp: 100, maxHp: 100, stamina: 100, maxStamina: 100,
        invuln: 0, hitFlash: 0, trail: [],
      },
      enemies, bullets: [], enemyBullets: [], particles: [],
      score: 0, wave: 1, time: 0, kills: 0,
      combo: { count: 0, lastHit: 0, maxCombo: 0 },
      spawnTimer: 0, nextSpawnInterval: 2,
      screenShake: 0, shakeIntensity: 0, dead: false,
    };
  }, []);

  /* ── Canvas coordinate helper ──────────────────────────── */
  function canvasCoords(e) {
    const cv = canvasRef.current;
    if (!cv) return { x: 0, y: 0 };
    const r = cv.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (ARENA_W / r.width),
      y: (e.clientY - r.top) * (ARENA_H / r.height),
    };
  }

  /* ── Mouse input ───────────────────────────────────────── */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    // Prevent context menu on right-click
    const ctxMenu = (e) => e.preventDefault();

    const onMove = (e) => {
      const pos = canvasCoords(e);
      mouseRef.current = pos;
      // If left button held, update move target continuously
      if (e.buttons & 1) {
        moveTargetRef.current = { ...pos };
      }
    };

    const onDown = (e) => {
      const pos = canvasCoords(e);
      mouseRef.current = pos;

      if (e.button === 0) {
        // Left click → set move target
        moveTargetRef.current = { ...pos };
      } else if (e.button === 2) {
        // Right click → start firing
        rightDownRef.current = true;
      } else if (e.button === 1) {
        // Middle click → dash
        wantDashRef.current = true;
      }
    };

    const onUp = (e) => {
      if (e.button === 0) {
        // Keep move target (player walks there then stops)
      } else if (e.button === 2) {
        rightDownRef.current = false;
      }
    };

    const onDblClick = (e) => {
      // Double-click → dash toward position
      wantDashRef.current = true;
      moveTargetRef.current = canvasCoords(e);
    };

    // Touch support
    const onTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = canvasCoords(touch);
      mouseRef.current = pos;

      if (e.touches.length === 1) {
        moveTargetRef.current = { ...pos };
      } else if (e.touches.length === 2) {
        // Two-finger tap → fire
        rightDownRef.current = true;
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = canvasCoords(touch);
      mouseRef.current = pos;
      moveTargetRef.current = { ...pos };
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        rightDownRef.current = false;
      }
    };

    cv.addEventListener('contextmenu', ctxMenu);
    cv.addEventListener('mousemove', onMove);
    cv.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    cv.addEventListener('dblclick', onDblClick);
    cv.addEventListener('touchstart', onTouchStart, { passive: false });
    cv.addEventListener('touchmove', onTouchMove, { passive: false });
    cv.addEventListener('touchend', onTouchEnd);

    return () => {
      cv.removeEventListener('contextmenu', ctxMenu);
      cv.removeEventListener('mousemove', onMove);
      cv.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cv.removeEventListener('dblclick', onDblClick);
      cv.removeEventListener('touchstart', onTouchStart);
      cv.removeEventListener('touchmove', onTouchMove);
      cv.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  /* ── Game loop ─────────────────────────────────────────── */
  useEffect(() => {
    const loop = (timestamp) => {
      rafRef.current = requestAnimationFrame(loop);
      if (pausedRef.current) { lastRef.current = timestamp; return; }
      if (lastRef.current === 0) { lastRef.current = timestamp; return; }

      const dt = Math.min((timestamp - lastRef.current) / 1000, 0.05);
      lastRef.current = timestamp;
      const s = stateRef.current;
      if (!s || s.dead) return;

      const M = mouseRef.current;
      const p = s.player;

      // ══ 1. MOVEMENT (click-to-move) ═══════════════════
      const target = moveTargetRef.current;
      let mx = 0, my = 0;
      let isMoving = false;

      if (target) {
        const d = dist(p, target);
        if (d > ARRIVE_THRESHOLD) {
          mx = (target.x - p.x) / d;
          my = (target.y - p.y) / d;
          isMoving = true;
        } else {
          // Arrived at target
          moveTargetRef.current = null;
        }
      }

      // Dash (double-click or middle-click)
      if (wantDashRef.current && p.dashCd <= 0 && p.stamina >= DASH_STAMINA_COST && isMoving) {
        p.dashing = true;
        p.dashTimer = DASH_DURATION;
        p.dashCd = DASH_COOLDOWN;
        p.dashAngle = Math.atan2(my, mx);
        p.stamina -= DASH_STAMINA_COST;
        p.invuln = DASH_DURATION;
      }
      wantDashRef.current = false;

      let speed = PLAYER_SPEED;
      if (p.dashing) {
        speed = DASH_SPEED;
        mx = Math.cos(p.dashAngle);
        my = Math.sin(p.dashAngle);
        p.dashTimer -= dt;
        if (p.dashTimer <= 0) p.dashing = false;
      }

      if (isMoving || p.dashing) {
        const nx = p.x + mx * speed * dt;
        const ny = p.y + my * speed * dt;
        if (!collidesAny(nx, p.y, PLAYER_SIZE * 0.6)) p.x = clamp(nx, PLAYER_SIZE, ARENA_W - PLAYER_SIZE);
        if (!collidesAny(p.x, ny, PLAYER_SIZE * 0.6)) p.y = clamp(ny, PLAYER_SIZE, ARENA_H - PLAYER_SIZE);
      }

      // Always face mouse cursor
      p.angle = Math.atan2(M.y - p.y, M.x - p.x);

      // Timers
      if (p.fireCd > 0) p.fireCd -= dt;
      if (p.muzzleFlash > 0) p.muzzleFlash -= dt;
      if (p.dashCd > 0) p.dashCd -= dt;
      if (p.invuln > 0) p.invuln -= dt;
      if (p.hitFlash > 0) p.hitFlash -= dt;
      p.stamina = Math.min(p.maxStamina, p.stamina + STAMINA_REGEN_RATE * dt);

      if (p.dashing || isMoving) {
        p.trail.push({ x: p.x, y: p.y, life: 0.2 });
      }
      p.trail = p.trail.filter(t => { t.life -= dt; return t.life > 0; });

      // ══ 2. SHOOTING (right-click held) ════════════════
      if (rightDownRef.current && p.fireCd <= 0 && !p.dashing) {
        p.fireCd = FIRE_RATE;
        p.muzzleFlash = MUZZLE_FLASH_DURATION;
        const tipX = p.x + Math.cos(p.angle) * GUN_LENGTH;
        const tipY = p.y + Math.sin(p.angle) * GUN_LENGTH;
        const spread = (Math.random() - 0.5) * 0.06;
        const ba = p.angle + spread;
        s.bullets.push({
          x: tipX, y: tipY,
          vx: Math.cos(ba) * BULLET_SPEED, vy: Math.sin(ba) * BULLET_SPEED,
          life: BULLET_LIFETIME, damage: BULLET_DAMAGE, color: '#06b6d4',
        });
        s.screenShake = 0.03;
        s.shakeIntensity = 1.5;
      }

      // ══ 3. BULLETS ════════════════════════════════════
      const now = performance.now();
      for (const b of s.bullets) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        if (b.x < -10 || b.x > ARENA_W + 10 || b.y < -10 || b.y > ARENA_H + 10) { b.life = 0; continue; }
        if (collidesAny(b.x, b.y, BULLET_SIZE)) { b.life = 0; s.particles.push(...spawnParticles(b.x, b.y, '#06b6d4', 3)); continue; }
        for (const e of s.enemies) {
          if (!e.alive) continue;
          if (dist(b, e) < BULLET_SIZE + e.size) {
            b.life = 0; e.hp -= b.damage; e.hitFlash = 0.1;
            s.particles.push(...spawnParticles(e.x, e.y, e.color, 4));
            s.screenShake = SCREEN_SHAKE_HIT; s.shakeIntensity = SHAKE_INTENSITY_HIT;
            if (e.hp <= 0) {
              e.alive = false; s.kills++;
              s.score += KILL_SCORE_BASE + s.combo.count * KILL_SCORE_PER_COMBO;
              s.combo.count++; s.combo.lastHit = now;
              s.combo.maxCombo = Math.max(s.combo.maxCombo, s.combo.count);
              s.particles.push(...spawnParticles(e.x, e.y, e.color, 10));
              s.screenShake = SCREEN_SHAKE_KILL; s.shakeIntensity = SHAKE_INTENSITY_KILL;
            }
            break;
          }
        }
      }
      s.bullets = s.bullets.filter(b => b.life > 0);

      // ══ 4. ENEMIES ════════════════════════════════════
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        s.spawnTimer = Math.max(0.5, s.nextSpawnInterval - s.wave * 0.08);
        if (s.enemies.filter(e => e.alive).length < MAX_ENEMIES_BASE + s.wave * MAX_ENEMIES_PER_WAVE)
          s.enemies.push(spawnEnemy(s.wave));
      }
      for (const e of s.enemies) {
        if (!e.alive) continue;
        if (e.hitFlash > 0) e.hitFlash -= dt;
        const a = Math.atan2(p.y - e.y, p.x - e.x);
        e.angle = a;
        const enx = e.x + Math.cos(a) * e.speed * dt;
        const eny = e.y + Math.sin(a) * e.speed * dt;
        if (!collidesAny(enx, e.y, e.size * 0.5)) e.x = enx;
        if (!collidesAny(e.x, eny, e.size * 0.5)) e.y = eny;
        if (dist(e, p) < e.size + PLAYER_SIZE * 0.6 && p.invuln <= 0) {
          p.hp -= e.type === 'tank' ? ENEMY_DAMAGE_TANK : e.type === 'fast' ? ENEMY_DAMAGE_FAST : ENEMY_DAMAGE_NORMAL;
          p.invuln = PLAYER_INVULN_TIME; p.hitFlash = 0.15;
          s.screenShake = SCREEN_SHAKE_DAMAGE; s.shakeIntensity = SHAKE_INTENSITY_DAMAGE;
          s.particles.push(...spawnParticles(p.x, p.y, '#ef4444', 8));
        }
      }
      s.enemies = s.enemies.filter(e => e.alive);

      // ══ 4b. ENEMY SHOOTING ═════════════════════════════
      for (const e of s.enemies) {
        if (!e.alive) continue;
        e.fireCd -= dt;
        const dToPlayer = dist(e, p);
        // Only shoot when in range and not too close (melee range)
        if (e.fireCd <= 0 && dToPlayer < ENEMY_SHOOT_RANGE && dToPlayer > ENEMY_SHOOT_MIN_RANGE) {
          e.fireCd = e.fireRate;
          const aimAngle = Math.atan2(p.y - e.y, p.x - e.x);
          const spread = (Math.random() - 0.5) * ENEMY_BULLET_SPREAD;
          const ba = aimAngle + spread;
          // Determine bullet color based on enemy type
          const bulletColor = e.type === 'tank' ? '#f59e0b' : e.type === 'fast' ? '#ef4444' : '#c084fc';
          s.enemyBullets.push({
            x: e.x + Math.cos(aimAngle) * (e.size + 4),
            y: e.y + Math.sin(aimAngle) * (e.size + 4),
            vx: Math.cos(ba) * ENEMY_BULLET_SPEED,
            vy: Math.sin(ba) * ENEMY_BULLET_SPEED,
            life: ENEMY_BULLET_LIFETIME,
            damage: ENEMY_BULLET_DAMAGE,
            color: bulletColor,
          });
        }
      }

      // ══ 4c. ENEMY BULLETS ══════════════════════════════
      for (const eb of s.enemyBullets) {
        eb.x += eb.vx * dt;
        eb.y += eb.vy * dt;
        eb.life -= dt;
        // Out of bounds
        if (eb.x < -10 || eb.x > ARENA_W + 10 || eb.y < -10 || eb.y > ARENA_H + 10) {
          eb.life = 0; continue;
        }
        // Hit obstacle
        if (collidesAny(eb.x, eb.y, ENEMY_BULLET_SIZE)) {
          eb.life = 0;
          s.particles.push(...spawnParticles(eb.x, eb.y, eb.color, 3));
          continue;
        }
        // Hit player
        if (dist(eb, p) < ENEMY_BULLET_SIZE + PLAYER_SIZE * 0.6 && p.invuln <= 0 && !p.dashing) {
          eb.life = 0;
          p.hp -= eb.damage;
          p.invuln = PLAYER_INVULN_TIME;
          p.hitFlash = 0.15;
          s.screenShake = SCREEN_SHAKE_DAMAGE;
          s.shakeIntensity = SHAKE_INTENSITY_DAMAGE;
          s.particles.push(...spawnParticles(p.x, p.y, '#ef4444', 8));
        }
      }
      s.enemyBullets = s.enemyBullets.filter(eb => eb.life > 0);

      // ══ 5-7. COMBO, PARTICLES, WAVES ══════════════════
      if (s.combo.count > 0 && now - s.combo.lastHit > COMBO_TIMEOUT) { s.combo.count = 0; s.combo.lastHit = 0; }
      for (const pt of s.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vx *= 0.94; pt.vy *= 0.94; pt.life -= dt; }
      s.particles = s.particles.filter(pt => pt.life > 0);
      if (s.screenShake > 0) s.screenShake -= dt;
      s.score += PASSIVE_SCORE_RATE * dt; s.time += dt;
      const nw = Math.floor(s.time / WAVE_INTERVAL) + 1;
      if (nw > s.wave) { s.wave = nw; for (let i = 0; i < WAVE_BURST_BASE + s.wave; i++) s.enemies.push(spawnEnemy(s.wave)); }

      // ══ 8. DEATH ══════════════════════════════════════
      if (p.hp <= 0) {
        p.hp = 0; s.dead = true;
        onDeathRef.current({ score: s.score, kills: s.kills, wavesReached: s.wave, timeElapsed: s.time, maxCombo: s.combo.maxCombo });
        return;
      }

      // ══ 9. HUD ════════════════════════════════════════
      onUpdateRef.current({
        hp: { current: p.hp, max: p.maxHp }, stamina: { current: p.stamina, max: p.maxStamina },
        score: s.score, wave: s.wave, timeElapsed: s.time,
        combo: { count: s.combo.count, lastHitTime: s.combo.lastHit }, isHit: p.hitFlash > 0,
        skills: [
          { id: 'dash', state: p.dashCd > 0 ? 'cooldown' : 'ready', cooldownTotal: DASH_COOLDOWN * 1000, cooldownRemaining: Math.max(0, p.dashCd * 1000), keybind: '2×' },
          { id: 'charged', state: 'ready', cooldownTotal: 5000, cooldownRemaining: 0, keybind: 'E' },
          { id: 'finisher', state: 'ready', cooldownTotal: 8000, cooldownRemaining: 0, keybind: 'R' },
        ],
      });

      // ═══════════════════════════════════════════════════
      // RENDER
      // ═══════════════════════════════════════════════════
      const cv = canvasRef.current; if (!cv) return;
      const ctx = cv.getContext('2d');
      const shX = s.screenShake > 0 ? (Math.random() - 0.5) * s.shakeIntensity * 2 : 0;
      const shY = s.screenShake > 0 ? (Math.random() - 0.5) * s.shakeIntensity * 2 : 0;
      ctx.save(); ctx.translate(shX, shY);

      // Background + Grid
      ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, ARENA_W, ARENA_H);
      ctx.strokeStyle = 'rgba(168,85,247,0.06)'; ctx.lineWidth = 1;
      for (let gx = 0; gx < ARENA_W; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ARENA_H); ctx.stroke(); }
      for (let gy = 0; gy < ARENA_H; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(ARENA_W, gy); ctx.stroke(); }
      const bGrad = ctx.createLinearGradient(0, 0, ARENA_W, 0);
      bGrad.addColorStop(0, 'rgba(168,85,247,0.15)'); bGrad.addColorStop(0.5, 'rgba(6,182,212,0.1)'); bGrad.addColorStop(1, 'rgba(168,85,247,0.15)');
      ctx.strokeStyle = bGrad; ctx.lineWidth = 2; ctx.strokeRect(8, 8, ARENA_W - 16, ARENA_H - 16);

      // Obstacles
      for (const o of OBSTACLES) {
        ctx.fillStyle = 'rgba(15,23,42,0.9)'; ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = 'rgba(168,85,247,0.2)'; ctx.lineWidth = 1; ctx.strokeRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = 'rgba(168,85,247,0.4)'; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.w, o.y); ctx.stroke();
      }
      for (const pl of PILLARS) {
        ctx.fillStyle = 'rgba(15,23,42,0.9)'; ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(6,182,212,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowColor = 'rgba(6,182,212,0.15)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r + 1, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
      }

      // Move target indicator
      if (target && !p.dashing) {
        const td = dist(p, target);
        if (td > ARRIVE_THRESHOLD) {
          ctx.strokeStyle = 'rgba(168,85,247,0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.arc(target.x, target.y, 8, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          // Small crosshair
          ctx.strokeStyle = 'rgba(168,85,247,0.2)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(target.x - 4, target.y); ctx.lineTo(target.x + 4, target.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(target.x, target.y - 4); ctx.lineTo(target.x, target.y + 4); ctx.stroke();
        }
      }

      // Player trail
      for (const t of p.trail) { const ta = t.life / 0.2; ctx.globalAlpha = ta * 0.25; ctx.fillStyle = p.dashing ? '#06b6d4' : '#a855f7'; ctx.beginPath(); ctx.arc(t.x, t.y, PLAYER_SIZE * 0.4 * ta, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;

      // Bullets
      for (const b of s.bullets) {
        const bAng = Math.atan2(b.vy, b.vx);
        const tX = b.x - Math.cos(bAng) * BULLET_TRAIL_LENGTH, tY = b.y - Math.sin(bAng) * BULLET_TRAIL_LENGTH;
        const trG = ctx.createLinearGradient(tX, tY, b.x, b.y); trG.addColorStop(0, 'rgba(6,182,212,0)'); trG.addColorStop(1, 'rgba(6,182,212,0.8)');
        ctx.strokeStyle = trG; ctx.lineWidth = BULLET_SIZE * 1.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tX, tY); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(6,182,212,0.8)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(b.x, b.y, BULLET_SIZE, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }

      // Enemy Bullets
      for (const eb of s.enemyBullets) {
        const ebAng = Math.atan2(eb.vy, eb.vx);
        const etX = eb.x - Math.cos(ebAng) * 10, etY = eb.y - Math.sin(ebAng) * 10;
        const etrG = ctx.createLinearGradient(etX, etY, eb.x, eb.y);
        etrG.addColorStop(0, 'rgba(239,68,68,0)'); etrG.addColorStop(1, eb.color);
        ctx.strokeStyle = etrG; ctx.lineWidth = ENEMY_BULLET_SIZE * 1.0; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(etX, etY); ctx.lineTo(eb.x, eb.y); ctx.stroke();
        // Glow core
        ctx.fillStyle = '#fff'; ctx.shadowColor = eb.color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(eb.x, eb.y, ENEMY_BULLET_SIZE, 0, Math.PI * 2); ctx.fill();
        // Outer glow ring
        ctx.fillStyle = eb.color; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(eb.x, eb.y, ENEMY_BULLET_SIZE * 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }

      // Enemies
      for (const e of s.enemies) {
        if (!e.alive) continue;
        ctx.save(); ctx.translate(e.x, e.y);
        ctx.shadowColor = e.color; ctx.shadowBlur = e.hitFlash > 0 ? 20 : 8;
        ctx.fillStyle = e.hitFlash > 0 ? '#fff' : e.color;
        if (e.type === 'tank') { ctx.beginPath(); ctx.moveTo(0, -e.size); ctx.lineTo(e.size, 0); ctx.lineTo(0, e.size); ctx.lineTo(-e.size, 0); ctx.closePath(); ctx.fill(); }
        else if (e.type === 'fast') { ctx.rotate(e.angle); ctx.beginPath(); ctx.moveTo(e.size, 0); ctx.lineTo(-e.size * 0.7, -e.size * 0.6); ctx.lineTo(-e.size * 0.7, e.size * 0.6); ctx.closePath(); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(0, 0, e.size, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(Math.cos(e.angle) * 4, Math.sin(e.angle) * 4, 3, 0, Math.PI * 2); ctx.fill(); }
        ctx.shadowBlur = 0;
        if (e.type === 'tank' && e.hp < e.maxHp) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-12, -e.size - 8, 24, 3); ctx.fillStyle = e.color; ctx.fillRect(-12, -e.size - 8, 24 * (e.hp / e.maxHp), 3); }
        ctx.restore();
      }

      // Player
      ctx.save(); ctx.translate(p.x, p.y);
      if (p.invuln > 0 && Math.floor(p.invuln * 20) % 2 === 0) ctx.globalAlpha = 0.4;
      ctx.shadowColor = p.dashing ? 'rgba(6,182,212,0.8)' : 'rgba(6,182,212,0.4)'; ctx.shadowBlur = p.dashing ? 25 : 12;
      ctx.fillStyle = p.hitFlash > 0 ? '#ef4444' : '#06b6d4'; ctx.beginPath(); ctx.arc(0, 0, PLAYER_SIZE, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(0, 0, PLAYER_SIZE * 0.65, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = p.dashing ? '#67e8f9' : '#22d3ee'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Gun barrel
      ctx.rotate(p.angle);
      ctx.fillStyle = '#334155'; ctx.fillRect(PLAYER_SIZE * 0.3, -2.5, GUN_LENGTH - PLAYER_SIZE * 0.3, 5);
      ctx.fillStyle = '#64748b'; ctx.fillRect(GUN_LENGTH - 4, -2.5, 4, 5);
      ctx.strokeStyle = 'rgba(6,182,212,0.3)'; ctx.lineWidth = 0.5; ctx.strokeRect(PLAYER_SIZE * 0.3, -2.5, GUN_LENGTH - PLAYER_SIZE * 0.3, 5);

      // Muzzle flash
      if (p.muzzleFlash > 0) {
        const fa = p.muzzleFlash / MUZZLE_FLASH_DURATION;
        ctx.shadowColor = 'rgba(6,182,212,0.9)'; ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(255,255,255,${fa * 0.9})`; ctx.beginPath(); ctx.arc(GUN_LENGTH + 3, 0, 5 * fa, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(6,182,212,${fa * 0.6})`; ctx.beginPath(); ctx.arc(GUN_LENGTH + 3, 0, 8 * fa, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1; ctx.restore();

      // Particles
      for (const pt of s.particles) { const pa = pt.life / pt.maxLife; ctx.globalAlpha = pa; ctx.fillStyle = pt.color; ctx.shadowColor = pt.color; ctx.shadowBlur = 4; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * pa, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // Aim line (from player to mouse when right-clicking)
      if (rightDownRef.current) {
        ctx.strokeStyle = 'rgba(6,182,212,0.15)'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(M.x, M.y); ctx.stroke();
        ctx.setLineDash([]);
        // Aim crosshair at mouse
        ctx.strokeStyle = 'rgba(239,68,68,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(M.x, M.y, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(M.x - 6, M.y); ctx.lineTo(M.x + 6, M.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(M.x, M.y - 6); ctx.lineTo(M.x, M.y + 6); ctx.stroke();
      }

      // Low HP vignette
      if (p.hp < 25) {
        const vA = (1 - p.hp / 25) * 0.4;
        const vG = ctx.createRadialGradient(ARENA_W / 2, ARENA_H / 2, ARENA_W * 0.3, ARENA_W / 2, ARENA_H / 2, ARENA_W * 0.7);
        vG.addColorStop(0, 'transparent'); vG.addColorStop(1, `rgba(239,68,68,${vA})`);
        ctx.fillStyle = vG; ctx.fillRect(0, 0, ARENA_W, ARENA_H);
      }

      // Scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.03)'; for (let sy = 0; sy < ARENA_H; sy += 4) ctx.fillRect(0, sy, ARENA_W, 2);
      ctx.restore();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={ARENA_W}
      height={ARENA_H}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        display: 'block', cursor: 'crosshair',
      }}
    />
  );
}
