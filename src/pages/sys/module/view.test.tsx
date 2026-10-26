import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ComponentProps } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import ModuleAOEForm from './aoeform';
import type { ModuleItem } from './data.d';

function footer(dialog: HTMLElement) {
  const node = dialog.querySelector<HTMLElement>(
    '.ant-modal-footer,.ant-drawer-footer',
  );
  if (!node) throw new Error('缺少对话框底部');
  return within(node);
}
function textField(dialog: HTMLElement, label: string) {
  const node = within(dialog)
    .getByText(label, { selector: 'label' })
    .closest('.ant-form-item')
    ?.querySelector<HTMLElement>('.ant-form-item-control');
  if (!node) throw new Error(`缺少字段：${label}`);
  return node;
}
vi.mock('@/appicon', () => ({ default: {} }));

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  check: vi.fn(),
  block: vi.fn(() => vi.fn()),
}));
vi.mock('@umijs/max', () => ({
  history: { block: mocks.block },
  useModel: () => ({
    initialState: { dict: { RESOURCE_TYPE: { GET: '读取' } } },
  }),
  request: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));
vi.mock('@/components', () => ({
  IconSelect: ({ id, value, disabled, onChange }: ComponentProps<'input'>) => (
    <input
      id={id}
      value={value ?? ''}
      disabled={disabled}
      onChange={onChange}
    />
  ),
  TreeSelector: ({
    id,
    value,
    disabled,
    onChange,
  }: ComponentProps<'input'>) => (
    <input
      id={id}
      value={value ?? ''}
      disabled={disabled}
      onChange={onChange}
    />
  ),
}));
vi.mock('./service', () => ({
  editModule: mocks.save,
  checkModuleUnique: mocks.check,
}));
const item: ModuleItem = {
  id: '1234567890123456789',
  name: '现有模块',
  code: 'MODULE_TEST',
  routeUrl: '/sys/module',
  path: '/0/1234567890123456789',
  icon: 'setting',
  status: '0000',
  orders: 1,
  createBy: '真实创建人',
  utcCreate: '2026-10-01 10:00:00',
  resources: [
    {
      id: 'resource-id',
      resourceDesc: '查询资源',
      resourceUrl: '/resource/read',
      resourceType: 'GET',
    },
  ],
};
const close = vi.fn();
function form(
  mode: 'view' | 'edit' | 'create',
  record: Partial<ModuleItem> = item,
  state: { detailsLoading?: boolean; detailsError?: string } = {},
) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <ModuleAOEForm
          operateType={mode}
          currentItem={record}
          data={[]}
          onClose={close}
          onSuccess={vi.fn()}
          {...state}
        />
      </App>
    </ConfigProvider>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.save.mockResolvedValue({ success: true });
  mocks.check.mockResolvedValue({ success: true });
});

it.each([0, 1, 9999] as const)(
  '模块view沿640 Drawer且锁%s仍可读，资源快照不可写',
  async (frozen) => {
    render(form('view', { ...item, frozen }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.parentElement).toHaveStyle({ width: '640px' });
    expect(textField(dialog, '模块名称')).toHaveTextContent('现有模块');
    expect(textField(dialog, '模块图标')).toHaveTextContent('setting');
    expect(textField(dialog, '上级模块')).toHaveTextContent('—');
    expect(textField(dialog, '路由地址')).toHaveTextContent('/sys/module');
    expect(screen.queryByDisplayValue(item.path as string)).toBeNull();
    expect(textField(dialog, '创建人')).toHaveTextContent('真实创建人');
    expect(textField(dialog, '修改人')).toHaveTextContent('—');
    expect(textField(dialog, '修改时间')).toHaveTextContent('—');
    expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(12);
    expect(
      dialog
        .querySelector<HTMLElement>('.eva-view-value-multiline')
        ?.style.getPropertyValue('--eva-view-rows'),
    ).toBe('2');
    expect(
      dialog.querySelector(
        'form,input,textarea,select,[role="combobox"],[role="switch"]',
      ),
    ).toBeNull();
    const labels = Array.from(dialog.querySelectorAll('label')).map(
      (node) => node.textContent,
    );
    expect(labels.slice(labels.indexOf('备注') + 1)).toEqual([
      '创建人',
      '创建时间',
      '修改人',
      '修改时间',
    ]);
    const audit = textField(dialog, '修改时间');
    expect(
      audit.compareDocumentPosition(within(dialog).getByText('资源信息')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText('审计信息')).toBeNull();
    expect(
      screen.queryByRole('button', { name: /保\s*存|新增资源/ }),
    ).toBeNull();
    expect(screen.queryByText('编辑')).toBeNull();
    expect(screen.queryByText('删除')).toBeNull();
    fireEvent.submit(dialog);
    fireEvent.keyDown(dialog, { key: 'Enter' });
    fireEvent.doubleClick(screen.getByText('查询资源'));
    const child = (
      await screen.findByText('资源描述', { selector: 'label' })
    ).closest<HTMLElement>('[role="dialog"]');
    if (!child) throw new Error('缺少资源查看对话框');
    expect(child).toHaveStyle({ width: '500px' });
    expect(textField(child, '资源描述')).toHaveTextContent('查询资源');
    expect(child.querySelectorAll('.eva-view-value')).toHaveLength(3);
    for (const label of ['创建人', '创建时间', '修改人', '修改时间']) {
      expect(
        within(child).queryByText(label, { selector: 'label' }),
      ).toBeNull();
    }
    expect(
      child.querySelector('form,input,textarea,select,[role="combobox"]'),
    ).toBeNull();
    fireEvent.submit(child);
    fireEvent.keyDown(child, { key: 'Enter' });
    fireEvent.click(footer(child).getByRole('button', { name: /关\s*闭/ }));
    await waitFor(() =>
      expect(screen.queryByText('资源描述', { selector: 'label' })).toBeNull(),
    );
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.check).not.toHaveBeenCalled();
    expect(mocks.block).not.toHaveBeenCalled();
    fireEvent.click(footer(dialog).getByRole('button', { name: /关\s*闭/ }));
    expect(close).toHaveBeenCalledOnce();
  },
);

it('view切edit恢复保存，19位ID/routeUrl/resources保留，audit/path不写', async () => {
  const view = render(form('view'));
  view.rerender(form('edit'));
  expect(screen.getByLabelText('模块名称')).toBeEnabled();
  expect(screen.queryByLabelText('创建人')).toBeNull();
  fireEvent.change(screen.getByLabelText('模块名称'), {
    target: { value: '修改模块' },
  });
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  expect(mocks.save.mock.calls[0][0]).toMatchObject({
    id: item.id,
    name: '修改模块',
    routeUrl: item.routeUrl,
    resources: item.resources,
  });
  for (const key of ['createBy', 'modifyBy', 'utcCreate', 'utcModify', 'path'])
    expect(mocks.save.mock.calls[0][0]).not.toHaveProperty(key);
});

it.each(['view', 'edit'] as const)(
  '%s loading/error只在原Drawer内展示且不带旧字段和资源',
  (mode) => {
    const view = render(form(mode, item, { detailsLoading: true }));
    expect(
      screen.getByRole('status', { name: '加载中...' }),
    ).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.ant-skeleton-node')).toBeInTheDocument();
    expect(dialog.querySelector('form,input,textarea,select')).toBeNull();
    expect(dialog).not.toHaveTextContent('—');
    expect(dialog).not.toHaveTextContent('真实创建人');
    expect(
      within(dialog).getByRole('columnheader', { name: '资源描述' }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: /新增资源/ }),
    ).toBeNull();
    expect(screen.queryByLabelText('模块名称')).toBeNull();
    expect(screen.queryByText('查询资源')).toBeNull();
    const labels = Array.from(dialog.querySelectorAll('label')).map(
      (node) => node.textContent,
    );
    const layout = dialog.querySelector('.ant-form');
    view.rerender(
      form(mode, item, { detailsError: '详情读取失败，请关闭后重试' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('详情读取失败');
    expect(screen.getByRole('alert')).toHaveClass('eva-view-notice');
    expect(
      Array.from(dialog.querySelectorAll('label')).map(
        (node) => node.textContent,
      ),
    ).toEqual(labels);
    expect(dialog.querySelector('.ant-form')).toBe(layout);
    expect(
      within(dialog).getByRole('columnheader', { name: '资源描述' }),
    ).toBeInTheDocument();
    expect(dialog.querySelector('tr[data-row-key]')).toBeNull();
    expect(dialog.querySelector('.ant-skeleton-node')).toBeInTheDocument();
    expect(dialog.querySelector('.ant-skeleton-active')).toBeNull();
    expect(dialog.querySelector('[aria-busy="true"]')).toBeNull();
    expect(screen.queryByRole('status', { name: '加载中...' })).toBeNull();
    expect(dialog).not.toHaveTextContent('—');
    expect(dialog).not.toHaveTextContent('真实创建人');
    expect(screen.queryByLabelText('模块名称')).toBeNull();
    expect(screen.queryByText('现有模块')).toBeNull();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    if (mode === 'edit')
      expect(screen.getByRole('button', { name: /保\s*存/ })).toBeDisabled();
    expect(mocks.save).not.toHaveBeenCalled();
  },
);

it.each(['view', 'edit'] as const)(
  '%s骨架保模块栅格与资源表头而不造资源行',
  (mode) => {
    const view = render(form(mode, item, { detailsLoading: true }));
    const dialog = screen.getByRole('dialog');
    const labels = () =>
      Array.from(dialog.querySelectorAll('label')).map((node) =>
        node.textContent?.trim(),
      );
    const pendingLabels = labels();
    expect(
      within(dialog).getByRole('columnheader', { name: '资源路径' }),
    ).toBeInTheDocument();
    expect(dialog.querySelector('tr[data-row-key]')).toBeNull();
    if (mode === 'edit')
      expect(
        within(dialog).queryByText('创建人', { selector: 'label' }),
      ).toBeNull();
    view.rerender(form(mode));
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(labels()).toEqual(pendingLabels);
    expect(dialog.querySelector('.ant-skeleton-node')).toBeNull();
    expect(screen.getByText('查询资源')).toBeInTheDocument();
  },
);

it('edit打开并关闭资源view保留父dirty且没有第二个离开拦截', async () => {
  render(form('edit'));
  fireEvent.change(screen.getByLabelText('模块名称'), {
    target: { value: '未保存模块' },
  });
  const calls = mocks.block.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: /查\s*看/ }));
  const child = (
    await screen.findByText('资源描述', { selector: 'label' })
  ).closest<HTMLElement>('[role="dialog"]');
  if (!child) throw new Error('缺少资源查看对话框');
  fireEvent.click(footer(child).getByRole('button', { name: /关\s*闭/ }));
  await waitFor(() =>
    expect(screen.queryByText('资源描述', { selector: 'label' })).toBeNull(),
  );
  expect(mocks.block.mock.calls.length).toBe(calls);
  expect(screen.getByLabelText('模块名称')).toHaveValue('未保存模块');
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  expect(
    await screen.findByText('放弃未保存的修改？', {
      selector: '.ant-modal-confirm-title',
    }),
  ).toBeInTheDocument();
  expect(close).not.toHaveBeenCalled();
});
