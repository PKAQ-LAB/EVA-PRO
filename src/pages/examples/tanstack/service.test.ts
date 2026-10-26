import { beforeEach, expect, it, vi } from 'vitest';
import { deleteRecord, listRecords, saveRecord, storageKey } from './service';

const draft = {
  name: '测试记录',
  code: 'TEST_1',
  status: 'enabled' as const,
  remark: '',
};
beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

it('本地CRUD持久化、稳定ID、输入不可变，不触碰其它命名空间', async () => {
  localStorage.setItem('unrelated', 'keep');
  const initial = await listRecords();
  const created = await saveRecord(draft);
  const id = created.at(-1)?.id;
  expect(id).toBeTruthy();
  const updated = await saveRecord(
    { ...draft, name: '修改记录', remark: '备注' },
    id,
  );
  expect(updated.at(-1)).toMatchObject({ id, name: '修改记录' });
  expect(initial).toHaveLength(12);
  expect(draft.name).toBe('测试记录');
  expect(await listRecords()).toEqual(updated);
  await deleteRecord(id ?? '');
  expect(await listRecords()).toEqual(initial);
  expect(localStorage.getItem('unrelated')).toBe('keep');
});

it('空数组不重新造示例，编码唯一、输入校验及过期ID防止错误覆盖', async () => {
  localStorage.setItem(storageKey, '[]');
  expect(await listRecords()).toEqual([]);
  await saveRecord(draft);
  await expect(saveRecord({ ...draft, code: 'test_1' })).rejects.toThrow(
    '编码已存在',
  );
  await expect(saveRecord({ ...draft, name: ' ' })).rejects.toThrow('名称');
  await expect(saveRecord(draft, 'deleted')).rejects.toThrow('已不存在');
  await expect(deleteRecord('deleted')).rejects.toThrow('已不存在');
});

it.each([
  'broken-json',
  '{}',
  '[{"id":"x"}]',
  JSON.stringify([
    { ...draft, id: 'same' },
    { ...draft, code: 'OTHER', id: 'same' },
  ]),
  JSON.stringify([
    { ...draft, id: 'a' },
    { ...draft, code: 'test_1', id: 'b' },
  ]),
])('损坏存储%s报错并保留原值，不自动清空覆盖', async (raw) => {
  localStorage.setItem(storageKey, raw);
  await expect(listRecords()).rejects.toThrow('格式异常');
  await expect(saveRecord(draft)).rejects.toThrow('格式异常');
  expect(localStorage.getItem(storageKey)).toBe(raw);
});

it('存储禁用和空间不足明确失败，不改变已保存数据', async () => {
  await saveRecord(draft);
  const original = localStorage.getItem(storageKey);
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new Error('QuotaExceededError');
  });
  await expect(saveRecord({ ...draft, code: 'OTHER' })).rejects.toThrow(
    '空间不足',
  );
  await expect(deleteRecord('example-1')).rejects.toThrow('空间不足');
  expect(localStorage.getItem(storageKey)).toBe(original);
  vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
    throw new Error('SecurityError');
  });
  await expect(listRecords()).rejects.toThrow('存储权限');
});
