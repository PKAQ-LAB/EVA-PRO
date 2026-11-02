import { expect, it } from 'vitest';
import access from '@/access';
import { canReadLoginLog } from './permissions';

const menu = { id: 'login-menu', routeUrl: '/log/login', resources: ['list'] };
it('页面list与详情read独立，admin和其他菜单不能授予', () => {
  const user = { resourcePermissionEnabled: true, menus: [menu] };
  expect(access({ currentUser: user }).canReadLoginLogs).toBe(true);
  expect(canReadLoginLog(user, 'list')).toBe(true);
  expect(canReadLoginLog(user, 'read')).toBe(false);
  expect(
    canReadLoginLog(
      { ...user, menus: [{ ...menu, resources: ['read'] }] },
      'list',
    ),
  ).toBe(false);
  expect(
    canReadLoginLog(
      { access: 'admin', resourcePermissionEnabled: false },
      'list',
    ),
  ).toBe(false);
  expect(
    canReadLoginLog(
      { ...user, menus: [{ ...menu, routeUrl: '/log/error' }] },
      'list',
    ),
  ).toBe(false);
});
it('关闭需真实菜单，未知拒绝，旧HTTP对象不授详情', () => {
  expect(
    canReadLoginLog(
      { resourcePermissionEnabled: false, menus: [menu] },
      'read',
    ),
  ).toBe(true);
  expect(canReadLoginLog({ menus: [menu] }, 'list')).toBe(false);
  expect(
    canReadLoginLog(
      {
        resourcePermissionEnabled: true,
        menus: [
          { ...menu, resources: [{ resourceType: 'GET', resourceUrl: '/**' }] },
        ],
      },
      'read',
    ),
  ).toBe(false);
});
