import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listRoleModules } from './service';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn(),
    list: mocks.list,
    post: vi.fn(),
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
