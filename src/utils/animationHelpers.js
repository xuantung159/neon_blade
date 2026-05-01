/* ================================================================
   NEON BLADE — Animation Helpers
   Utility functions for triggering animations and formatting data
   ================================================================ */

/**
 * Triggers screen shake animation on an element
 * @param {HTMLElement} element - Target element
 * @param {'light'|'normal'|'heavy'} intensity - Shake intensity
 */
export function triggerScreenShake(element, intensity = 'normal') {
  if (!element) return;
  const durations = { light: 200, normal: 400, heavy: 600 };
  const cls = 'anim-screen-shake';

  element.classList.remove(cls);
  void element.offsetWidth; // force reflow
  element.style.animationDuration = `${durations[intensity] || 400}ms`;
  element.classList.add(cls);

  const onEnd = () => {
    element.classList.remove(cls);
    element.style.animationDuration = '';
    element.removeEventListener('animationend', onEnd);
  };
  element.addEventListener('animationend', onEnd);
}

/**
 * Triggers a hit flash on an overlay element
 * @param {HTMLElement} overlayElement
 */
export function triggerHitFlash(overlayElement) {
  if (!overlayElement) return;
  requestAnimationFrame(() => {
    overlayElement.style.opacity = '0.2';
    overlayElement.style.transition = 'opacity 150ms ease';
    requestAnimationFrame(() => {
      overlayElement.style.opacity = '0';
    });
  });
}

/**
 * Triggers combo-pop animation, returns promise on completion
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
export function triggerComboPop(element) {
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    const cls = 'anim-combo-pop';
    element.classList.remove(cls);
    void element.offsetWidth;
    element.classList.add(cls);

    const onEnd = () => {
      element.classList.remove(cls);
      element.removeEventListener('animationend', onEnd);
      resolve();
    };
    element.addEventListener('animationend', onEnd);
  });
}

/**
 * Formats seconds into MM:SS string
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (!seconds || seconds < 0) return '00:00';
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Formats score with thousands separators
 * @param {number} score
 * @returns {string}
 */
export function formatScore(score) {
  return Math.floor(score).toLocaleString();
}

/**
 * Returns multiplier string based on combo count
 * @param {number} combo
 * @returns {string}
 */
export function getComboMultiplier(combo) {
  if (combo >= 21) return 'x3.0';
  if (combo >= 16) return 'x2.5';
  if (combo >= 11) return 'x2.0';
  if (combo >= 6)  return 'x1.5';
  return 'x1.0';
}

/**
 * Creates a stagger delay CSS string for list animations
 * @param {number} index - Item index in list
 * @param {number} baseDelay - Delay between items in ms
 * @param {number} startDelay - Initial delay before first item
 * @returns {string}
 */
export function createStaggerDelay(index, baseDelay = 100, startDelay = 0) {
  return `animation-delay: ${startDelay + index * baseDelay}ms`;
}
