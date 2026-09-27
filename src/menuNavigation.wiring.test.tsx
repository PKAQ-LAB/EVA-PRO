import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchDict: vi.fn(),
  fetchMenus: vi.fn(),
  historyReplace: vi.fn(),
  login: vi.fn(),
  messageError: vi.fn(),
  messageSuccess: vi.fn(),
  resolveMenuNavigation: vi.fn(),
  setInitialState: vi.fn(),
}));

const mockHistory = {
  location: {
    hash: '',
    pathname: '/welcome',
    search: '',
  },
  replace: mocks.historyReplace,
};

vi.mock('@umijs/max', () => ({
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
  useModel: () => ({ setInitialState: mocks.setInitialState }),
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
      pathname: '/welcome',
      search: '',
    };
    window.location.hash = '';
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
});
