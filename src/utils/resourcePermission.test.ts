import { expect, it } from 'vitest';
import access from '@/access';
import {
  canActionResource,
  type ResourcePermissionUser,
  resolveMenuId,
  resourcePermissionFromResponse,
} from './resourcePermission';

const user = (
  resources: unknown = ['list', 'read'],
  enabled: unknown = true,
): ResourcePermissionUser =>
  ({
    resourcePermissionEnabled: enabled,
    menus: [
      { id: 'org-menu', routeUrl: '/sys/organization', resources },
      { id: 'role-menu', routeUrl: '/sys/role', resources: ['update'] },
    ],
  }) as ResourcePermissionUser;
it('按稳定菜单ID和key判定，同名兄弟key不借权，read不包含list/update', () => {
  const current = user(['read']);
  const permission = access({ currentUser: current });
  expect(permission.canAction('org-menu', 'read')).toBe(true);
  expect(permission.canAction('/sys/organization', 'read')).toBe(true);
  expect(permission.canAction('org-menu', 'list')).toBe(false);
  expect(permission.canAction('org-menu', 'update')).toBe(false);
  expect(permission.canAction('role-menu', 'update')).toBe(true);
  expect(permission.canAction('/sys/organizations', 'read')).toBe(false);
  expect(permission.canAction('/sys/organization/7', 'read')).toBe(false);
});
it.each([undefined, null, 'true', 'false', 0, 1])(
  '未知resource能力%s拒绝，admin/dataflag不补权',
  (flag) => {
    const current = {
      ...user(['read']),
      resourcePermissionEnabled: flag,
      access: 'admin',
      dataPermissionEnabled: false,
    } as ResourcePermissionUser;
    expect(canActionResource(current, 'org-menu', 'read')).toBe(false);
    expect(
      resourcePermissionFromResponse({
        success: true,
        resourcePermissionEnabled: flag,
      }),
    ).toBeUndefined();
  },
);
it.each([
  [{ resourceType: '*', resourceUrl: '/**' }],
  ['read', { resourceType: 'GET', resourceUrl: '/sys/**' }],
  null,
])('旧metadata或坏资源%s不能授权', (resources) =>
  expect(canActionResource(user(resources), 'org-menu', 'read')).toBe(false),
);
it('显式关闭绕key仍需唯一菜单，缺身份/菜单或重复ID都拒绝', () => {
  expect(canActionResource(user([], false), 'org-menu', 'update')).toBe(true);
  expect(canActionResource(user([], false), 'missing', 'update')).toBe(false);
  expect(canActionResource(undefined, 'org-menu', 'read')).toBe(false);
  expect(
    canActionResource(
      {
        ...user(),
        menus: [
          { id: 'x', routeUrl: '/sys/role', resources: ['read'] },
          { id: 'x', routeUrl: '/sys/organization', resources: ['read'] },
        ],
      },
      'x',
      'read',
    ),
  ).toBe(false);
});
it('route只精确读取routeUrl，别名唯一才解析，不从code或前缀猜菜单', () => {
  const current = {
    ...user(),
    menus: [{ id: 'account', routeUrl: '/sys/account', resources: ['read'] }],
  };
  expect(resolveMenuId(current, '/sys/user')).toBe('account');
  expect(
    resolveMenuId(
      {
        ...current,
        menus: [
          ...current.menus,
          { id: 'other', routeUrl: '/sys/user', resources: ['read'] },
        ],
      },
      '/sys/user',
    ),
  ).toBeUndefined();
  expect(
    resolveMenuId(
      {
        ...current,
        menus: [{ id: 'fake', code: 'sys.organization', resources: ['read'] }],
      },
      '/sys/organization',
    ),
  ).toBeUndefined();
});
it.each(['*', 'API_SYS_EDIT', 'sys.read', 'sys:read', '', 'Read'])(
  '非法/旧命名key%s不推权限',
  (key) => expect(canActionResource(user([key]), 'org-menu', key)).toBe(false),
);
it('成功外层boolean只认显式值，失败与缺状态不能启用', () => {
  expect(
    resourcePermissionFromResponse({
      success: true,
      resourcePermissionEnabled: false,
    }),
  ).toBe(false);
  expect(
    resourcePermissionFromResponse({
      success: false,
      resourcePermissionEnabled: true,
    }),
  ).toBeUndefined();
  expect(
    resourcePermissionFromResponse({ resourcePermissionEnabled: true }),
  ).toBeUndefined();
});
