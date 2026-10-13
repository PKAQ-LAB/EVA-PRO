import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  Cascader,
  ConfigProvider,
  DatePicker,
  Input,
  InputNumber,
  Select,
  TimePicker,
  TreeSelect,
  theme,
} from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchDict: vi.fn(),
  fetchMenus: vi.fn(),
  historyReplace: vi.fn(),
  login: vi.fn(),
  messageError: vi.fn(),
  messageSuccess: vi.fn(),
  rootInitialState: undefined as
    | { currentUser?: { menus?: unknown[] } }
    | undefined,
  rootLoading: false,
  resolveMenuNavigation: vi.fn(),
  setInitialState: vi.fn(),
}));

const mockHistory = {
  location: {
    hash: '',
    pathname: '/',
    search: '',
  },
  replace: mocks.historyReplace,
};

vi.mock('@umijs/max', () => ({
  defineConfig: (config: unknown) => config,
  Helmet: ({ children }: { children?: React.ReactNode }) => children,
  history: mockHistory,
  Link: ({ children }: { children?: React.ReactNode }) => children,
  SelectLang: () => null,
  useIntl: () => ({
    formatMessage: ({
      defaultMessage,
      id,
    }: {
      defaultMessage?: string;
      id: string;
    }) => defaultMessage || id,
  }),
  useModel: () => ({
    initialState: mocks.rootInitialState,
    loading: mocks.rootLoading,
    setInitialState: mocks.setInitialState,
  }),
}));

vi.mock('@ant-design/icons', () => ({
  ArrowRightOutlined: () => null,
  EyeInvisibleOutlined: () => null,
  EyeOutlined: () => null,
  LinkOutlined: () => null,
  UserOutlined: () => null,
}));

vi.mock('@ant-design/pro-components', () => ({
  SettingDrawer: () => null,
}));

vi.mock('antd-style', () => ({
  createStyles: () => () => ({
    styles: new Proxy({}, { get: (_, key) => String(key) }),
  }),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    App: {
      useApp: () => ({
        message: {
          error: mocks.messageError,
          success: mocks.messageSuccess,
        },
      }),
    },
  };
});

vi.mock('@/appicon', () => ({ default: {} }));

vi.mock('@/components', () => ({
  AvatarDropdown: ({ children }: { children?: React.ReactNode }) => children,
  ErrorBoundary: ({ children }: { children?: React.ReactNode }) => children,
  Footer: () => null,
  FullscreenToggle: () => null,
  LangDropdown: () => null,
  OfflineBanner: () => null,
  PageLoading: () => null,
}));

vi.mock('@/services/auth', () => ({
  login: mocks.login,
}));

vi.mock('@/services/user', () => ({
  fetchDict: mocks.fetchDict,
  fetchMenus: mocks.fetchMenus,
}));

vi.mock('@/utils/authState', () => ({
  clearAuthState: vi.fn(),
  getErrorMessage: () => '',
  isAuthExpiredError: () => false,
  redirectToLogin: vi.fn(),
  setStoredAccessToken: vi.fn(),
  setStoredRefreshToken: vi.fn(),
}));

vi.mock('@/utils/DataHelper', () => ({
  loopMenuItem: (menus: unknown[]) => menus,
}));

vi.mock('@/utils/menuNavigation', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/utils/menuNavigation')>();
  return {
    ...actual,
    resolveMenuNavigation: mocks.resolveMenuNavigation,
  };
});

vi.mock('@/utils/screenlog', () => ({ printANSI: vi.fn() }));
vi.mock('./requestErrorConfig', () => ({ errorConfig: {} }));
vi.mock('../config/defaultSettings', () => ({
  default: { navTheme: 'light', title: 'Eva Admin Pro' },
}));

describe('menu navigation wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHistory.location = {
      hash: '',
      pathname: '/',
      search: '',
    };
    window.location.hash = '';
    mocks.rootInitialState = undefined;
    mocks.rootLoading = false;
  });

  it('登录使用 resolveMenuNavigation 返回的 path 跳转', async () => {
    const menus = [
      {
        code: 'sys',
        children: [{ routeUrl: '/sys/role' }],
      },
    ];
    mocks.login.mockResolvedValue({
      data: {
        access_token: 'access-token',
        user_info: { name: 'Tester' },
      },
      status: 'ok',
      success: true,
    });
    mocks.fetchMenus.mockResolvedValue({ data: menus });
    mocks.fetchDict.mockResolvedValue({ data: {} });
    mocks.resolveMenuNavigation.mockReturnValue({ path: '/sys/role' });

    const { default: Login } = await import('@/pages/user/login');
    const view = render(<Login />);

    expect(screen.getByRole('textbox', { name: '请输入账号' })).toBe(
      screen.getByPlaceholderText('请输入账号'),
    );
    expect(screen.getByLabelText('请输入密码')).toBe(
      screen.getByPlaceholderText('请输入密码'),
    );
    expect(view.container.querySelector('.ant-form-item-label')).toBeNull();

    fireEvent.change(screen.getByPlaceholderText('请输入账号'), {
      target: { value: 'tester' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
      target: { value: 'password' },
    });
    const form = view.container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(mocks.resolveMenuNavigation).toHaveBeenCalledWith(menus);
      expect(mocks.historyReplace).toHaveBeenCalledWith('/sys/role');
    });

    view.unmount();
  });

  it('layout 的 location 与 selectedKeys 跟随登录后的子模块路径', async () => {
    mockHistory.location = {
      hash: '',
      pathname: '/sys/role',
      search: '',
    };
    window.location.hash = '#/sys/role';

    const { layout } = await import('./app');
    const layoutConfig = layout({
      initialState: {
        currentUser: {
          menus: [
            {
              code: 'sys',
              children: [{ routeUrl: '/sys/role' }],
            },
          ],
        },
      },
      setInitialState: vi.fn(),
    } as never);

    expect(layoutConfig.location?.pathname).toBe('/sys/role');
    expect(layoutConfig.selectedKeys).toEqual(['/sys/role']);
    expect(layoutConfig).not.toHaveProperty('menuProps');
  });

  it('根入口复用初始菜单解析结果跳转且不重复请求菜单', async () => {
    const menus = [
      {
        code: 'sys',
        children: [{ routeUrl: '/sys/role' }],
      },
    ];
    mocks.rootInitialState = { currentUser: { menus } };
    mocks.resolveMenuNavigation.mockReturnValue({ path: '/sys/role' });

    const { default: RootPage } = await import('@/pages/index');
    const view = render(<RootPage />);

    await waitFor(() => {
      expect(mocks.resolveMenuNavigation).toHaveBeenCalledWith(menus);
      expect(mocks.historyReplace).toHaveBeenCalledWith('/sys/role');
    });
    expect(mocks.fetchMenus).not.toHaveBeenCalled();

    view.unmount();
  });

  it('根入口在初始状态加载中或已离开根路由时不覆盖导航', async () => {
    mocks.rootInitialState = { currentUser: { menus: [] } };
    mocks.resolveMenuNavigation.mockReturnValue({ path: '/exception/403' });
    mocks.rootLoading = true;

    const { default: RootPage } = await import('@/pages/index');
    const loadingView = render(<RootPage />);
    await waitFor(() => {
      expect(mocks.resolveMenuNavigation).toHaveBeenCalledWith([]);
    });
    expect(mocks.historyReplace).not.toHaveBeenCalled();
    loadingView.unmount();

    mocks.rootLoading = false;
    mockHistory.location.pathname = '/user/login';
    window.location.hash = '#/user/login';
    const redirectedView = render(<RootPage />);
    await waitFor(() => {
      expect(mocks.resolveMenuNavigation).toHaveBeenCalledTimes(2);
    });
    expect(mocks.historyReplace).not.toHaveBeenCalled();
    redirectedView.unmount();
  });

  it('根入口加载结束后跳转，但不覆盖业务深链', async () => {
    mocks.rootInitialState = {
      currentUser: { menus: [{ code: 'sys.role' }] },
    };
    mocks.resolveMenuNavigation.mockReturnValue({ path: '/sys/role' });
    mocks.rootLoading = true;

    const { default: RootPage } = await import('@/pages/index');
    const view = render(<RootPage />);
    expect(mocks.historyReplace).not.toHaveBeenCalled();

    mocks.rootLoading = false;
    view.rerender(<RootPage />);
    expect(mocks.historyReplace).toHaveBeenCalledWith('/sys/role');
    view.unmount();

    mocks.historyReplace.mockClear();
    mockHistory.location.pathname = '/sys/dictionary';
    window.location.hash = '#/sys/dictionary?tab=details';
    const deepLinkView = render(<RootPage />);
    expect(mocks.historyReplace).not.toHaveBeenCalled();
    deepLinkView.unmount();
  });

  it('路由仅移除示例入口并保留直接业务路由', async () => {
    const { default: routes } = await import('../config/routes');
    type RouteItem = { path: string; routes?: RouteItem[] };
    const collectPaths = (items: RouteItem[]): string[] =>
      items.flatMap((item) => [
        item.path,
        ...(item.routes ? collectPaths(item.routes) : []),
      ]);
    const paths = collectPaths(routes);

    expect(paths).not.toContain('/welcome');
    expect(paths).not.toContain('/admin');
    expect(paths).not.toContain('/admin/sub-page');
    expect(paths).not.toContain('/list');
    expect(paths).not.toContain('/dev');
    expect(paths).not.toContain('/dev/generator');
    expect(paths).not.toContain('/dev/workflow');
    expect(paths).toContain('/sys/role');
    expect(paths).toContain('/exception/403');
  });

  it.each(['normal', 'error', 'disabled'] as const)(
    '亮暗工作区表单变体 %s 覆盖实际家族',
    async (state) => {
      const { layout } = await import('./app');
      const props = {
        disabled: state === 'disabled',
        status: state === 'error' ? ('error' as const) : undefined,
      };
      const controls = [
        <Input key="input" {...props} />,
        <Input.Password key="password" {...props} />,
        <Input.TextArea key="textarea" {...props} />,
        <Select key="select" {...props} options={[]} />,
        <TreeSelect key="tree-select" {...props} treeData={[]} />,
        <Cascader key="cascader" {...props} options={[]} />,
        <DatePicker key="date" {...props} />,
        <DatePicker.RangePicker key="range" {...props} />,
        <TimePicker key="time" {...props} />,
        <InputNumber key="number" {...props} />,
      ];
      for (const navTheme of ['light', 'realDark'] as const) {
        const config = layout({
          initialState: { settings: { navTheme } },
          setInitialState: vi.fn(),
        } as never);
        const children = (
          <>
            {controls.map((control, index) => (
              <div key={control.key} data-testid={`family-${index}`}>
                {control}
              </div>
            ))}
          </>
        );
        const view = render(
          <ConfigProvider
            variant="filled"
            theme={{
              algorithm:
                navTheme === 'realDark'
                  ? theme.darkAlgorithm
                  : theme.defaultAlgorithm,
            }}
          >
            {config.childrenRender?.(children, {} as never)}
          </ConfigProvider>,
        );
        const variant = navTheme === 'realDark' ? 'filled' : 'outlined';
        for (let index = 0; index < controls.length; index++) {
          const family = screen.getByTestId(`family-${index}`);
          expect(family.querySelector(`[class*="-${variant}"]`)).not.toBeNull();
          if (state === 'error')
            expect(
              family.querySelector('[class*="status-error"]'),
            ).not.toBeNull();
          if (state === 'disabled')
            expect(
              family.querySelector('[disabled], [class*="-disabled"]'),
            ).not.toBeNull();
        }
        view.unmount();
      }
    },
  );

  it('初始站点标题复用品牌配置', async () => {
    const { default: config } = await import('../config/config');
    const { default: settings } = await import('../config/defaultSettings');
    expect(config.title).toBe(settings.title);
    expect(config.title).not.toBe('Ant Design Pro');
  });
});
