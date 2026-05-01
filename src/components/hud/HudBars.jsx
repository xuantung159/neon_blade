import React from 'react';
import styles from './HudBars.module.css';

export function HpBar({ current, max }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = pct < 20;

  let colorClass = styles.hpGreen;
  if (pct <= 25) colorClass = styles.hpRed;
  else if (pct <= 50) colorClass = styles.hpAmber;

  return (
    <div className={styles.barGroup}>
      <div className={styles.barHeader}>
        <span className={styles.barLabel}>♥ HP</span>
        <span className={styles.barValue}>{Math.floor(current)}/{max}</span>
      </div>
      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${styles.hpFill} ${colorClass} ${isLow ? styles.flash : ''}`}
          style={{ width: `${pct}%` }}
        />
        <SegmentLines />
      </div>
    </div>
  );
}

export function StaminaBar({ current, max }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className={styles.barGroup}>
      <div className={styles.barHeader}>
        <span className={styles.barLabelSm}>⚡ STAMINA</span>
        <span className={styles.barValueSm}>{Math.floor(current)}/{max}</span>
      </div>
      <div className={`${styles.barTrack} ${styles.barTrackSm}`}>
        <div
          className={`${styles.barFill} ${styles.staminaFill}`}
          style={{ width: `${pct}%` }}
        />
        <SegmentLines />
      </div>
    </div>
  );
}

function SegmentLines() {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          className={styles.segment}
          style={{ left: `${(i + 1) * 10}%` }}
        />
      ))}
    </>
  );
}

export default function HudBars({ hp, stamina }) {
  return (
    <div className={styles.wrapper}>
      <HpBar current={hp.current} max={hp.max} />
      <StaminaBar current={stamina.current} max={stamina.max} />
    </div>
  );
}
