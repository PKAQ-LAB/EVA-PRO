import React, { useEffect, useRef, useState } from 'react';

export interface CountDownProps {
  format?: (time: number) => React.ReactNode;
  target: Date | number | string;
  onEnd?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const fixedZero = (val: number) => (val < 10 ? `0${val}` : `${val}`);

const computeLastTime = (target: CountDownProps['target']): number => {
  let targetTime = 0;
  if (Object.prototype.toString.call(target) === '[object Date]') {
    targetTime = (target as Date).getTime();
  } else {
    targetTime = new Date(target as number | string).getTime();
  }
  const diff = targetTime - Date.now();
  return diff < 0 ? 0 : diff;
};

const defaultFormat = (time: number): React.ReactNode => {
  const hours = 60 * 60 * 1000;
  const minutes = 60 * 1000;
  const h = Math.floor(time / hours);
  const m = Math.floor((time - h * hours) / minutes);
  const s = Math.floor((time - h * hours - m * minutes) / 1000);
  return (
    <span>
      {fixedZero(h)}:{fixedZero(m)}:{fixedZero(s)}
    </span>
  );
};

const INTERVAL = 1000;

/** 倒计时组件，支持自定义格式 */
const CountDown: React.FC<CountDownProps> = ({
  target,
  format = defaultFormat,
  onEnd,
  ...rest
}) => {
  const [lastTime, setLastTime] = useState<number>(() =>
    computeLastTime(target),
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    setLastTime(computeLastTime(target));
  }, [target]);

  useEffect(() => {
    const tick = () => {
      timerRef.current = setTimeout(() => {
        setLastTime((prev) => {
          if (prev < INTERVAL) {
            onEndRef.current?.();
            return 0;
          }
          tick();
          return prev - INTERVAL;
        });
      }, INTERVAL);
    };
    tick();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return <span {...rest}>{format(lastTime)}</span>;
};

export default CountDown;
