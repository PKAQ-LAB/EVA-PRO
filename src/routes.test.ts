import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import routes from '../config/routes';

type Route = {
  path?: string;
  component?: string;
  routes?: Route[];
  children?: Route[];
};
// 沿当前 Umi 安装依赖链取真实匹配器，不模拟路由，也不依赖生成目录。
const localRequire = createRequire(import.meta.url);
const maxRequire = createRequire(
  localRequire.resolve('@umijs/max/package.json'),
);
const umiRequire = createRequire(maxRequire.resolve('umi/package.json'));
const rendererRequire = createRequire(
  umiRequire.resolve('@umijs/renderer-react/package.json'),
);
const { matchRoutes } = rendererRequire('react-router-dom') as {
  matchRoutes: (items: Route[], path: string) => { route: Route }[] | null;
};
const adapt = (items: Route[]): Route[] =>
  items.map(({ routes: children, ...route }) => ({
    ...route,
    ...(children ? { children: adapt(children) } : {}),
  }));

describe('实际Umi路由匹配', () => {
  it('旧相对通配确实漏404，合法catchall可匹配', () => {
    expect(matchRoutes([{ path: './*' }], '/account/settings')).toBeNull();
    expect(matchRoutes([{ path: '*' }], '/account/settings')).not.toBeNull();
  });
  it.each([
    ['/account/settings', './exception/404'],
    ['/not-a-registered-page/deep', './exception/404'],
    ['/', './index'],
    ['/user/login', './user/login'],
    ['/sys/account', './sys/account'],
    ['/sys/user', './sys/account'],
    ['/sys/organization', './sys/organization'],
    ['/sys/role', './sys/role'],
    ['/sys/module', './sys/module'],
    ['/sys/dictionary', './sys/dictionary'],
    ['/log/online', './log/online'],
    ['/log/biz', './log/biz'],
    ['/log/error', './log/error'],
    ['/examples/tanstack', './examples/tanstack'],
    ['/exception/403', './exception/403'],
  ])('%s按实际配置匹配%s', (path, component) => {
    const matches = matchRoutes(adapt(routes), path);
    expect(matches?.at(-1)?.route.component).toBe(component);
  });
});
