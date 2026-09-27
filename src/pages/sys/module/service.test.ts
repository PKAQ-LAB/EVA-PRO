import { beforeEach, describe, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import {
  checkModuleUnique,
  editModule,
  queryModules,
  sortModules,
} from './service';

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

describe('queryModules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps IDs globally unique across branches and repeated normalization', async () => {
    const modules = [
      {
        id: 'parent-1',
        name: '上级模块一',
        children: [
          { id: 'shared-child', name: '共享子模块' },
          { id: 'child-1', name: '子模块一' },
        ],
      },
      {
        id: 'parent-2',
        name: '上级模块二',
        children: [
          { id: 'shared-child', name: '跨分支重复子模块' },
          { id: 'child-2', name: '子模块二' },
        ],
      },
    ];
    mocks.list.mockResolvedValue({
      success: true,
      data: modules,
    });

    const results = await Promise.all([
      queryModules(),
      queryModules(),
      queryModules(),
    ]);
    const childIdLists = results.map((result) =>
      (result.data ?? []).flatMap(
        (parent) => parent.children?.map((child) => child.id) ?? [],
      ),
    );

    expect(childIdLists).toEqual([
      ['shared-child', 'child-1', 'child-2'],
      ['shared-child', 'child-1', 'child-2'],
      ['shared-child', 'child-1', 'child-2'],
    ]);
    childIdLists.forEach((ids) => {
      expect(ids).toHaveLength(new Set(ids).size);
    });
    expect(results[0].data?.[0]?.children?.[0]?.name).toBe('共享子模块');
    expect(modules[1].children).toHaveLength(2);
  });

  it('keeps path, code and routeUrl as distinct backend fields', async () => {
    mocks.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'module-id',
          parentId: 'parent-id',
          path: '/tree/module-id',
          code: 'MODULE_CODE',
          routeUrl: '/system/module',
        },
      ],
    });

    const result = await queryModules();

    expect(result.data?.[0]).toMatchObject({
      path: '/tree/module-id',
      code: 'MODULE_CODE',
      routeUrl: '/system/module',
    });
  });

  it('maps legacy routeurl to routeUrl without replacing tree path', async () => {
    mocks.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'module-id',
          path: '/tree/module-id',
          routeurl: '/legacy/route',
        },
      ],
    });

    const result = await queryModules();

    expect(result.data?.[0]?.path).toBe('/tree/module-id');
    expect(result.data?.[0]?.routeUrl).toBe('/legacy/route');
  });

  it('sends one sort object with the backend sort contract', async () => {
    mocks.post.mockResolvedValue({ success: true });

    await sortModules({ id: 'module-id', oldSort: 2, newSort: 1 });

    expect(mocks.post).toHaveBeenCalledWith(APIS.MODULE_SORT, {
      id: 'module-id',
      oldSort: 2,
      newSort: 1,
    });
  });

  it('does not submit the read-only tree path when editing a module', async () => {
    mocks.post.mockResolvedValue({ success: true });

    await editModule({
      id: 'module-id',
      parentId: 'parent-id',
      path: '/tree/module-id',
      code: 'MODULE_CODE',
      routeUrl: '/system/module',
    });

    const payload = mocks.post.mock.calls[0]?.[1];
    expect(mocks.post).toHaveBeenCalledWith(
      APIS.MODULE_EDIT,
      expect.objectContaining({
        id: 'module-id',
        pid: 'parent-id',
        code: 'MODULE_CODE',
        routeUrl: '/system/module',
      }),
    );
    expect(payload).not.toHaveProperty('path');
    expect(payload).not.toHaveProperty('parentId');
  });

  it('maps parentId and module code to pid and code for uniqueness checks', async () => {
    mocks.post.mockResolvedValue({ success: true });

    await checkModuleUnique('MODULE_CODE', 'parent-id', 'module-id');

    expect(mocks.post).toHaveBeenCalledWith(APIS.MODULE_CHECKUNIQUE, {
      id: 'module-id',
      pid: 'parent-id',
      code: 'MODULE_CODE',
    });
  });
});
