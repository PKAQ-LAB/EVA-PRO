import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarDropdown } from './AvatarDropdown';

const mocks = vi.hoisted(() => ({
  clearAuthState: vi.fn(),
  historyReplace: vi.fn(),
  outLogin: vi.fn(),
  setInitialState: vi.fn(),
}));

vi.mock('@ant-design/icons', () => ({
  LogoutOutlined: () => null,
  SettingOutlined: () => null,
  SkinOutlined: () => null,
}));

vi.mock('@umijs/max', () => ({
  history: {
    replace: mocks.historyReplace,
  },
  useModel: () => ({
    initialState: {
      currentUser: { name: 'Test User' },
    },
    setInitialState: mocks.setInitialState,
  }),
}));

vi.mock('antd', () => ({
  Spin: () => null,
}));

vi.mock('@/services/auth', () => ({
  outLogin: mocks.outLogin,
}));

vi.mock('@/utils/authState', () => ({
  clearAuthState: mocks.clearAuthState,
}));

vi.mock('../HeaderDropdown', () => ({
  default: ({ children, menu }: any) => (
    <button type="button" onClick={() => menu.onClick({ key: 'logout' })}>
      {children}
    </button>
  ),
}));

describe('AvatarDropdown logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/dashboard?tab=active');
  });

  it('clears local auth state and redirects when server logout rejects', async () => {
    mocks.outLogin.mockRejectedValue(new Error('server logout failed'));

    const { getByRole } = render(
      <AvatarDropdown>
        <span>账户菜单</span>
      </AvatarDropdown>,
    );

    fireEvent.click(getByRole('button', { name: '账户菜单' }));

    await waitFor(() => {
      expect(mocks.outLogin).toHaveBeenCalledWith({
        skipErrorHandler: true,
      });
      expect(mocks.clearAuthState).toHaveBeenCalledTimes(1);
      expect(mocks.historyReplace).toHaveBeenCalledWith({
        pathname: '/user/login',
        search: 'redirect=%2Fdashboard%3Ftab%3Dactive',
      });
    });
  });
});
