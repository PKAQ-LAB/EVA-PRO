import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { App } from 'antd';
import { expect, it, vi } from 'vitest';
import APIS from '@/apis';
import RoleModuleModal from './rolemodule';

const mocks = vi.hoisted(() => ({ list: vi.fn(), post: vi.fn() }));
vi.mock('@/utils/http', () => ({
  default: { list: mocks.list, post: mocks.post },
}));
it('实际授权展示后端全部允许候选，回填checked并只提交资源ID', async () => {
  mocks.list.mockResolvedValue({
    success: true,
    data: {
      modules: [
        {
          id: 'm1',
          name: '模块',
          resources: [
            {
              id: 'r1',
              resourceDesc: '新增',
              resourceType: 'BUTTON',
              checked: 1,
            },
            {
              id: 'r2',
              resourceDesc: '查询',
              resourceType: 'BUTTON',
              checked: 0,
            },
          ],
        },
      ],
      checkedModuleIds: ['m1'],
    },
  });
  mocks.post.mockResolvedValue({ success: true });
  const close = vi.fn();
  render(
    <App>
      <RoleModuleModal
        open
        roleId="role-a"
        onClose={close}
        onSuccess={vi.fn()}
      />
    </App>,
  );
  expect(await screen.findByLabelText('新增')).toBeChecked();
  await act(async () => {});
  expect(screen.getByLabelText('查询')).not.toBeChecked();
  fireEvent.click(screen.getByText('查询'));
  await waitFor(() => expect(screen.getByLabelText('查询')).toBeChecked());
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
  expect(mocks.list).toHaveBeenCalledWith(APIS.ROLE_LISTMOUDLE, {
    roleId: 'role-a',
  });
  expect(mocks.post).toHaveBeenCalledWith(APIS.ROLE_SAVEMODULE, {
    roleId: 'role-a',
    resourceId: ['r1', 'r2'],
  });
  expect(close).toHaveBeenCalledTimes(1);
});

it('名称列为树缩进留宽并保持单行，资源列仍允许换行且表格内部滚动', async () => {
  mocks.list.mockResolvedValue({
    success: true,
    data: {
      modules: [
        {
          id: 'parent',
          name: '系统管理',
          children: [
            {
              id: 'child',
              name: '用于检查树形缩进的长模块名称',
              resources: [
                {
                  id: 'get',
                  resourceDesc: 'GET 查询资源',
                  resourceType: 'GET',
                },
                {
                  id: 'post',
                  resourceDesc: 'POST 编辑资源',
                  resourceType: 'POST',
                },
              ],
            },
          ],
        },
      ],
    },
  });
  render(
    <App>
      <RoleModuleModal
        open
        roleId="role-a"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    </App>,
  );
  const name = await screen.findByRole('cell', {
    name: /用于检查树形缩进的长模块名称/,
  });
  expect(name).toHaveStyle({ whiteSpace: 'nowrap' });
  expect(name.querySelector('.ant-table-row-indent')).toHaveStyle({
    paddingLeft: '15px',
  });
  const table = screen.getByRole('table');
  expect(table.querySelectorAll('col')[1]).toHaveStyle({ width: '260px' });
  expect(table).toHaveStyle({ width: '720px' });
  expect(table.parentElement).toHaveStyle({ overflowX: 'auto' });
  expect(screen.getByRole('dialog')).toHaveStyle({ width: '860px' });
  const resourceCell = screen.getByLabelText('GET 查询资源').closest('td');
  expect(resourceCell?.style.whiteSpace).not.toBe('nowrap');
  expect(screen.getByLabelText('POST 编辑资源')).toBeEnabled();
});
