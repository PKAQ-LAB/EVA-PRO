import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, it, vi } from 'vitest';
import OrgAOEForm from './aoeform';
import type { OrgItem } from './data.d';

function footer(dialog: HTMLElement) {
  const node = dialog.querySelector<HTMLElement>('.ant-modal-footer');
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

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  check: vi.fn(),
  block: vi.fn(() => vi.fn()),
}));
vi.mock('@umijs/max', () => ({ history: { block: mocks.block } }));
vi.mock('./service', () => ({
  editOrg: mocks.save,
  checkOrgUnique: mocks.check,
}));
const item: OrgItem = {
  id: '1234567890123456789',
  name: '现有部门',
  code: 'ORG_TEST',
  status: '0001',
  parentId: 'parent',
  orders: 1,
  createBy: '真实创建人',
  utcCreate: '2026-10-01 10:00:00',
};
const close = vi.fn();
function form(
  mode: 'view' | 'edit' | 'create',
  record: Partial<OrgItem> = item,
  state: { detailsLoading?: boolean; detailsError?: string } = {},
) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <OrgAOEForm
          canRequest={() => true}
          operateType={mode}
          currentItem={record}
          data={[{ id: 'parent', name: '父部门', children: [item] }]}
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
  '组织view沿原700 Modal与字段布局，锁%s可读且全部禁写',
  (frozen) => {
    render(form('view', { ...item, frozen }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ width: '700px' });
    expect(textField(dialog, '部门名称')).toHaveTextContent('现有部门');
    expect(textField(dialog, '上级部门')).toHaveTextContent('父部门');
    expect(textField(dialog, '创建人')).toHaveTextContent('真实创建人');
    expect(textField(dialog, '修改人')).toHaveTextContent('—');
    expect(textField(dialog, '修改时间')).toHaveTextContent('—');
    expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(10);
    expect(
      dialog.querySelector('.eva-view-value-multiline'),
    ).toBeInTheDocument();
    expect(
      dialog.querySelector(
        'form,input,textarea,select,[role="combobox"],[role="switch"]',
      ),
    ).toBeNull();
    expect(screen.queryByText('审计信息')).toBeNull();
    expect(
      within(dialog).queryByRole('button', { name: /确\s*定|保\s*存/ }),
    ).toBeNull();
    fireEvent.submit(dialog);
    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.check).not.toHaveBeenCalled();
    expect(mocks.block).not.toHaveBeenCalled();
    fireEvent.click(footer(dialog).getByRole('button', { name: /关\s*闭/ }));
    expect(close).toHaveBeenCalledOnce();
  },
);

it('view切edit恢复字段和保存，真19位ID保留且审计不写', async () => {
  const view = render(form('view'));
  view.rerender(form('edit'));
  expect(screen.getByLabelText('部门名称')).toBeEnabled();
  expect(screen.queryByLabelText('创建人')).toBeNull();
  fireEvent.change(screen.getByLabelText('部门名称'), {
    target: { value: '修改部门' },
  });
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  expect(mocks.save.mock.calls[0][0]).toMatchObject({
    id: item.id,
    name: '修改部门',
    status: '0001',
    parentId: 'parent',
  });
  for (const key of ['createBy', 'modifyBy', 'utcCreate', 'utcModify'])
    expect(mocks.save.mock.calls[0][0]).not.toHaveProperty(key);
});

it.each(['view', 'edit'] as const)(
  '%s loading/error均原Modal内展示且不沿用旧记录',
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
    expect(screen.queryByLabelText('部门名称')).toBeNull();
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
    expect(dialog.querySelector('.ant-skeleton-node')).toBeInTheDocument();
    expect(dialog.querySelector('.ant-skeleton-active')).toBeNull();
    expect(dialog.querySelector('[aria-busy="true"]')).toBeNull();
    expect(screen.queryByRole('status', { name: '加载中...' })).toBeNull();
    expect(dialog).not.toHaveTextContent('—');
    expect(dialog).not.toHaveTextContent('真实创建人');
    expect(screen.queryByLabelText('部门名称')).toBeNull();
    expect(screen.queryByText('现有部门')).toBeNull();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    if (mode === 'edit')
      expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
    expect(mocks.save).not.toHaveBeenCalled();
  },
);

it.each(['view', 'edit'] as const)(
  '%s骨架保原单列与双列标签及四行备注位置',
  (mode) => {
    const view = render(form(mode, item, { detailsLoading: true }));
    const dialog = screen.getByRole('dialog');
    const labels = () =>
      Array.from(dialog.querySelectorAll('label')).map((node) =>
        node.textContent?.trim(),
      );
    const pendingLabels = labels();
    expect(
      dialog.querySelector('.eva-view-value-multiline'),
    ).toBeInTheDocument();
    if (mode === 'edit')
      expect(
        within(dialog).queryByText('创建人', { selector: 'label' }),
      ).toBeNull();
    view.rerender(form(mode));
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(labels()).toEqual(pendingLabels);
    expect(dialog.querySelector('.ant-skeleton-node')).toBeNull();
    if (mode === 'view')
      expect(textField(dialog, '部门名称')).toHaveTextContent('现有部门');
    else expect(screen.getByLabelText('部门名称')).toHaveValue('现有部门');
  },
);

it('edit未保存关闭需确认，取消放弃不丢输入', async () => {
  render(form('edit'));
  fireEvent.change(screen.getByLabelText('部门名称'), {
    target: { value: '未保存部门' },
  });
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  expect(
    await screen.findByText('放弃未保存的修改？', {
      selector: '.ant-modal-confirm-title',
    }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));
  expect(screen.getByLabelText('部门名称')).toHaveValue('未保存部门');
  expect(close).not.toHaveBeenCalled();
});
