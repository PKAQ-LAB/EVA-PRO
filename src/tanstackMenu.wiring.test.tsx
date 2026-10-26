import { ProLayout } from '@ant-design/pro-components/es/layout';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider, theme } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { getInitialState, layout } from './app';
import {
  normalizeMenuPaths,
  resolveMenuNavigation,
} from './utils/menuNavigation';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), request: vi.fn() }));
vi.mock('@umijs/max', () => ({
  history: { location: { pathname: '/sys/role', search: '', hash: '' } },
  request: mocks.request,
  Link: ({ to, children }: { to: string; children?: ReactNode }) => (
    <a
      href={`#${to}`}
      onClick={(event) => {
        event.preventDefault();
        mocks.navigate(to);
      }}
    >
      {children}
    </a>
  ),
  useModel: () => ({}),
}));
vi.mock('@ant-design/pro-components', () => ({ SettingDrawer: () => null }));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('@/components', () => ({
  AvatarDropdown: () => null,
  ErrorBoundary: () => null,
  Footer: () => null,
  FullscreenToggle: () => null,
  LangDropdown: () => null,
  OfflineBanner: () => null,
}));
vi.mock('@/utils/screenlog', () => ({ printANSI: vi.fn() }));
vi.mock('./requestErrorConfig', () => ({ errorConfig: {} }));

const businessMenus = [
  {
    path: '/sys',
    name: '系统管理',
    children: [
      { path: '/sys/role', name: '角色管理' },
      { path: '/sys/dictionary', name: '字典管理' },
    ],
  },
];
function config(signedIn = true) {
  const currentUser: API.CurrentUser & { menus: typeof businessMenus } = {
    menus: businessMenus,
  };
  return layout({
    initialState: signedIn ? { currentUser } : {},
    setInitialState: vi.fn(),
    loading: false,
    error: undefined,
    refresh: async () => {},
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  window.location.hash = '';
});

it('追加本地菜单幂等且不改变业务菜单对象、顺序、后台白名单或首业务叶子', () => {
  const renderMenus = config().menuDataRender;
  if (!renderMenus) throw new Error('菜单扩展未配置');
  const original = structuredClone(businessMenus);
  const once = renderMenus(businessMenus);
  const twice = renderMenus(once);
  expect(once[0]).toBe(businessMenus[0]);
  expect(twice).toEqual(once);
  expect(
    twice.filter((item) => item.path === '/examples/tanstack'),
  ).toHaveLength(1);
  expect(businessMenus).toEqual(original);
  expect(resolveMenuNavigation(businessMenus).path).toBe('/sys/role');
  expect(resolveMenuNavigation(twice).path).toBe('/sys/role');
  expect(resolveMenuNavigation([]).path).toBe('/exception/403');
  expect(
    normalizeMenuPaths([{ path: '/examples/tanstack', name: '后台伪造项' }]),
  ).toEqual([]);
  expect(config(false).menuDataRender?.(once)).toEqual(businessMenus);
});

it.each([false, true])(
  '真实ProLayout侧栏显示唯一菜单并点击到已有本地深链，dark=%s',
  async (dark) => {
    const options = config();
    render(
      <ConfigProvider
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: { motion: false },
        }}
      >
        <ProLayout
          route={{ routes: [] }}
          menu={options.menu}
          menuDataRender={options.menuDataRender}
          menuItemRender={options.menuItemRender}
          location={options.location}
          selectedKeys={options.selectedKeys}
          headerRender={false}
          menuHeaderRender={false}
          collapsed={false}
          footerRender={false}
        >
          <div>业务页面</div>
        </ProLayout>
      </ConfigProvider>,
    );
    expect(
      await screen.findByRole('link', { name: '角色管理' }),
    ).toBeInTheDocument();
    const local = await screen.findByRole('link', { name: 'TanStack 示例' });
    expect(local.closest('aside')).not.toBeNull();
    expect(screen.getAllByRole('link', { name: 'TanStack 示例' })).toHaveLength(
      1,
    );
    expect(local).toHaveAttribute('href', '#/examples/tanstack');
    fireEvent.click(local);
    expect(mocks.navigate).toHaveBeenCalledWith('/examples/tanstack');
    expect(
      options.links?.some(
        (link) =>
          typeof link === 'object' &&
          link !== null &&
          'key' in link &&
          link.key === 'local-tanstack',
      ),
    ).not.toBe(true);
  },
);

it('真实fetchMenus服务经启动归一化和menu.request进入实际布局，位于本地页时仍保留业务菜单', async () => {
  const remoteMenus = [
    {
      code: 'sys',
      name: '系统管理',
      routeUrl: '/sys',
      children: [
        { code: 'role', name: '角色管理', routeUrl: '/sys/role' },
        { code: 'dictionary', name: '字典管理', routeUrl: '/sys/dictionary' },
      ],
    },
    {
      code: 'log',
      name: '系统日志',
      routeUrl: '/log',
      children: [{ code: 'error', name: '错误日志', routeUrl: '/log/error' }],
    },
  ];
  mocks.request.mockImplementation(async (url: string) => {
    if (url === '/api/auth/fetchMenus')
      return { success: true, data: remoteMenus };
    if (url === '/api/auth/fetchDicts') return { success: true, data: {} };
    throw new Error(`未约定的测试请求：${url}`);
  });
  window.location.hash = '#/examples/tanstack';
  const initialState = await getInitialState();
  const snapshot = JSON.stringify(initialState.currentUser);
  const options = layout({
    initialState,
    loading: false,
    error: undefined,
    refresh: async () => {},
    setInitialState: vi.fn(),
  });
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <ProLayout
        {...initialState.settings}
        route={{ routes: [] }}
        menu={options.menu}
        menuDataRender={options.menuDataRender}
        menuItemRender={options.menuItemRender}
        location={options.location}
        selectedKeys={options.selectedKeys}
        collapsed={false}
        headerRender={false}
        menuHeaderRender={false}
        footerRender={false}
      >
        <div>本地页面</div>
      </ProLayout>
    </ConfigProvider>,
  );
  fireEvent.click(await screen.findByText('系统管理'));
  expect(
    await screen.findByRole('link', { name: '角色管理' }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole('link', { name: '字典管理' }),
  ).toBeInTheDocument();
  fireEvent.click(await screen.findByText('系统日志'));
  expect(
    await screen.findByRole('link', { name: '错误日志' }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'TanStack 示例' })).toHaveLength(
    1,
  );
  expect(
    mocks.request.mock.calls.filter(([url]) => url === '/api/auth/fetchMenus'),
  ).toHaveLength(1);
  expect(JSON.stringify(initialState.currentUser)).toBe(snapshot);
});
