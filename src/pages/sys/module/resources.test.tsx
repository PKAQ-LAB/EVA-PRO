import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from 'antd';
import { expect, it, vi } from 'vitest';
import ModuleLineAOEForm from './lineaoeform';
import ModuleLineList from './linelist';

vi.mock('@umijs/max', () => ({
  useModel: () => ({
    initialState: {
      dict: {
        RESOURCE_TYPE: {
          '*': '全部',
          GET: 'GET',
          POST: 'POST',
          PUT: 'PUT',
          DELETE: 'DELETE',
          PATCH: 'PATCH',
        },
      },
    },
  }),
}));
it('资源空列表不自动创建授权，只有普通新增入口且沿现有HTTP字典/路径配置', async () => {
  const setLines = vi.fn();
  render(
    <App>
      <ModuleLineList lines={[]} setLines={setLines} />
    </App>,
  );
  expect(setLines).not.toHaveBeenCalled();
  expect(
    screen.queryByRole('button', { name: '新增按钮资源' }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /新增资源/u }));
  await waitFor(() =>
    expect(screen.getByText('资源路径', { selector: 'label' })).toHaveClass(
      'ant-form-item-required',
    ),
  );
  expect(screen.queryByLabelText('资源编码')).not.toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(
    await screen.findByRole('option', { name: 'POST' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('option', { name: '按钮' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('option', { name: '操作' }),
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('资源描述'), {
    target: { value: '新增' },
  });
  fireEvent.change(screen.getByLabelText('资源路径'), {
    target: { value: '/sys/module/edit' },
  });
  fireEvent.click(screen.getByRole('button', { name: /提\s*交/ }));
  await waitFor(() => expect(setLines).toHaveBeenCalledTimes(1));
  expect(setLines.mock.calls[0][0]).toEqual([
    expect.objectContaining({
      resourceDesc: '新增',
      resourceType: 'GET',
      resourceUrl: '/sys/module/edit',
    }),
  ]);
});
it('编辑资源保留ID/归属/排序且不修改原对象，同路径不同HTTP类型可配置', async () => {
  const original = {
    id: 'r1',
    mainId: 'm1',
    sort: 3,
    code: 'QUERY',
    resourceDesc: '查询',
    resourceUrl: '/sys/module/list',
    resourceType: 'GET',
  };
  const lines = [
    original,
    {
      code: 'SAVE',
      resourceDesc: '保存',
      resourceUrl: '/sys/module/list',
      resourceType: 'POST',
    },
  ];
  const setLines = vi.fn();
  render(
    <App>
      <ModuleLineAOEForm
        resourceTypeDict={{ GET: 'GET', POST: 'POST' }}
        modalType="edit"
        setModalType={vi.fn()}
        lines={lines}
        setLines={setLines}
        editIndex={0}
        setEditIndex={vi.fn()}
      />
    </App>,
  );
  fireEvent.change(screen.getByLabelText('资源描述'), {
    target: { value: '读取' },
  });
  fireEvent.click(screen.getByRole('button', { name: /提\s*交/ }));
  await waitFor(() => expect(setLines).toHaveBeenCalledTimes(1));
  expect(setLines.mock.calls[0][0][0]).toMatchObject({
    id: 'r1',
    mainId: 'm1',
    sort: 3,
    resourceDesc: '读取',
  });
  expect(original.resourceDesc).toBe('查询');
});
it('普通HTTP资源仍通过真实确认删除且保留未删除记录的ID', async () => {
  const lines = [
    {
      id: 'r1',
      mainId: 'm1',
      resourceDesc: '查询',
      resourceType: 'GET',
      resourceUrl: '/sys/module/list',
    },
    {
      id: 'r2',
      mainId: 'm1',
      resourceDesc: '保存',
      resourceType: 'POST',
      resourceUrl: '/sys/module/edit',
    },
  ];
  const setLines = vi.fn();
  render(
    <App>
      <ModuleLineList lines={lines} setLines={setLines} />
    </App>,
  );
  fireEvent.click(screen.getAllByText('删除')[0]);
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: /确\s*定/u }));
  await waitFor(() => expect(setLines).toHaveBeenCalledWith([lines[1]]));
  expect(lines).toHaveLength(2);
  expect(lines[1].id).toBe('r2');
});
