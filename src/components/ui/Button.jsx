import React, { useState } from 'react';
import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  onClick,
  fullWidth = false,
  className = '',
  children,
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const cls = [
    styles.btn,
    styles[variant],
    styles[`size_${size}`],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
    hovered && !disabled ? styles.hovered : '',
    pressed && !disabled ? styles.pressed : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <span className={styles.topLine} />
      {loading ? (
        <span className={styles.spinner} />
      ) : (
        <>
          {iconLeft && <span className={styles.iconSlot}>{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className={styles.iconSlot}>{iconRight}</span>}
        </>
      )}
      {variant === 'primary' && <span className={styles.shimmer} />}
    </button>
  );
}
