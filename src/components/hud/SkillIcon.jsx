import React from 'react';
import styles from './SkillIcon.module.css';

const SKILL_PATHS = {
  dash:     'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
  charged:  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
  finisher: 'M12 2l2.09 6.26L20.18 9l-4.64 4.27L16.73 20 12 16.77 7.27 20l1.18-6.73L3.82 9l6.09-.74z',
};

const SIZES = { sm: 40, md: 56, lg: 72 };

export default function SkillIcon({
  skillId,
  state,
  cooldownTotal = 5000,
  cooldownRemaining = 0,
  keybind,
  size = 'md',
}) {
  const s = SIZES[size];
  const iconSize = s * 0.5;
  const r = s / 2 - 4;
  const circumference = 2 * Math.PI * r;
  const dashOffset = cooldownTotal > 0
    ? ((cooldownTotal - cooldownRemaining) / cooldownTotal) * circumference
    : 0;

  const isReady    = state === 'ready';
  const isCooldown = state === 'cooldown';
  const isDisabled = state === 'disabled';
  const remaining  = (cooldownRemaining / 1000).toFixed(1);

  const stateClass = styles[state] || '';

  return (
    <div
      className={`${styles.icon} ${stateClass}`}
      style={{ width: s, height: s }}
    >
      {/* SVG icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        className={styles.svg}
        style={{ opacity: isCooldown ? 0.35 : 1 }}
      >
        <path
          d={SKILL_PATHS[skillId]}
          fill={isReady ? 'var(--neon-cyan)' : 'var(--text-secondary)'}
        />
      </svg>

      {/* Cooldown sweep overlay */}
      {isCooldown && (
        <svg
          width={s}
          height={s}
          className={styles.sweep}
        >
          <circle
            cx={s / 2}
            cy={s / 2}
            r={r}
            fill="none"
            stroke="rgba(168,85,247,0.7)"
            strokeWidth={3}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
      )}

      {/* Cooldown time text */}
      {isCooldown && (
        <span className={styles.timerText}>{remaining}</span>
      )}

      {/* Keybind badge */}
      <span className={styles.keybind}>{keybind}</span>
    </div>
  );
}
