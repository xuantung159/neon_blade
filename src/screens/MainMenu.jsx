import React, { useEffect, useRef } from 'react';
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import styles from './MainMenu.module.css';

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = [
      'rgba(168,85,247,0.5)',
      'rgba(6,182,212,0.4)',
      'rgba(139,92,246,0.3)',
    ];

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.3,
    }));

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.particles} />;
}

export default function MainMenu({ onStart, onSettings, onQuit }) {
  return (
    <div className={styles.container}>
      {/* Grid background */}
      <div className={styles.grid} />

      {/* Particles */}
      <ParticleCanvas />

      {/* Scanlines */}
      <div className={styles.scanlines} />

      {/* Logo area */}
      <div className={`${styles.logoArea} ${styles.animFadeInUp}`}>
        <p className={styles.tagline}>SLICE THROUGH THE NEON DARK</p>
        <h1 className={styles.title}>NEON BLADE</h1>
      </div>

      {/* Menu panel */}
      <div className={`${styles.menuWrap} ${styles.animFadeInUp} ${styles.delay300}`}>
        <GlassPanel variant="default" corners topAccent padding="lg" style={{ width: 320 }}>
          <div className={styles.btnStack}>
            <div className={`${styles.animFadeInUp} ${styles.delay400}`}>
              <Button variant="primary" size="lg" fullWidth onClick={onStart}>
                START GAME
              </Button>
            </div>
            <div className={`${styles.animFadeInUp} ${styles.delay500}`}>
              <Button variant="secondary" size="md" fullWidth onClick={onSettings}>
                SETTINGS
              </Button>
            </div>
            <div className={`${styles.animFadeInUp} ${styles.delay600}`}>
              <Button variant="ghost" size="md" fullWidth onClick={onQuit}>
                QUIT
              </Button>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Version */}
      <span className={styles.version}>v0.1.0-alpha &nbsp;|&nbsp; NEON BLADE</span>
    </div>
  );
}
