import { describe, expect, it } from 'vitest';
import { formatLogTime } from './format';

describe('日志日期显示', () => {
  it('毫秒数字和字符串与本地日期显示一致，不解析成十八世纪', () => {
    const timestamp = new Date(2026, 10, 13, 12, 30, 42).getTime();
    expect(formatLogTime(timestamp)).toBe('2026-11-13 12:30:42');
    expect(formatLogTime(String(timestamp))).toBe('2026-11-13 12:30:42');
  });
  it('ISO 时间统一去除 T 和小数秒', () => {
    expect(formatLogTime('2026-11-13T14:19:36.949289')).toBe(
      '2026-11-13 14:19:36',
    );
  });
  it('缺失和无效日期不伪造时间', () => {
    for (const value of [null, undefined, '', 'invalid', Number.NaN]) {
      expect(formatLogTime(value)).toBe('—');
    }
  });
});
