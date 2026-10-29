import { fireEvent, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarDropdown } from './AvatarDropdown';

const mocks = vi.hoisted(() => ({
  clearAuthState: vi.fn(),
  historyReplace: vi.fn(),
  outLogin: vi.fn(),
  setInitialState: vi.fn(),
  historyPush: vi.fn(),
  menu: undefined as
    | {
        items: { key?: string; label?: ReactNode }[];
        onClick: (event: { key: string }) => void;
      }
    | undefined,
}));

vi.mock('@ant-design/icons', () => ({
  LogoutOutlined: () => null,
  SettingOutlined: () => null,
  SkinOutlined: () => null,
}));

vi.mock('@umijs/max', () => ({
  history: {
    replace: mocks.historyReplace,
    push: mocks.historyPush,
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
  default: ({ children, menu }: any) => {
    mocks.menu = menu;
    return (
      <div>
        {menu.items
          .filter((item: { key?: string }) => item.key)
          .map((item: { key: string; label?: ReactNode }) => (
            <button
              key={item.key}
              type="button"
              onClick={() => menu.onClick({ key: item.key })}
            >
              {item.key === 'logout' ? children : item.label}
            </button>
          ))}
      </div>
    );
  },
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

  it('只保留真实菜单，主题设置仍可打开且不发生死链接跳转', () => {
    const view = render(
      <AvatarDropdown>
        <span>账户菜单</span>
      </AvatarDropdown>,
    );
    expect(mocks.menu?.items.map((item) => item.key).filter(Boolean)).toEqual([
      'theme',
      'logout',
    ]);
    expect(view.queryByText('个人设置')).toBeNull();
    fireEvent.click(view.getByRole('button', { name: '主题设置' }));
    const update = mocks.setInitialState.mock.calls[0][0];
    const previous = {
      currentUser: { name: 'Test User' },
      dict: { key: 'value' },
    };
    expect(update(previous)).toEqual({ ...previous, settingDrawerOpen: true });
    expect(mocks.historyPush).not.toHaveBeenCalled();
    expect(mocks.outLogin).not.toHaveBeenCalled();
  });

  it('旧settings事件也不再跳转不存在页面', () => {
    render(
      <AvatarDropdown>
        <span>账户菜单</span>
      </AvatarDropdown>,
    );
    mocks.menu?.onClick({ key: 'settings' });
    expect(mocks.historyPush).not.toHaveBeenCalled();
    expect(mocks.setInitialState).not.toHaveBeenCalled();
    expect(mocks.outLogin).not.toHaveBeenCalled();
  });
});
