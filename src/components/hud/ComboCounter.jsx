import React, { useState, useEffect, useRef } from 'react';
import styles from './ComboCounter.module.css';

const TIER_CONFIG = {
  idle:   { color: '#06b6d4', label: 'COMBO',    minSize: 48 },
  active: { color: '#06b6d4', label: 'COMBO',    minSize: 48 },
  hot:    { color: '#a855f7', label: 'COMBO',    minSize: 64 },
  fever:  { color: '#f59e0b', label: 'FEVER!!',  minSize: 96 },
};

const MULTIPLIER_TABLE = [
  [21, 'x3.0'], [16, 'x2.5'], [11, 'x2.0'], [6, 'x1.5'], [1, 'x1.0'],
];

function getMultiplier(count) {
  for (const [threshold, label] of MULTIPLIER_TABLE) {
    if (count >= threshold) return label;
  }
  return 'x1.0';
}

function getTier(count) {
  if (count >= 16) return 'fever';
  if (count >= 6)  return 'hot';
  if (count >= 1)  return 'active';
  return 'idle';
}

export default function ComboCounter({
  count,
  lastHitTime,
  maxComboTime = 2500,
}) {
  const [visible, setVisible] = useState(false);
  const [pop, setPop] = useState(false);
  const [decayPct, setDecayPct] = useState(100);
  const prevCount = useRef(0);
  const rafRef = useRef(null);

  const tier = getTier(count);
  const config = TIER_CONFIG[tier];
  const fontSize = Math.min(120, config.minSize + (count > 5 ? count * 1.5 : 0));

  // Pop animation on count change
  useEffect(() => {
    if (count > 0 && count !== prevCount.current) {
      setVisible(true);
      setPop(true);
      const t = setTimeout(() => setPop(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    if (count === 0 && prevCount.current > 0) {
      const t = setTimeout(() => setVisible(false), 300);
      prevCount.current = 0;
      return () => clearTimeout(t);
    }
  }, [count]);

  // Decay bar
  useEffect(() => {
    if (count === 0 || !lastHitTime) return;
    const tick = () => {
      const elapsed = Date.now() - lastHitTime;
      const remaining = Math.max(0, maxComboTime - elapsed);
      setDecayPct((remaining / maxComboTime) * 100);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count, lastHitTime, maxComboTime]);

  if (!visible && count === 0) return null;

  return (
    <div
      className={`${styles.wrapper} ${pop ? styles.pop : ''} ${tier === 'fever' ? styles.fever : ''}`}
      style={{
        opacity: count === 0 ? 0 : 1,
        '--combo-color': config.color,
      }}
    >
      {/* Label */}
      <span className={styles.label}>{config.label}</span>

      {/* Count number */}
      <span className={styles.count} style={{ fontSize }}>
        {count}
      </span>

      {/* Multiplier */}
      <span className={styles.multiplier}>{getMultiplier(count)}</span>

      {/* Decay bar */}
      <div className={styles.decayTrack}>
        <div
          className={styles.decayFill}
          style={{ width: `${decayPct}%` }}
        />
      </div>
    </div>
  );
}
