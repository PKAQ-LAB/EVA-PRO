import { ProLayout } from '@ant-design/pro-components/es/layout';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import InitialStateProvider from './.umi/plugin-initialState/Provider';
import { _LocaleContainer } from './.umi/plugin-locale/locale';
import {
  setLocale,
  useIntl as useGeneratedIntl,
} from './.umi/plugin-locale/localeExports';
import { getInitialState, layout } from './app';
import {
  type MenuNavigationItem,
  resolveMenuNavigation,
} from './utils/menuNavigation';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  model: { loading: false },
  menuCalls: vi.fn(),
}));
vi.mock('@umijs/max', () => ({
  history: {
    location: { pathname: '/examples/tanstack', search: '', hash: '' },
  },
  request: mocks.request,
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useModel: () => mocks.model,
}));
vi.mock('@@/plugin-model', () => ({ useModel: () => mocks.model }));
vi.mock('./.umi/core/plugin', () => ({
  getPluginManager: () => ({
    applyPlugins: ({ initialValue }: { initialValue: unknown }) => initialValue,
  }),
}));
vi.mock('@ant-design/pro-components', () => ({ SettingDrawer: () => null }));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('universal-cookie', () => ({
  default: class {
    get() {
      return undefined;
    }
    remove() {}
  },
}));
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

const menuA = [
  {
    code: 'sys',
    routeUrl: '/sys',
    name: '系统管理',
    children: [{ routeUrl: '/sys/role', name: '角色管理' }],
  },
];
const menuB = [
  {
    code: 'log',
    routeUrl: '/log',
    name: '系统日志',
    children: [{ routeUrl: '/log/error', name: '错误日志' }],
  },
];
type User = API.CurrentUser & { menus?: MenuNavigationItem[] };
const user = (menus: MenuNavigationItem[]): User => ({ menus });
function Menu({
  currentUser,
  formatMessage,
}: {
  currentUser?: User;
  formatMessage?: ReturnType<typeof useGeneratedIntl>['formatMessage'];
}) {
  const options = layout({
    initialState: { currentUser },
    loading: mocks.model.loading,
    setInitialState: vi.fn(),
    refresh: async () => {},
    error: undefined,
  });
  const request = options.menu?.request;
  return (
    <ProLayout
      formatMessage={formatMessage}
      route={{ routes: [] }}
      menu={{
        ...options.menu,
        request: async (...args) => {
          mocks.menuCalls();
          return request?.(...args) ?? [];
        },
      }}
      menuDataRender={options.menuDataRender}
      menuItemRender={options.menuItemRender}
      location={options.location}
      headerRender={false}
      footerRender={false}
      menuHeaderRender={false}
      collapsed={false}
    >
      <div>页面内容</div>
    </ProLayout>
  );
}

function LocaleMenu({ currentUser }: { currentUser: User }) {
  const intl = useGeneratedIntl();
  return <Menu currentUser={currentUser} formatMessage={intl.formatMessage} />;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.model.loading = false;
  window.location.hash = '#/examples/tanstack';
  mocks.request.mockImplementation(async (url: string) => ({
    success: true,
    data: url.endsWith('fetchMenus') ? menuA : {},
  }));
});

it('同一真实布局先缓存合法空菜单后接收非空快照应恢复业务父组', async () => {
  const view = render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <Menu currentUser={user([])} />
    </ConfigProvider>,
  );
  await screen.findByRole('link', { name: 'TanStack 示例' });
  await waitFor(() => expect(mocks.menuCalls).toHaveBeenCalledTimes(1));
  view.rerender(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <Menu currentUser={user(menuA)} />
    </ConfigProvider>,
  );
  expect(await screen.findByText('系统管理')).toBeInTheDocument();
  expect(mocks.menuCalls).toHaveBeenCalledTimes(2);
});

it('会话用户对象改变时不能继续展示旧快照，退出不留业务或本地菜单', async () => {
  const view = render(<Menu currentUser={user(menuA)} />);
  await screen.findByText('系统管理');
  view.rerender(<Menu currentUser={user(menuB)} />);
  expect(await screen.findByText('系统日志')).toBeInTheDocument();
  expect(screen.queryByText('系统管理')).toBeNull();
  view.rerender(<Menu />);
  await waitFor(() => expect(screen.queryByText('系统日志')).toBeNull());
  expect(screen.queryByRole('link', { name: 'TanStack 示例' })).toBeNull();
});

it('当前生成Umi首挂loading门禁不执行空用户菜单请求', async () => {
  mocks.model.loading = true;
  const view = render(
    <InitialStateProvider>
      <Menu />
    </InitialStateProvider>,
  );
  expect(mocks.menuCalls).not.toHaveBeenCalled();
  expect(screen.queryByText('页面内容')).toBeNull();
  mocks.model.loading = false;
  view.rerender(
    <InitialStateProvider>
      <Menu currentUser={user(menuA)} />
    </InitialStateProvider>,
  );
  expect(await screen.findByText('系统管理')).toBeInTheDocument();
  expect(mocks.menuCalls).toHaveBeenCalledTimes(1);
});

it('真实生成locale事件中英文往返不清空稳定用户菜单或重跑请求', async () => {
  const snapshot = user(menuA);
  await act(async () => setLocale('zh-CN', false));
  render(
    <_LocaleContainer>
      <LocaleMenu currentUser={snapshot} />
    </_LocaleContainer>,
  );
  await screen.findByText('系统管理');
  await act(async () => setLocale('en-US', false));
  await act(async () => setLocale('zh-CN', false));
  expect(screen.getByText('系统管理')).toBeInTheDocument();
  expect(mocks.menuCalls).toHaveBeenCalledTimes(1);
});

it.each([
  { menus: [] },
  { menus: [{ routeUrl: '/dev/old', name: '旧开发项' }] },
])('合法空或全过滤菜单不补业务项，首叶仍403', async ({ menus }) => {
  const snapshot = user(menus);
  render(<Menu currentUser={snapshot} />);
  await screen.findByRole('link', { name: 'TanStack 示例' });
  expect(screen.queryByText('系统管理')).toBeNull();
  expect(resolveMenuNavigation(menus).path).toBe('/exception/403');
});

it('启动请求拒绝时继续传播错误，不构造伪菜单', async () => {
  const error = new Error('测试边界拒绝');
  mocks.request.mockRejectedValue(error);
  await expect(getInitialState()).rejects.toBe(error);
});

it('旧会话尚未完成的菜单响应不能覆盖后来已验证的快照', async () => {
  let finish: (value: { success: boolean; data: typeof menuA }) => void =
    () => {};
  mocks.request.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const view = render(<Menu currentUser={{}} />);
  await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1));
  view.rerender(<Menu currentUser={user(menuB)} />);
  expect(await screen.findByText('系统日志')).toBeInTheDocument();
  await act(async () => finish({ success: true, data: menuA }));
  expect(screen.queryByText('系统管理')).toBeNull();
  expect(screen.getByText('系统日志')).toBeInTheDocument();
  expect(mocks.request).toHaveBeenCalledTimes(1);
});

it('未知成功data形状不会被当作已知菜单契约解析', async () => {
  mocks.request.mockResolvedValue({ success: true, data: { unrelated: true } });
  const state = await getInitialState();
  const menus = (state.currentUser as User).menus ?? [];
  expect(menus).toEqual([]);
  expect(resolveMenuNavigation(menus).path).toBe('/exception/403');
});
