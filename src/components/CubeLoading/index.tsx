import type { CSSProperties } from 'react';
import React from 'react';
import styles from './index.module.css';

export default function CubeLoading({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={[styles.indicator, className].filter(Boolean).join(' ')}
      style={style}
    >
      <span className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cube) => (
          <span key={cube} className={styles.cube} />
        ))}
      </span>
    </span>
  );
}
