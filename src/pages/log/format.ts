import dayjs from 'dayjs';

// 数字字符串是毫秒时间戳，不能交给 dayjs 按年月日字符串解析。
export function formatLogTime(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return '—';
  const input =
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  const date = dayjs(input);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '—';
}
