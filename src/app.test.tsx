import { act, fireEvent, render, screen } from '@testing-library/react';
import { message } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { getInitialState, layout } from './app';
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
