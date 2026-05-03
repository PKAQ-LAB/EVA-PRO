import React, { useEffect, useRef } from 'react';
import PatternLock from './PatternLock';
import './index.module.css';

export interface LockProps {
  /** 期望被解锁的 pattern 字符串 */
  lock?: string;
  /** 用户匹配 / 失败回调 */
  onChange?: (matched: boolean) => void;
}

/**
 * 手势密码锁，封装 vendor PatternLock.js（MIT, Sudhanshu Yadav / Nimiq Foundation）
 */
const Lock: React.FC<LockProps> = ({ lock, onChange }) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<InstanceType<typeof PatternLock> | null>(null);

  useEffect(() => {
    if (!holderRef.current) return;
    const inst = new PatternLock(holderRef.current, { enableSetPattern: true });
    instanceRef.current = inst;
    if (lock) {
      inst.checkForPattern(
        lock,
        () => onChange?.(true),
        () => onChange?.(false),
      );
    }
    return () => {
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instanceRef.current && lock) instanceRef.current.setPattern(lock);
  }, [lock]);

  return <div ref={holderRef} />;
};

export default Lock;
