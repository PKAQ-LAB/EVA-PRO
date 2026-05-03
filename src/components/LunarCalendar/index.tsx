import clsx from 'clsx';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useState } from 'react';
import './getLunarDate';
import styles from './index.module.css';

type LunarFn = (date: Date) => { month: string; day: string };

const getLunarDate: LunarFn | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as { getLunarDate?: LunarFn }).getLunarDate ??
      undefined)
    : undefined;

const formatYMD = (date: Dayjs) => date.format('YYYY-MM-DD');

const buildCalendarTable = (year: number, month: number): number[][] => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const monthLen = Number(
    dayjs(new Date(year, month, 1))
      .subtract(1, 'day')
      .format('D'),
  );

  const list: number[][] = [[]];
  for (let i = firstDay; i--; ) list[0].push(0);

  let row = 0;
  for (let i = 1; i <= monthLen; i++) {
    const cur = i + firstDay - 1;
    row = Math.floor(cur / 7);
    list[row] = list[row] || [];
    list[row].push(i);
  }
  const lastRow = list[row];
  for (let i = 7 - lastRow.length; i--; ) lastRow.push(0);
  return list;
};

interface CalendarBodyProps {
  current: string;
  date: string;
  onSelect: (next: string) => void;
}

const CalendarBody: React.FC<CalendarBodyProps> = ({
  current,
  date,
  onSelect,
}) => {
  const curDay = Number(dayjs(current).format('D'));
  const year = Number(dayjs(date).format('YYYY'));
  const month = Number(dayjs(date).format('M'));
  const table = buildCalendarTable(year, month);

  return (
    <div className={clsx(styles.s11, styles.column)}>
      {table.map((rowItems, rowIndex) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are stable per render
          key={rowIndex}
          className={clsx(styles.row, styles.s1)}
        >
          {rowItems.map((day, index) => {
            const isToday = day === curDay;
            const isWeekend = index === 0 || index === 6;
            let lunar: React.ReactNode = null;
            if (day && getLunarDate) {
              const result = getLunarDate(new Date(year, month - 1, day));
              lunar = (
                <span className={styles.lunar}>
                  {' '}
                  {result.month}月{result.day}{' '}
                </span>
              );
            }
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: column index is stable
                key={`${rowIndex}-${index}`}
                className={clsx(styles.day, styles.s1, styles.center, {
                  [styles.cur]: isToday,
                  [styles.weekend]: isWeekend,
                })}
                onClick={() => {
                  if (day)
                    onSelect(formatYMD(dayjs(new Date(year, month - 1, day))));
                }}
              >
                {day || ''}
                {lunar}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

interface CalendarHeaderProps {
  date: string;
  onNavChange: (next: string) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  date,
  onNavChange,
}) => {
  const handleLeft = () =>
    onNavChange(formatYMD(dayjs(date).subtract(1, 'month')));
  const handleRight = () => onNavChange(formatYMD(dayjs(date).add(1, 'month')));
  const currentMonth = dayjs(date).format('YYYY年M月');

  return (
    <div className={clsx(styles.header, styles.row, styles.s1)}>
      <div className={clsx(styles.center, styles.s1)} onClick={handleLeft}>
        {'<'}
      </div>
      <div className={clsx(styles.s5, styles.center)}>
        <span>{currentMonth}</span>
      </div>
      <div className={clsx(styles.center, styles.s1)} onClick={handleRight}>
        {'>'}
      </div>
    </div>
  );
};

const CalendarHead: React.FC = () => {
  const labels = ['日', '一', '二', '三', '四', '五', '六'];
  return (
    <div className={clsx(styles.row, styles.s1)}>
      {labels.map((text) => (
        <div
          key={text}
          className={clsx(styles.tableTh, styles.s1, styles.center, {
            [styles.weekend]: text === '日' || text === '六',
          })}
        >
          {text}
        </div>
      ))}
    </div>
  );
};

/** 农历日历组件，依赖 ./getLunarDate.js（基于 window 全局注入） */
const LunarCalendar: React.FC = () => {
  const today = formatYMD(dayjs());
  const [date, setDate] = useState(today);
  const [current, setCurrent] = useState(today);

  return (
    <div className={clsx(styles.reactCalendar, styles.column)}>
      <CalendarHeader date={date} onNavChange={setDate} />
      <div className={clsx(styles.column, styles.s9)}>
        <CalendarHead />
        <CalendarBody current={current} date={date} onSelect={setCurrent} />
      </div>
    </div>
  );
};

export default LunarCalendar;
