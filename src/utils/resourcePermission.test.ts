import { describe, expect, it } from 'vitest';
import access from '@/access';
import {
  canRequestResource,
  matchesResourcePath,
  type ResourcePermissionUser,
  resourcePermissionFromResponse,
} from './resourcePermission';

const user = (method: string, path: string): ResourcePermissionUser => ({
  access: 'admin',
  resourcePermissionEnabled: true,
  menus: [
    {
      children: [{ resources: [{ resourceType: method, resourceUrl: path }] }],
    },
  ],
});

describe('服务端资源路径与开关', () => {
  it.each([
    ['/sys/organization/get/{id}', '/sys/organization/get/7', true],
    ['/sys/organization/get/{id}', '/sys/organization/get', false],
    ['/sys/organization/get/{id}', '/sys/organization/get/7/child', false],
    ['/sys/organization/g?t', '/sys/organization/get', true],
    ['/sys/organization/g?t', '/sys/organization/geet', false],
    ['/sys/organization/get*', '/sys/organization/getAll', true],
    ['/sys/organization/*', '/sys/organization/get/7', false],
    ['/sys/organization/**', '/sys/organization/get/7', true],
    ['/sys/organization/**', '/sys/organization', true],
    ['/sys/**/get/{id}', '/sys/get/7', true],
    ['/sys/**/get/{id}', '/sys/a/b/get/7', true],
    ['/sys/organization', '/sys/organizations', false],
    ['/sys/organization/', '/sys/organization', false],
    ['/', '/sys/organization/get/7', false],
    ['/sys/{id:[0-9]+}', '/sys/7', false],
    ['/sys/{broken', '/sys/7', false],
    ['/sys/**', '/sys/../other', false],
    ['/sys/**', '/sys/%ZZ', false],
  ])('Ant边界 %s 对 %s = %s', (pattern, path, allowed) => {
    expect(matchesResourcePath(pattern, path)).toBe(allowed);
  });

  it('按实际method和路径判定，资源兄弟、admin和近似前缀不放行', () => {
    const current = user('get', '/sys/organization/get/{id}');
    expect(
      canRequestResource(
        current,
        'GET',
        '/api/sys/organization/get/7?x=1#part',
      ),
    ).toBe(true);
    expect(
      canRequestResource(current, 'POST', '/api/sys/organization/get/7'),
    ).toBe(false);
    expect(
      canRequestResource(current, 'POST', '/api/sys/organization/del'),
    ).toBe(false);
    expect(
      canRequestResource(current, 'GET', '/apix/sys/organization/get/7'),
    ).toBe(false);
    expect(
      canRequestResource(current, 'GET', '/api/api/sys/organization/get/7'),
    ).toBe(false);
    expect(
      canRequestResource(
        current,
        'GET',
        'https://external/sys/organization/get/7',
      ),
    ).toBe(false);
    expect(
      access({ currentUser: { access: 'admin' } }).canRequest(
        'POST',
        '/api/sys/organization/del',
      ),
    ).toBe(false);
  });

  it('只有method=*支持非根路径及移除单尾斜杠后的下级兼容', () => {
    for (const path of ['/sys/organization', '/sys/organization/']) {
      expect(
        canRequestResource(
          user('*', path),
          'POST',
          '/api/sys/organization/get/7',
        ),
      ).toBe(true);
      expect(
        canRequestResource(
          user('POST', path),
          'POST',
          '/api/sys/organization/get/7',
        ),
      ).toBe(false);
      expect(
        canRequestResource(
          user('*', path),
          'POST',
          '/api/sys/organizations/get/7',
        ),
      ).toBe(false);
    }
    expect(
      canRequestResource(user('*', '/'), 'POST', '/api/sys/organization/del'),
    ).toBe(false);
  });

  it.each([undefined, null, 'false', 'true', 0, 1])(
    '未知能力%s拒绝，不能由admin或坏资源补权',
    (flag) => {
      const current = {
        ...user('*', '/**'),
        resourcePermissionEnabled: flag,
      } as ResourcePermissionUser;
      expect(
        canRequestResource(current, 'POST', '/api/sys/organization/del'),
      ).toBe(false);
      expect(
        resourcePermissionFromResponse({
          success: true,
          resourcePermissionEnabled: flag,
        }),
      ).toBeUndefined();
    },
  );

  it('false必须显式成功且已认证；缺/坏菜单在true下拒绝，循环菜单不递归溢出', () => {
    expect(
      resourcePermissionFromResponse({
        success: true,
        resourcePermissionEnabled: false,
      }),
    ).toBe(false);
    expect(
      resourcePermissionFromResponse({
        success: false,
        resourcePermissionEnabled: false,
      }),
    ).toBeUndefined();
    expect(
      resourcePermissionFromResponse({ resourcePermissionEnabled: false }),
    ).toBeUndefined();
    expect(
      canRequestResource(undefined, 'POST', '/api/sys/organization/edit'),
    ).toBe(false);
    expect(
      canRequestResource(
        { resourcePermissionEnabled: false },
        'POST',
        '/api/sys/organization/edit',
      ),
    ).toBe(true);
    const menu: { children?: unknown[]; resources?: unknown } = {
      resources: [{ resourceType: null, resourceUrl: '/**' }],
    };
    menu.children = [menu];
    expect(
      canRequestResource(
        { resourcePermissionEnabled: true, menus: [menu] },
        'POST',
        '/api/sys/organization/edit',
      ),
    ).toBe(false);
  });
});
