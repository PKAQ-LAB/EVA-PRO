import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import { expect, it, vi } from 'vitest';
import access from '@/access';
import APIS from '@/apis';
import RoleList from './rolelist';

const state = vi.hoisted(() => ({
  user: {
    resourcePermissionEnabled: true,
    menus: [
      { id: 'account', routeUrl: '/sys/account', resources: ['grantRole'] },
      { id: 'role', routeUrl: '/sys/role', resources: [] as string[] },
    ],
  },
  request: vi.fn(),
}));
vi.mock('@umijs/max', () => ({
  useAccess: () => access({ currentUser: state.user }),
  useModel: () => ({ initialState: { currentUser: state.user } }),
  request: state.request,
}));
it('账户可选角色不借账户授权打开角色详情，独立role/read后才能只读预览', async () => {
  state.request.mockResolvedValue({
    success: true,
    data: { modules: [], checked: [], checkedResource: {} },
  });
  const content = () => (
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <RoleList roles={[{ id: 'r1', name: '角色甲' }]} />
      </App>
    </ConfigProvider>
  );
  const view = render(content());
  const row = screen.getByText('角色甲').closest('tr');
  if (!row) throw new Error('角色行缺失');
  expect(row.querySelector('input[type="checkbox"]')).not.toBeDisabled();
  fireEvent.doubleClick(row);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(state.request).not.toHaveBeenCalled();
  state.user = {
    ...state.user,
    menus: [
      ...state.user.menus.slice(0, 1),
      { id: 'role', routeUrl: '/sys/role', resources: ['read'] },
    ],
  };
  view.rerender(content());
  const updatedRow = screen.getByText('角色甲').closest('tr');
  if (!updatedRow) throw new Error('角色行缺失');
  fireEvent.doubleClick(updatedRow);
  await waitFor(() =>
    expect(state.request).toHaveBeenCalledWith(
      `${APIS.ROLE_LISTMOUDLE}?roleId=r1`,
    ),
  );
  expect(await screen.findByRole('dialog')).toHaveTextContent(
    '模块权限（只读）',
  );
  state.user = {
    ...state.user,
    menus: state.user.menus.map((menu) => ({ ...menu, resources: [] })),
  };
  view.rerender(content());
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
