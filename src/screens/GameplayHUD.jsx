import React, { useState, useEffect } from 'react';
import GlassPanel from '../components/ui/GlassPanel';
import HudBars from '../components/hud/HudBars';
import SkillIcon from '../components/hud/SkillIcon';
import ComboCounter from '../components/hud/ComboCounter';
import { formatTime, formatScore } from '../utils/animationHelpers';
import styles from './GameplayHUD.module.css';

export default function GameplayHUD({ gameState, onPause }) {
  const { hp, stamina, score, wave, timeElapsed, skills, combo, isHit } = gameState;
  const [showHitFlash, setShowHitFlash] = useState(false);
  const isLowHp = hp.current / hp.max < 0.25;

  useEffect(() => {
    if (isHit) {
      setShowHitFlash(true);
      const t = setTimeout(() => setShowHitFlash(false), 150);
      return () => clearTimeout(t);
    }
  }, [isHit]);

  return (
    <div className={styles.hud}>
      {/* Hit flash */}
      {showHitFlash && <div className={styles.hitFlash} />}

      {/* Low HP vignette */}
      {isLowHp && <div className={styles.lowHpVignette} />}

      {/* Wave indicator — top center */}
      <div className={styles.waveIndicator}>
        WAVE {String(wave).padStart(2, '0')}
      </div>

      {/* Top-left — Vitals */}
      <div className={styles.topLeft}>
        <GlassPanel variant="default" corners padding="sm">
          <HudBars hp={hp} stamina={stamina} />
        </GlassPanel>
      </div>

      {/* Bottom-left — Skills */}
      <div className={styles.bottomLeft}>
        <GlassPanel variant="dark" padding="sm">
          <div className={styles.skillRow}>
            {skills.map((sk) => (
              <SkillIcon
                key={sk.id}
                skillId={sk.id}
                state={sk.state}
                cooldownTotal={sk.cooldownTotal}
                cooldownRemaining={sk.cooldownRemaining}
                keybind={sk.keybind}
              />
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Right-center — Combo */}
      <div className={styles.rightCenter}>
        <ComboCounter
          count={combo.count}
          lastHitTime={combo.lastHitTime}
        />
      </div>

      {/* Top-right — Score */}
      <div className={styles.topRight}>
        <GlassPanel variant="dark" padding="sm" corners={false}>
          <div className={styles.scoreBlock}>
            <span className={styles.scoreLabel}>SCORE</span>
            <span className={styles.scoreValue}>{formatScore(score)}</span>
            <span className={styles.timeValue}>{formatTime(timeElapsed)}</span>
          </div>
        </GlassPanel>
      </div>

      {/* Pause button — top-right corner */}
      <button className={styles.pauseBtn} onClick={onPause}>
        <span className={styles.pauseBar} />
        <span className={styles.pauseBar} />
      </button>
    </div>
  );
}
