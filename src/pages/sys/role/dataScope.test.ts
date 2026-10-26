import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import { getRole, queryRoles, saveRole } from './service';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));
beforeEach(() => vi.clearAllMocks());

it.each([
  [{}, undefined],
  [{ dataScope: null }, undefined],
  [{ dataScope: 0 }, undefined],
  [{ dataScope: null, dataPermissionType: '0000' }, undefined],
  [{ dataScope: undefined, dataPermissionType: '0000' }, undefined],
  [{ dataScope: '', dataPermissionType: '0000' }, ''],
  [{ dataPermissionType: '0001' }, '0001'],
  [{ dataScope: '0000' }, '0000'],
  [{ dataScope: '0003', dataOrgIds: '101,102' }, '0003'],
] as const)(
  'list/get保持实际权限%s，缺省或null不伪造ALL',
  async (fields, expected) => {
    const record = { id: 'role-a', name: '测试角色', ...fields };
    const snapshot = structuredClone(record);
    mocks.request.mockImplementation(async (url: string) => ({
      success: true,
      data: url.startsWith(APIS.ROLE_GET)
        ? record
        : { records: [record], total: 1 },
    }));
    const detail = (await getRole('role-a')).data;
    const row = (await queryRoles({})).data.list[0];
    expect(detail?.dataScope).toBe(expected);
    expect(row.dataScope).toBe(expected);
    if (expected === '0003') expect(detail?.dataOrgIds).toEqual(['101', '102']);
    expect(record).toEqual(snapshot);
  },
);

it.each([undefined, '', '   '])(
  '缺省或空scope%s即使有legacy ALL也不POST',
  async (dataScope) => {
    await expect(
      saveRole({ name: '测试', dataScope, dataPermissionType: '0000' }),
    ).rejects.toThrow('请选择数据权限');
    expect(mocks.request).not.toHaveBeenCalled();
  },
);

it('无主字段且无legacy时不POST，实际ALL/自定义/明确legacy保持原值和组织', async () => {
  await expect(saveRole({ name: '测试' })).rejects.toThrow('请选择数据权限');
  expect(mocks.request).not.toHaveBeenCalled();
  mocks.request.mockResolvedValue({ success: true });
  for (const dataScope of ['0000', '0001', '0003']) {
    const record = {
      id: 'role-a',
      name: '仅改名称',
      dataScope,
      dataOrgIds: ['101', '102'],
    };
    await saveRole(record);
    expect(mocks.request).toHaveBeenLastCalledWith(APIS.ROLE_SAVE, {
      method: 'POST',
      data: { ...record, frozen: 0, dataOrgIds: '101,102' },
    });
    expect(record.dataOrgIds).toEqual(['101', '102']);
  }
  await saveRole({ name: 'legacy', dataPermissionType: '0001' });
  expect(mocks.request.mock.calls.at(-1)?.[1].data.dataScope).toBe('0001');
});
