import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import type { ResourcePermissionUser } from '@/utils/resourcePermission';
import Login from './index';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  menus: vi.fn(),
  dict: vi.fn(),
  setInitialState: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('@umijs/max', () => ({
  Helmet: ({ children }: { children: ReactNode }) => children,
  SelectLang: () => null,
  history: {
    location: { pathname: '/user/login', search: '', hash: '' },
    replace: mocks.replace,
  },
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
  useModel: () => ({
    loading: false,
    initialState: undefined,
    setInitialState: mocks.setInitialState,
  }),
}));
vi.mock('@/services/auth', () => ({ login: mocks.login }));
vi.mock('@/services/user', () => ({
  fetchMenus: mocks.menus,
  fetchDict: mocks.dict,
}));
vi.mock('@/components/AuthBootstrapStatus', () => ({ default: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.dict.mockResolvedValue({ data: {} });
  mocks.login.mockResolvedValue({
    success: true,
    resourcePermissionEnabled: false,
    data: {
      access_token: 'test-token',
      user_info: { name: '当前身份', resourcePermissionEnabled: false },
    },
  });
});

function submitLogin() {
  const form = screen.getByLabelText('请输入账号').closest('form');
  if (!form) throw new Error('登录表单未挂载');
  fireEvent.submit(form);
}

it.each([true, false, undefined, null, 'false'])(
  '登录后的fetchMenus外层能力%s覆盖login和userinfo旧false',
  async (flag) => {
    const menus = [{ routeUrl: '/sys/organization', resources: [] }];
    mocks.menus.mockResolvedValue({
      success: true,
      resourcePermissionEnabled: flag,
      data: menus,
    });
    render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <App>
          <Login />
        </App>
      </ConfigProvider>,
    );
    fireEvent.change(screen.getByLabelText('请输入账号'), {
      target: { value: 'tester' },
    });
    fireEvent.change(screen.getByLabelText('请输入密码'), {
      target: { value: 'test-password' },
    });
    submitLogin();
    await waitFor(() => expect(mocks.setInitialState).toHaveBeenCalledOnce());
    const update = mocks.setInitialState.mock.calls[0][0] as (
      state: object,
    ) => { currentUser: ResourcePermissionUser };
    const state = update({});
    expect(state.currentUser.resourcePermissionEnabled).toBe(
      typeof flag === 'boolean' ? flag : undefined,
    );
    expect(state.currentUser.menus).toEqual(menus);
    expect(mocks.replace).toHaveBeenCalledWith('/sys/organization');
  },
);

it('菜单bootstrap失败不得把登录false身份提交到initialState', async () => {
  mocks.menus.mockRejectedValue(new Error('菜单初始化失败'));
  render(
    <ConfigProvider>
      <App>
        <Login />
      </App>
    </ConfigProvider>,
  );
  fireEvent.change(screen.getByLabelText('请输入账号'), {
    target: { value: 'tester' },
  });
  fireEvent.change(screen.getByLabelText('请输入密码'), {
    target: { value: 'test-password' },
  });
  submitLogin();
  await screen.findByText('菜单初始化失败');
  expect(mocks.setInitialState).not.toHaveBeenCalled();
});
