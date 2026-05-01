import React, { useEffect, useRef } from 'react';
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import { formatTime, formatScore } from '../utils/animationHelpers';
import styles from './GameOver.module.css';

function RedParticleCanvas() {
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

    const colors = [
      'rgba(127,29,29,0.5)',
      'rgba(239,68,68,0.3)',
      'rgba(185,28,28,0.4)',
    ];

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * 0.3 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.4 + 0.2,
    }));

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > h) { p.y = 0; p.x = Math.random() * w; }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

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

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} className={styles.particles} />;
}

export default function GameOver({ finalStats, isHighScore, onPlayAgain, onMainMenu }) {
  const statItems = [
    { label: 'KILLS',     value: finalStats.kills },
    { label: 'WAVES',     value: finalStats.wavesReached },
    { label: 'TIME',      value: formatTime(finalStats.timeElapsed) },
    { label: 'MAX COMBO', value: `${finalStats.maxCombo}x` },
  ];

  return (
    <div className={styles.container}>
      <RedParticleCanvas />

      {/* Vignette */}
      <div className={styles.vignette} />

      {/* Content */}
      <div className={styles.content}>
        {/* GAME OVER label */}
        <p className={`${styles.gameOverLabel} ${styles.animFadeIn}`}>
          // GAME OVER //
        </p>

        {/* YOU DIED */}
        <h1 className={`${styles.youDied} ${styles.animDeathReveal}`}>
          YOU DIED
        </h1>

        {/* High score badge */}
        {isHighScore && (
          <div className={`${styles.highScoreBadge} ${styles.animBadge}`}>
            ✦ NEW HIGH SCORE ✦
          </div>
        )}

        {/* Score */}
        <div className={`${styles.scoreSection} ${styles.animFadeInUp} ${styles.delay800}`}>
          <p className={styles.scoreLabel}>FINAL SCORE</p>
          <p className={styles.scoreNumber}>{formatScore(finalStats.score)}</p>
        </div>

        {/* Stats */}
        <div className={`${styles.statsWrap} ${styles.animFadeInUp} ${styles.delay1100}`}>
          <GlassPanel variant="dark" padding="md">
            <div className={styles.statsGrid}>
              {statItems.map((s) => (
                <div key={s.label} className={styles.statCell}>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={styles.statValue}>{s.value}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Buttons */}
        <div className={`${styles.btnStack} ${styles.animFadeInUp} ${styles.delay1400}`}>
          <Button variant="primary" size="lg" fullWidth onClick={onPlayAgain}>
            PLAY AGAIN
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onMainMenu}>
            MAIN MENU
          </Button>
        </div>
      </div>
    </div>
  );
}
