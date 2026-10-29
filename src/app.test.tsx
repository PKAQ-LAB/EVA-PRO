import { act, fireEvent, render, screen } from '@testing-library/react';
import { Button, ConfigProvider, message, Skeleton, Spin } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { antd, getInitialState, layout } from './app';
import PageLoading from './components/PageLoading';
import RootPage from './pages';
import {
  clearAuthState,
  getLoginReturnPath,
  getStoredAccessToken,
  redirectToLogin,
  setStoredAccessToken,
  setStoredRefreshToken,
} from './utils/authState';

const mocks = vi.hoisted(() => ({
  menus: vi.fn(),
  dict: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  location: { pathname: '/', search: '', hash: '' },
  model: {
    loading: false,
    error: undefined as unknown,
    initialState: undefined as
      | { currentUser?: API.CurrentUser & { menus?: unknown[] } }
      | undefined,
  },
}));
vi.mock('@umijs/max', () => ({
  history: { location: mocks.location, replace: mocks.replace },
  Link: ({ children }: { children: ReactNode }) => children,
  useModel: () => ({ ...mocks.model, refresh: mocks.refresh }),
}));
vi.mock('antd', async (original) => {
  const actual = await original<typeof import('antd')>();
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});
vi.mock('@/services/user', () => ({
  fetchMenus: mocks.menus,
  fetchDict: mocks.dict,
}));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('@/utils/screenlog', () => ({ printANSI: vi.fn() }));
vi.mock('@ant-design/pro-components', () => ({ SettingDrawer: () => null }));
vi.mock('@/components', () => ({
  AvatarDropdown: () => null,
  ErrorBoundary: ({ children }: { children: ReactNode }) => children,
  Footer: () => null,
  FullscreenToggle: () => null,
  LangDropdown: () => null,
  OfflineBanner: () => null,
}));
vi.mock('./requestErrorConfig', () => ({ errorConfig: {} }));
vi.mock('../config/defaultSettings', () => ({
  default: { navTheme: 'light' },
}));

const menus = [{ routeUrl: '/sys/role' }];

it('根antd配置保留原配置，九格仅替换默认Spin且尊重显式indicator', () => {
  const memo: Parameters<typeof antd>[0] = {
    appConfig: {},
    variant: 'filled',
    theme: { cssVar: true, token: { colorPrimary: '#1677ff' } },
    button: { autoInsertSpace: false },
    spin: {
      classNames: { root: 'original-spin' },
      styles: { indicator: { opacity: 0.7 } },
    },
  };
  const result = antd(memo);
  expect(result.appConfig).toBe(memo.appConfig);
  expect(result.theme).toBe(memo.theme);
  expect(result.button).toBe(memo.button);
  expect(result.variant).toBe(memo.variant);
  expect(result.spin?.styles).toBe(memo.spin?.styles);
  expect(memo.spin).not.toHaveProperty('indicator');
  const { appConfig: _appConfig, ...provider } = result;
  const view = render(
    <ConfigProvider {...provider}>
      <div data-testid="small-spin">
        <Spin size="small" percent={37} />
      </div>
      <div data-testid="large-spin">
        <Spin size="large" />
      </div>
      <Spin indicator={<span data-testid="explicit-indicator" />} />
      <Button loading>保存</Button>
      <Skeleton active title={false} />
    </ConfigProvider>,
  );
  for (const size of ['small', 'large']) {
    const region = screen.getByTestId(`${size}-spin`);
    expect(region.querySelector('.ant-spin')).toHaveClass('original-spin');
    const cube = region.querySelector<HTMLElement>('.ant-spin-dot');
    expect(cube).not.toBeNull();
    expect(cube).toHaveAttribute('aria-hidden', 'true');
    expect(cube).not.toHaveAttribute('percent');
    expect(cube).toHaveStyle({ opacity: '0.7' });
    expect(cube?.style.fontSize).toBe('');
    expect(cube?.querySelectorAll(':scope > span > span')).toHaveLength(9);
  }
  expect(
    screen.getByTestId('small-spin').querySelector('.ant-spin'),
  ).toHaveClass('ant-spin-sm');
  expect(
    screen.getByTestId('large-spin').querySelector('.ant-spin'),
  ).toHaveClass('ant-spin-lg');
  expect(screen.getByTestId('explicit-indicator').children).toHaveLength(0);
  expect(
    screen
      .getByRole('button', { name: /保存/ })
      .querySelector('.anticon-loading'),
  ).not.toBeNull();
  expect(view.container.querySelector('.ant-skeleton')).not.toBeNull();
  expect(
    view.container.querySelectorAll('.ant-spin-dot[aria-hidden="true"]'),
  ).toHaveLength(2);
});

it('PageLoading显式使用40px九格，保留非交互加载容器', () => {
  const view = render(<PageLoading />);
  const cube = view.container.querySelector('.ant-spin-dot');
  expect(cube).toHaveStyle({ fontSize: '40px' });
  expect(cube?.querySelectorAll(':scope > span > span')).toHaveLength(9);
  expect(view.container.querySelector('.anticon-deployment-unit')).toBeNull();
  expect(
    view.container.querySelector('button,input,textarea,select,[tabindex]'),
  ).toBeNull();
  expect(view.container.querySelector('.ant-spin')).toHaveAttribute(
    'aria-busy',
    'true',
  );
});

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.spyOn(window.location, 'replace').mockImplementation(mocks.replace);
  clearAuthState();
  setStoredAccessToken('test-access');
  setStoredRefreshToken('test-refresh');
  Object.assign(mocks.location, { pathname: '/', search: '', hash: '' });
  Object.assign(mocks.model, {
    loading: false,
    error: undefined,
    initialState: undefined,
  });
  window.location.hash = '';
  mocks.menus.mockResolvedValue({ data: menus });
  mocks.dict.mockResolvedValue({ data: { RESOURCE_TYPE: { GET: 'GET' } } });
});

it('启动必向服务端验证，旧菜单缓存不能充当有效会话', async () => {
  window.sessionStorage.setItem(
    'eva_login_menus',
    JSON.stringify([{ routeUrl: '/sys/account' }]),
  );
  const state = await getInitialState();
  expect(mocks.menus).toHaveBeenCalledTimes(1);
  expect(state.currentUser).toMatchObject({ menus });
  expect(state.settings).toEqual({ navTheme: 'light' });
  expect(mocks.replace).not.toHaveBeenCalled();
});

it.each([true, false, undefined, null, 'false'])(
  '刷新只采纳服务端外层boolean=%s，缓存false和data内字段不得回填',
  async (flag) => {
    window.sessionStorage.setItem(
      'eva_current_user',
      JSON.stringify({ name: '旧身份', resourcePermissionEnabled: false }),
    );
    mocks.menus.mockResolvedValue({
      success: true,
      resourcePermissionEnabled: flag,
      data: menus,
    });
    const state = await getInitialState();
    expect(state.currentUser?.resourcePermissionEnabled).toBe(
      typeof flag === 'boolean' ? flag : undefined,
    );
    expect(state.currentUser).toMatchObject({ menus });
  },
);

it('验证中不渲染保护内容或提前跳登录，验证成功后才选择首叶子', async () => {
  let finish: (response: { data: typeof menus }) => void = () => {};
  mocks.menus.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  mocks.model.loading = true;
  const pending = getInitialState();
  const view = render(<RootPage />);
  const settings = layout({
    initialState: undefined,
    loading: false,
    error: undefined,
    refresh: async () => {},
    setInitialState: async () => {},
  });
  const props = {} as Parameters<
    NonNullable<typeof settings.childrenRender>
  >[1];
  const protectedView = render(
    settings.childrenRender?.(<div>受保护内容</div>, props),
  );
  expect(screen.queryByText('受保护内容')).not.toBeInTheDocument();
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(mocks.dict).not.toHaveBeenCalled();
  await act(async () => {
    finish({ data: menus });
    mocks.model.initialState = await pending;
    mocks.model.loading = false;
  });
  view.rerender(<RootPage />);
  expect(mocks.replace).toHaveBeenCalledWith('/sys/role');
  protectedView.unmount();
});

it.each([true, false])(
  '401才清理并单次提示跳登录，原先有token=%s',
  async (hasToken) => {
    if (!hasToken) clearAuthState();
    mocks.menus.mockRejectedValue({ response: { status: 401 } });
    const state = await getInitialState();
    redirectToLogin();
    redirectToLogin();
    const notice = vi.mocked(message.error).mock.calls[0][0] as {
      onClose: () => void;
    };
    notice.onClose();
    expect(state.currentUser).toBeUndefined();
    expect(getStoredAccessToken()).toBe('');
    expect(message.error).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith('/#/user/login?redirect=%2F');
  },
);

it.each([403, 500, 'network', 'timeout'])(
  '%s不是未登录，保留凭据并显示可重试状态',
  async (kind) => {
    const error =
      typeof kind === 'number'
        ? { response: { status: kind } }
        : {
            request: {},
            code: kind === 'timeout' ? 'ECONNABORTED' : 'ERR_NETWORK',
          };
    mocks.menus.mockRejectedValue(error);
    await expect(getInitialState()).rejects.toBe(error);
    mocks.model.error = error;
    render(<RootPage />);
    expect(
      screen.getByText(kind === 403 ? '暂无访问权限' : '暂时无法验证登录状态'),
    ).toBeInTheDocument();
    expect(getStoredAccessToken()).toBe('test-access');
    expect(mocks.replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /重\s*试/u }));
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  },
);

it('登录页也验证现有会话，匿名登录页不会循环跳转', async () => {
  mocks.location.pathname = '/user/login';
  expect((await getInitialState()).currentUser).toMatchObject({ menus });
  expect(mocks.menus).toHaveBeenCalledTimes(1);
  mocks.menus.mockRejectedValue({ response: { status: 401 } });
  expect((await getInitialState()).currentUser).toBeUndefined();
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(message.error).not.toHaveBeenCalled();
});

it('字典401不返回半认证用户，字典500不清除已经验证的会话', async () => {
  mocks.dict.mockRejectedValue({ response: { status: 401 } });
  expect((await getInitialState()).currentUser).toBeUndefined();
  expect(message.error).toHaveBeenCalledTimes(1);
  setStoredAccessToken('test-new-access');
  mocks.dict.mockRejectedValue({ response: { status: 500 } });
  expect((await getInitialState()).currentUser).toMatchObject({ menus });
  expect(getStoredAccessToken()).toBe('test-new-access');
});
it('已有业务调用fetchDict遇401仍返回undefined，保留原调用契约', async () => {
  const state = await getInitialState();
  mocks.dict.mockRejectedValue({ response: { status: 401 } });
  await expect(state.fetchDict?.()).resolves.toBeUndefined();
  expect(message.error).toHaveBeenCalledTimes(1);
});
it('新登录后旧失效提示的迟到关闭回调不会再次重定向', () => {
  redirectToLogin();
  const notice = vi.mocked(message.error).mock.calls[0][0] as {
    onClose: () => void;
  };
  setStoredAccessToken('test-new-login');
  notice.onClose();
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(getStoredAccessToken()).toBe('test-new-login');
});

it('保护深链及query，安全返回目标拒绝外站、登录页和循环根地址', () => {
  mocks.model.initialState = { currentUser: { menus } };
  mocks.location.pathname = '/sys/dictionary';
  window.location.hash = '#/sys/dictionary?tab=details';
  render(<RootPage />);
  expect(mocks.replace).not.toHaveBeenCalled();
  for (const target of [
    'https://other.invalid',
    '//other.invalid',
    '/user/login',
    '/User/Login',
    '/user%2flogin',
    '/%2fother.invalid',
    '/%ZZ',
    '/',
    '/#//other.invalid',
    '/\\other.invalid',
  ]) {
    mocks.location.search = `?redirect=${encodeURIComponent(target)}`;
    expect(getLoginReturnPath('/sys/role')).toBe('/sys/role');
  }
  for (const target of [
    '/sys/dictionary?tab=details#section',
    '/#/sys/dictionary?tab=details',
  ]) {
    mocks.location.search = `?redirect=${encodeURIComponent(target)}`;
    expect(getLoginReturnPath('/sys/role')).toBe(target.replace('/#', ''));
  }
});
