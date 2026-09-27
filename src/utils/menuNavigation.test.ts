import { describe, expect, it } from 'vitest';
import { normalizeMenuPaths, resolveMenuNavigation } from './menuNavigation';

describe('normalizeMenuPaths', () => {
  it('保留有路径父节点并彻底移除全无效 children', () => {
    const [parent] = normalizeMenuPaths([
      {
        path: '/sys',
        children: [{ path: '/not-registered' }],
      },
    ]) as Record<string, unknown>[];

    expect(parent).toEqual({ key: '/sys', path: '/sys' });
    expect(parent).not.toHaveProperty('children');
  });

  it('移除无路径且子节点全无效的父节点', () => {
    expect(
      normalizeMenuPaths([
        {
          name: 'invalid-group',
          children: [{ path: '/not-registered' }],
        },
      ]),
    ).toEqual([]);
  });

  it('混合子节点只保留有效项', () => {
    const [parent] = normalizeMenuPaths([
      {
        path: '/sys',
        children: [
          { path: '/not-registered' },
          { name: '角色', routeUrl: '/sys/role' },
        ],
      },
    ]) as Array<{ children?: Record<string, unknown>[] }>;

    expect(parent.children).toEqual([
      {
        key: '/sys/role',
        name: '角色',
        path: '/sys/role',
        routeUrl: '/sys/role',
      },
    ]);
  });
});

describe('resolveMenuNavigation', () => {
  it('优先锁定第一个存在可访问目标的一级菜单', () => {
    expect(
      resolveMenuNavigation([
        {
          code: 'sys',
          children: [{ code: 'sys.organization' }],
        },
        {
          code: 'log',
          children: [{ code: 'log.online' }],
        },
      ]),
    ).toEqual({ path: '/sys/organization' });
  });

  it('优先导航到一级菜单的第一个直接可访问子模块', () => {
    expect(
      resolveMenuNavigation([
        {
          code: 'sys',
          children: [{ code: 'sys.role' }, { code: 'sys.module' }],
        },
      ]).path,
    ).toBe('/sys/role');
  });

  it('后台显式路由优先于菜单编码别名', () => {
    expect(
      resolveMenuNavigation([
        {
          code: 'sys',
          children: [{ code: 'sys.account', routeUrl: '/sys/account' }],
        },
      ]).path,
    ).toBe('/sys/account');

    expect(
      resolveMenuNavigation([
        {
          code: 'sys',
          children: [{ code: 'sys.account', routeUrl: '/not-registered' }],
        },
      ]).path,
    ).toBe('/sys/user');
  });

  it('第一根存在后代目标时不越过到第二根，整体无目标时才选择下一根', () => {
    expect(
      resolveMenuNavigation([
        {
          key: 'custom-root',
          children: [
            {
              children: [{ code: 'sys.module' }],
            },
          ],
        },
        { code: 'log', children: [{ code: 'log.online' }] },
      ]),
    ).toEqual({ path: '/sys/module' });

    expect(
      resolveMenuNavigation([
        {
          code: 'unknown-root',
          children: [{ path: '/not-registered' }],
        },
        { code: 'log', children: [{ code: 'log.online' }] },
      ]).path,
    ).toBe('/log/online');
  });

  it('一级菜单没有可访问子模块时回退到一级菜单自身', () => {
    expect(resolveMenuNavigation([{ code: 'sys' }])).toEqual({ path: '/sys' });
  });

  it('首个直接子模块没有路径时降级到其首个可访问后代', () => {
    expect(
      resolveMenuNavigation([
        {
          code: 'sys',
          children: [
            {
              name: 'nested-group',
              children: [{ code: 'sys.dictionary' }],
            },
            { code: 'sys.role' },
          ],
        },
      ]).path,
    ).toBe('/sys/dictionary');
  });
});
