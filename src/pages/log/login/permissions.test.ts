import { expect, it } from 'vitest';
import access from '@/access';
import APIS from '@/apis';
import { normalizeMenuPaths } from '@/utils/menuNavigation';
import { canReadLoginLog } from './permissions';

const menu = {
  routeUrl: '/log/login',
  name: '后端真实名称',
  resources: [{ resourceType: 'GET', resourceUrl: '/monitor/log/login/**' }],
};
it('只接已授权菜单，不从父API资源硬造入口、不按admin标签授予', () => {
  expect(
    canReadLoginLog(
      { access: 'admin', resourcePermissionEnabled: false },
      APIS.LOGINLOG_LIST,
    ),
  ).toBe(false);
  expect(
    canReadLoginLog(
      {
        resourcePermissionEnabled: true,
        menus: [{ resources: menu.resources }],
      },
      APIS.LOGINLOG_LIST,
    ),
  ).toBe(false);
  expect(
    canReadLoginLog(
      { resourcePermissionEnabled: true, menus: [menu] },
      APIS.LOGINLOG_LIST,
    ),
  ).toBe(true);
  expect(
    access({ currentUser: { resourcePermissionEnabled: true, menus: [menu] } })
      .canReadLoginLogs,
  ).toBe(true);
  expect(normalizeMenuPaths([menu])).toMatchObject([
    { path: '/log/login', name: '后端真实名称' },
  ]);
  expect(
    normalizeMenuPaths([{ name: '登录日志', code: 'API_LOG_LOGIN' }]),
  ).toEqual([]);
});
it('unknown拒绝，false仍需明确菜单，list/get逐路径独立', () => {
  expect(canReadLoginLog({ menus: [menu] }, APIS.LOGINLOG_LIST)).toBe(false);
  expect(
    canReadLoginLog(
      { resourcePermissionEnabled: false, menus: [menu] },
      APIS.LOGINLOG_LIST,
    ),
  ).toBe(true);
  const user = {
    resourcePermissionEnabled: true,
    menus: [
      {
        ...menu,
        resources: [
          { resourceType: 'GET', resourceUrl: '/monitor/log/login/list' },
        ],
      },
    ],
  };
  expect(canReadLoginLog(user, APIS.LOGINLOG_LIST)).toBe(true);
  expect(canReadLoginLog(user, `${APIS.LOGINLOG_GET}/1`)).toBe(false);
});
