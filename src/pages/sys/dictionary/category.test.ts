import { expect, it } from 'vitest';
import type { DictItem } from './data.d';
import {
  completeContract,
  dictIdentity,
  dictionaryRows,
  isReadonlyDict,
} from './readonly';

const system: DictItem = {
  id: '7',
  category: 'SYSTEM',
  readOnly: true,
  frozen: 0,
  name: '系统',
  code: 'SYS',
};
const business: DictItem = {
  id: '7',
  category: 'BUSINESS',
  readOnly: false,
  frozen: 1,
  name: '业务',
  code: 'BIZ',
};
it('两虚根复制生成、全树身份不碰撞；重复转换/展开不改变原响应', () => {
  const input = Object.freeze([Object.freeze(system), Object.freeze(business)]);
  const snapshot = JSON.stringify(input);
  const first = dictionaryRows([...input], true);
  expect(first.map((row) => row.id)).toEqual([
    'category:SYSTEM',
    'category:BUSINESS',
  ]);
  expect(first[0].children?.[0]).not.toBe(input[0]);
  expect(dictIdentity(system)).not.toBe(dictIdentity(business));
  expect(dictionaryRows([...input], true)).toEqual(first);
  expect(JSON.stringify(input)).toBe(snapshot);
  expect(
    dictionaryRows([...input], true, '不存在').map((row) => row.children),
  ).toEqual([[], []]);
});
it.each([undefined, null, 'true', 0])(
  '缺少严格能力%s保持原平表，不猜缺失分类',
  (capability) => {
    const legacy = { id: 'unknown', name: '旧行', frozen: 0 };
    expect(completeContract([system, legacy], capability)).toBe(false);
    const rows = dictionaryRows([system, legacy], false);
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => !row.virtual)).toBe(true);
    expect(isReadonlyDict(legacy)).toBe(true);
  },
);
it('空数组真能力可成两根，重复身份拒完整；系统frozen0和9999均拒写，业务1仍可维护', () => {
  expect(completeContract([], true)).toBe(true);
  expect(completeContract([system, business], false)).toBe(true);
  expect(completeContract([business, { ...business }], true)).toBe(false);
  expect(isReadonlyDict(system)).toBe(true);
  expect(isReadonlyDict(business)).toBe(false);
  expect(isReadonlyDict({ ...business, frozen: 9999 })).toBe(true);
  expect(isReadonlyDict({ ...business, readOnly: undefined })).toBe(true);
});
