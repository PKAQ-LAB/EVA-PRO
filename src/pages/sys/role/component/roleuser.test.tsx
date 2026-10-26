import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { expect, it, vi } from 'vitest';
import APIS from '@/apis';
import RoleUserModal from './roleuser';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));

it('真实角色用户弹窗打开与部门筛选均传roleId，回填已授权用户并保持原保存契约', async () => {
  mocks.request.mockImplementation(async (url: string) => {
    const query = new URL(url, 'http://localhost');
    const path = query.pathname;
    if (path === APIS.ORG_LIST) {
      return {
        success: true,
        data: [{ id: 'dept-a', name: '测试部门', frozen: 0 }],
      };
    }
    if (path === APIS.ROLE_LISTUSER) {
      return {
        success: true,
        data: {
          users: [
            { id: '101', name: '原授权用户', account: 'user101' },
            {
              id: '102',
              name: query.searchParams.has('deptId')
                ? '部门候选用户'
                : '候选用户',
              account: 'user102',
            },
          ],
          checkedUser: ['101'],
        },
      };
    }
    return { success: true };
  });
  const close = vi.fn();
  const success = vi.fn();
  render(
    <App>
      <RoleUserModal open roleId="role-a" onClose={close} onSuccess={success} />
    </App>,
  );
  const existingRow = (await screen.findByText('原授权用户')).closest('tr');
  expect(existingRow?.querySelector('input[type="checkbox"]')).toBeChecked();
  fireEvent.click(await screen.findByText('测试部门'));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      `${APIS.ROLE_LISTUSER}?roleId=role-a&deptId=dept-a`,
    ),
  );
  expect(mocks.request).toHaveBeenCalledWith(
    `${APIS.ROLE_LISTUSER}?roleId=role-a`,
  );
  const candidateRow = (await screen.findByText('部门候选用户')).closest('tr');
  const candidate = candidateRow?.querySelector('input[type="checkbox"]');
  if (!candidate) throw new Error('没有找到候选用户选择框');
  fireEvent.click(candidate);
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(APIS.ROLE_SAVEUSER, {
      method: 'POST',
      data: { roleId: 'role-a', userId: ['101', '102'] },
    }),
  );
  expect(close).toHaveBeenCalledTimes(1);
  expect(success).toHaveBeenCalledTimes(1);
});
