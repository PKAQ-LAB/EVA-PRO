import clsx from 'clsx';
// @ts-expect-error: masonry-layout has no bundled types
import Masonry from 'masonry-layout';
import React, { useEffect, useRef } from 'react';
import isEqual from 'react-fast-compare';
import styles from './index.module.css';

export interface WaterFallProps<T = unknown> {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  dataSource?: T[];
  columnWidth?: string | number;
  gutter?: number;
  horizontalOrder?: boolean;
  percentPosition?: boolean;
  fitWidth?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  onLayout?: (items: unknown, instance: unknown) => void;
  getInstance?: (instance: unknown) => void;
}

/**
 * 瀑布流组件，基于 masonry-layout，并通过 ResizeObserver 自适应宽度。
 */
function WaterFall<T>({
  prefixCls = 'antui-waterfall',
  className,
  style,
  itemStyle,
  dataSource = [],
  columnWidth,
  gutter,
  horizontalOrder,
  percentPosition,
  fitWidth,
  render,
  onLayout,
  getInstance,
}: WaterFallProps<T>) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const msnryRef = useRef<{
    layout: () => void;
    destroy: () => void;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    off: (event: string, handler: (...args: unknown[]) => void) => void;
  } | null>(null);
  const lastSizeRef = useRef<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    const msnry = new Masonry(nodeRef.current, {
      itemSelector: `.${prefixCls}-item`,
      columnWidth:
        typeof columnWidth === 'string' ? `.${prefixCls}-item` : columnWidth,
      gutter,
      horizontalOrder,
      percentPosition,
      fitWidth,
    });
    msnryRef.current = msnry as never;

    const handleLayoutComplete = (...args: unknown[]) => {
      onLayout?.(args[0], msnry);
    };
    msnry.on('layoutComplete', handleLayoutComplete);
    getInstance?.(msnry);

    const observer = new ResizeObserver((entries) => {
      const next = entries[0].contentRect;
      const size = { width: next.width, height: next.height };
      if (!isEqual(size, lastSizeRef.current)) {
        lastSizeRef.current = size;
        msnryRef.current?.layout();
      }
    });
    observer.observe(nodeRef.current);

    return () => {
      observer.disconnect();
      msnry.off('layoutComplete', handleLayoutComplete);
      msnry.destroy();
      msnryRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itemStyles: React.CSSProperties = {
    width: columnWidth,
    ...(gutter ? { marginBottom: gutter } : null),
  };

  return (
    <div
      ref={nodeRef}
      className={clsx(prefixCls, styles.waterfall, className)}
      style={style}
    >
      {dataSource.map((item, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: data has no stable id
          key={index}
          className={clsx(`${prefixCls}-item`, styles.waterfallItem)}
          style={{ ...itemStyles, ...itemStyle }}
        >
          {(render ?? ((it: T) => it as unknown as React.ReactNode))(
            item,
            index,
          )}
        </div>
      ))}
    </div>
  );
}

export default WaterFall;
