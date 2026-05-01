/* ================================================================
   NEON BLADE — App
   State machine: menu → playing → paused → game-over
   Integrates GameCanvas with HUD overlay screens.
   ================================================================ */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './styles/design-tokens.css';
import './styles/typography.css';
import './styles/effects.css';
import './styles/animations.css';

import MainMenu    from './screens/MainMenu';
import GameplayHUD from './screens/GameplayHUD';
import PauseMenu   from './screens/PauseMenu';
import GameOver    from './screens/GameOver';
import GameCanvas  from './components/game/GameCanvas';

export default function App() {
  const [screen, setScreen]       = useState('menu'); // menu | playing | paused | game-over
  const [gameState, setGameState] = useState(null);
  const [finalStats, setFinalStats] = useState(null);
  const [highScore, setHighScore] = useState(0);
  const [gameKey, setGameKey]     = useState(0);      // increment to remount GameCanvas

  /* ── Handlers ───────────────────────────────────────────────── */

  const handleStart = useCallback(() => {
    setGameKey(k => k + 1);
    setGameState(null);
    setScreen('playing');
  }, []);

  const handlePause = useCallback(() => {
    setScreen('paused');
  }, []);

  const handleResume = useCallback(() => {
    setScreen('playing');
  }, []);

  const handleRestart = useCallback(() => {
    setGameKey(k => k + 1);
    setGameState(null);
    setScreen('playing');
  }, []);

  const handleQuitToMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  /** Called by GameCanvas every frame with current HUD data */
  const handleUpdate = useCallback((state) => {
    setGameState(state);
  }, []);

  /** Called by GameCanvas when player HP reaches 0 */
  const handleDeath = useCallback((stats) => {
    setFinalStats(stats);
    if (stats.score > highScore) {
      setHighScore(stats.score);
    }
    setScreen('game-over');
  }, [highScore]);

  /* ── ESC key for pause ──────────────────────────────────────── */

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && screen === 'playing') {
        handlePause();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, handlePause]);

  /* ── Build gameState for HUD (with safe defaults) ───────────── */

  const hudState = useMemo(() => {
    if (gameState) return gameState;
    // Default state before first frame
    return {
      hp:      { current: 100, max: 100 },
      stamina: { current: 100, max: 100 },
      score:   0,
      wave:    1,
      timeElapsed: 0,
      combo:   { count: 0, lastHitTime: 0 },
      isHit:   false,
      skills: [
        { id: 'dash',     state: 'ready', cooldownTotal: 3000, cooldownRemaining: 0, keybind: '⇧' },
        { id: 'charged',  state: 'ready', cooldownTotal: 5000, cooldownRemaining: 0, keybind: 'E' },
        { id: 'finisher', state: 'ready', cooldownTotal: 8000, cooldownRemaining: 0, keybind: 'R' },
      ],
    };
  }, [gameState]);

  /* ── Final stats for Game Over ──────────────────────────────── */

  const gameOverStats = useMemo(() => {
    if (finalStats) return finalStats;
    return {
      score: 0, kills: 0, wavesReached: 1,
      timeElapsed: 0, maxCombo: 0,
    };
  }, [finalStats]);

  /* ── Render ─────────────────────────────────────────────────── */

  const isPlaying = screen === 'playing' || screen === 'paused';

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-deep)',
        position: 'relative',
      }}
    >
      {/* ── Main Menu ────────────────────────────────────────── */}
      {screen === 'menu' && (
        <MainMenu
          onStart={handleStart}
          onSettings={() => {}}
          onQuit={() => {}}
        />
      )}

      {/* ── Gameplay: Canvas + HUD ───────────────────────────── */}
      {isPlaying && (
        <div style={{ position: 'fixed', inset: 0 }}>
          {/* Game Canvas (full viewport) */}
          <GameCanvas
            key={gameKey}
            paused={screen === 'paused'}
            onDeath={handleDeath}
            onUpdate={handleUpdate}
          />

          {/* HUD Overlay (on top of canvas) */}
          <GameplayHUD
            gameState={hudState}
            onPause={handlePause}
          />

          {/* Pause Menu (on top of everything) */}
          {screen === 'paused' && (
            <PauseMenu
              onResume={handleResume}
              onRestart={handleRestart}
              onQuitToMenu={handleQuitToMenu}
              gameState={hudState}
            />
          )}
        </div>
      )}

      {/* ── Game Over ────────────────────────────────────────── */}
      {screen === 'game-over' && (
        <GameOver
          finalStats={gameOverStats}
          isHighScore={gameOverStats.score > highScore * 0.99}
          onPlayAgain={handleRestart}
          onMainMenu={handleQuitToMenu}
        />
      )}
    </div>
  );
}
