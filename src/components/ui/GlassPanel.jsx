import React from 'react';
import styles from './GlassPanel.module.css';

const variantMap = {
  default: 'varDefault',
  dark:    'varDark',
  purple:  'varPurple',
  danger:  'varDanger',
};

const paddingMap = {
  none: 'padNone',
  sm:   'padSm',
  md:   'padMd',
  lg:   'padLg',
};

export default function GlassPanel({
  variant = 'default',
  padding = 'md',
  glow = false,
  corners = false,
  scanlines = false,
  topAccent = false,
  className = '',
  style = {},
  children,
}) {
  const cls = [
    styles.panel,
    styles[variantMap[variant]],
    styles[paddingMap[padding]],
    glow ? styles.glow : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} style={style}>
      {topAccent && <div className={`${styles.topAccent} ${styles[`accent_${variant}`]}`} />}
      {corners && <Corners variant={variant} />}
      {scanlines && <div className={styles.scanlines} />}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

function Corners({ variant }) {
  const accentColors = {
    default: 'rgba(168,85,247,0.6)',
    dark:    'rgba(100,116,139,0.4)',
    purple:  'rgba(168,85,247,0.8)',
    danger:  'rgba(239,68,68,0.6)',
  };
  const c = accentColors[variant] || accentColors.default;
  const base = { position: 'absolute', width: 12, height: 12, pointerEvents: 'none', zIndex: 2 };

  return (
    <>
      <span style={{ ...base, top: 0, left: 0, borderTop: `1px solid ${c}`, borderLeft: `1px solid ${c}` }} />
      <span style={{ ...base, top: 0, right: 0, borderTop: `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
      <span style={{ ...base, bottom: 0, left: 0, borderBottom: `1px solid ${c}`, borderLeft: `1px solid ${c}` }} />
      <span style={{ ...base, bottom: 0, right: 0, borderBottom: `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
    </>
  );
}
