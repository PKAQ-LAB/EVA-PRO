import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listRoleModules, listRoleUsers, saveRoleModules } from './service';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn(),
    list: mocks.list,
    post: mocks.post,
  },
}));

describe('listRoleModules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the first module for duplicate IDs across branches', async () => {
    const modules = [
      {
        id: 'parent-1',
        name: '分支一',
        children: [{ id: 'shared', name: '首个共享模块' }],
      },
      {
        id: 'parent-2',
        name: '分支二',
        children: [
          { id: 'shared', name: '重复共享模块' },
          { id: 'unique', name: '唯一模块' },
        ],
      },
    ];
    mocks.list.mockResolvedValue({
      success: true,
      data: { modules, checked: [], checkedResource: {} },
    });

    const result = await listRoleModules('role-1');
    const normalizedModules = result.data?.modules ?? [];

    expect(normalizedModules[0]?.children).toEqual([
      { id: 'shared', name: '首个共享模块' },
    ]);
    expect(normalizedModules[1]?.children).toEqual([
      { id: 'unique', name: '唯一模块' },
    ]);
    expect(modules[1].children).toHaveLength(2);
  });
});

it('后端checkedModuleIds及资源checked回填，未勾选按钮仍是允许候选', async () => {
  const data = {
    modules: [
      {
        id: 'm1',
        name: '模块',
        resources: [
          { id: 'r1', code: 'CREATE', resourceDesc: '新增', checked: 1 },
          { id: 'r2', code: 'QUERY', resourceDesc: '查询', checked: 0 },
        ],
      },
    ],
    checkedModuleIds: ['m1'],
  };
  mocks.list.mockResolvedValue({ success: true, data });
  const result = await listRoleModules('role-a');
  expect(result.data.modules?.[0]?.resources).toHaveLength(2);
  expect(result.data.checked).toEqual(['m1']);
  expect(result.data.checkedResource).toEqual({ m1: ['r1'] });
  expect(data.modules[0].resources[1].checked).toBe(0);
});

it('授权仅发送勾选模块的资源ID，不混入模块ID或未勾选模块资源', async () => {
  mocks.post.mockResolvedValue({ success: true });
  await saveRoleModules('role-a', [{ moduleId: 'm1' }], {
    m1: ['r1', 'r1'],
    m2: ['outside'],
  });
  expect(mocks.post.mock.calls[0][1]).toEqual({
    roleId: 'role-a',
    resourceId: ['r1'],
  });
});

it.each([undefined, 'dept-a'])(
  '授权用户查询携带roleId，部门%s，并回填真实checkedUser',
  async (deptId) => {
    const data = {
      users: [{ id: '101', name: '测试用户' }],
      checkedUser: [101, '102'],
    };
    mocks.list.mockResolvedValue({ success: true, data });
    const result = await listRoleUsers('role-a', deptId);
    expect(mocks.list).toHaveBeenLastCalledWith('/api/sys/role/listUser', {
      roleId: 'role-a',
      deptId,
    });
    expect(result.data.checked).toEqual(['101', '102']);
    expect(result.data.users).toEqual(data.users);
    expect(data.checkedUser).toEqual([101, '102']);
  },
);

it('显式空checked保持清空，不被兼容字段重新勾选', async () => {
  mocks.list.mockResolvedValue({
    success: true,
    data: { users: [], checked: [], checkedUser: ['101'] },
  });
  expect((await listRoleUsers('role-a')).data.checked).toEqual([]);
});
