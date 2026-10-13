import { describe, expect, it } from 'vitest';
import { normalizeMenuPaths, resolveMenuNavigation } from './menuNavigation';

describe('normalizeMenuPaths', () => {
  it('有业务路径的中间节点在后代全部无效后也移除', () => {
    const menus = [
      {
        code: 'sys.organization',
        children: [{ path: '/not-registered' }],
      },
    ];

    expect(normalizeMenuPaths(menus)).toEqual([]);
    expect(resolveMenuNavigation(menus)).toEqual({ path: '/exception/403' });
  });

  it('移除子节点全无效的重定向分组', () => {
    expect(
      normalizeMenuPaths([
        {
          path: '/sys',
          children: [{ path: '/not-registered' }],
        },
      ]),
    ).toEqual([]);
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
    expect(parent).toMatchObject({ key: '/sys', path: '/sys' });
  });
});

describe('resolveMenuNavigation', () => {
  it('整个开发工具分组移除，后代路径不能重新成为登录目标', () => {
    const menus = [
      { code: 'dev', children: [{ path: '/sys/role' }] },
      {
        code: 'sys',
        children: [{ code: 'dev.generator' }, { code: 'sys.dictionary' }],
      },
      { code: 'log', children: [{ code: 'log.online' }] },
    ];
    const snapshot = JSON.stringify(menus);
    expect(resolveMenuNavigation(menus)).toEqual({ path: '/sys/dictionary' });
    expect(normalizeMenuPaths(menus)).toEqual([
      {
        code: 'sys',
        name: '系统管理',
        key: '/sys',
        path: '/sys',
        children: [
          {
            code: 'sys.dictionary',
            name: '字典管理',
            key: '/sys/dictionary',
            path: '/sys/dictionary',
          },
        ],
      },
      {
        code: 'log',
        name: '系统日志',
        key: '/log',
        path: '/log',
        children: [
          {
            code: 'log.online',
            name: '在线用户',
            key: '/log/online',
            path: '/log/online',
          },
        ],
      },
    ]);
    expect(JSON.stringify(menus)).toBe(snapshot);
  });

  it('后台开发工具编码和路由残留全部过滤，没有真实菜单时进入403', () => {
    const menus = [
      { name: 'menu.dev', children: [{ code: 'sys.role' }] },
      { moduleCode: 'dev.workflow', routeUrl: '/sys/role' },
      { code: 'sys.role', routeurl: '/dev/generator' },
      { router: 'dev/workflow' },
      { url: '/dev/other' },
      { path: '/dev' },
    ];
    expect(normalizeMenuPaths(menus)).toEqual([]);
    expect(resolveMenuNavigation(menus)).toEqual({ path: '/exception/403' });
  });

  it('删除匹配有边界，保留其他合法业务叶子和后台顺序', () => {
    const menus = [
      { code: 'developer', path: '/sys/role' },
      { code: 'log.online' },
    ];
    expect(resolveMenuNavigation(menus)).toEqual({ path: '/sys/role' });
    expect(normalizeMenuPaths(menus)).toHaveLength(2);
  });

  it('过滤后台遗留示例菜单并保留后续业务入口', () => {
    const menus = [
      { path: '/welcome' },
      { path: '/admin', children: [{ path: '/admin/sub-page' }] },
      { path: '/list' },
      { code: 'sys.role' },
    ];

    expect(resolveMenuNavigation(menus)).toEqual({ path: '/sys/role' });
    expect(normalizeMenuPaths(menus)).toEqual([
      {
        code: 'sys.role',
        name: '角色管理',
        key: '/sys/role',
        path: '/sys/role',
      },
    ]);
  });

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

  it('优先导航到一级菜单的第一个可访问叶子模块', () => {
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

  it('不把无子节点的重定向分组当作可访问叶子', () => {
    expect(
      resolveMenuNavigation([
        { code: 'sys' },
        { code: 'log' },
        { code: 'dev' },
        { code: 'sys.role' },
      ]),
    ).toEqual({ path: '/sys/role' });
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

  it('有路径的中间节点仍按后台顺序深度优先选择叶子', () => {
    expect(
      resolveMenuNavigation([
        {
          code: 'sys',
          children: [
            {
              code: 'sys.organization',
              children: [{ code: 'sys.dictionary' }],
            },
            { code: 'sys.role' },
          ],
        },
      ]),
    ).toEqual({ path: '/sys/dictionary' });
  });

  it('无可访问叶子时进入无权限页而不是固定业务页', () => {
    expect(
      resolveMenuNavigation([{ code: 'sys' }, { path: '/not-registered' }]),
    ).toEqual({ path: '/exception/403' });
    expect(resolveMenuNavigation([])).toEqual({ path: '/exception/403' });
  });
});
