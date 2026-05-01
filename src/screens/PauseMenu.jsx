import React, { useEffect } from 'react';
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import { formatTime, formatScore } from '../utils/animationHelpers';
import styles from './PauseMenu.module.css';

export default function PauseMenu({ onResume, onRestart, onQuitToMenu, gameState }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onResume();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onResume]);

  const stats = [
    { label: 'SCORE', value: formatScore(gameState.score) },
    { label: 'WAVE',  value: String(gameState.wave).padStart(2, '0') },
    { label: 'TIME',  value: formatTime(gameState.timeElapsed) },
  ];

  return (
    <div className={styles.backdrop}>
      <div className={styles.panelWrap}>
        <GlassPanel variant="purple" corners topAccent padding="lg" style={{ width: 360 }}>
          <h2 className={styles.title}>// PAUSED //</h2>

          <div className={styles.divider} />

          {/* Stats row */}
          <div className={styles.statsRow}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statBlock}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={styles.statValue}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          {/* Buttons */}
          <div className={styles.btnStack}>
            <Button variant="primary"   size="lg" fullWidth onClick={onResume}>RESUME</Button>
            <Button variant="secondary" size="md" fullWidth onClick={onRestart}>RESTART</Button>
            <Button variant="ghost"     size="md" fullWidth onClick={onQuitToMenu}>QUIT GAME</Button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
