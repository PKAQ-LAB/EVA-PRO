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
import RoleAOEForm from './aoeform';
import type { RoleItem } from './data.d';

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
  queryOrgs: vi.fn(),
}));
vi.mock('@umijs/max', () => ({
  history: { block: mocks.block },
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));
vi.mock('@/components', () => ({
  DictSelector: ({
    id,
    value,
    disabled,
  }: {
    id?: string;
    value?: string;
    disabled?: boolean;
  }) => <input id={id} value={value ?? ''} disabled={disabled} readOnly />,
}));
vi.mock('../organization/service', () => ({
  queryOrgs: mocks.queryOrgs,
}));
vi.mock('./service', () => ({
  saveRole: mocks.save,
  checkRoleUnique: mocks.check,
}));

const item: RoleItem = {
  id: '1234567890123456789',
  name: '现有角色',
  code: 'ROLE_TEST',
  dataScope: '0001',
  createBy: '真实创建人',
  utcCreate: '2026-10-01 10:00:00',
};
const close = vi.fn();
function form(
  mode: 'view' | 'edit' | 'create',
  record: Partial<RoleItem> = item,
  state: { detailsLoading?: boolean; detailsError?: string } = {},
) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <RoleAOEForm
          modalType={mode}
          currentItem={record}
          setModalType={close}
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
  mocks.queryOrgs.mockResolvedValue({ success: true, data: [] });
});

it.each([0, 1, 9999] as const)(
  '角色view沿AOE700布局，锁%s仍可读，审计真值缺—且无提交',
  async (frozen) => {
    render(form('view', { ...item, frozen }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ width: '700px' });
    expect(textField(dialog, '角色名称')).toHaveTextContent('现有角色');
    expect(textField(dialog, '创建人')).toHaveTextContent('真实创建人');
    expect(textField(dialog, '创建时间')).toHaveTextContent(
      item.utcCreate ?? '',
    );
    expect(textField(dialog, '修改人')).toHaveTextContent('—');
    expect(textField(dialog, '修改时间')).toHaveTextContent('—');
    expect(textField(dialog, '数据权限')).toHaveTextContent('0001');
    expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(9);
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
    expect(close).toHaveBeenCalledWith('');
  },
);

it('view切edit恢复输入保存，19位ID不转数字，四审计不混载荷', async () => {
  const view = render(form('view'));
  view.rerender(form('edit'));
  expect(screen.getByLabelText('角色名称')).toBeEnabled();
  expect(screen.queryByLabelText('创建人')).toBeNull();
  fireEvent.change(screen.getByLabelText('角色名称'), {
    target: { value: '修改角色' },
  });
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  expect(mocks.save.mock.calls[0][0]).toMatchObject({
    id: item.id,
    name: '修改角色',
    dataScope: '0001',
  });
  for (const key of ['createBy', 'modifyBy', 'utcCreate', 'utcModify'])
    expect(mocks.save.mock.calls[0][0]).not.toHaveProperty(key);
});

it.each(['view', 'edit'] as const)(
  '%s loading/error仅在原Modal内反馈，不泄漏上一记录或允许保存',
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
    expect(screen.queryByText('现有角色')).toBeNull();
    expect(screen.queryByLabelText('角色名称')).toBeNull();
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
    expect(dialog).not.toHaveTextContent('现有角色');
    expect(screen.queryByLabelText('角色名称')).toBeNull();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    if (mode === 'edit')
      expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
    expect(mocks.save).not.toHaveBeenCalled();
  },
);

it.each(['view', 'edit'] as const)(
  '%s首帧标签栅格与ready一致，数据只替换骨架',
  (mode) => {
    const view = render(form(mode, item, { detailsLoading: true }));
    const dialog = screen.getByRole('dialog');
    const labels = () =>
      Array.from(dialog.querySelectorAll('label')).map((node) =>
        node.textContent?.trim(),
      );
    const pendingLabels = labels();
    expect(
      dialog.querySelectorAll('.ant-row')[0]?.querySelectorAll('.ant-col-12'),
    ).toHaveLength(2);
    if (mode === 'edit')
      expect(
        within(dialog).queryByText('创建人', { selector: 'label' }),
      ).toBeNull();
    view.rerender(form(mode));
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(labels()).toEqual(pendingLabels);
    expect(dialog.querySelector('.ant-skeleton-node')).toBeNull();
    if (mode === 'view')
      expect(textField(dialog, '角色名称')).toHaveTextContent('现有角色');
    else expect(screen.getByLabelText('角色名称')).toHaveValue('现有角色');
  },
);

it('edit脏关闭需放弃确认，取消确认保留输入', async () => {
  render(form('edit'));
  fireEvent.change(screen.getByLabelText('角色名称'), {
    target: { value: '未保存角色' },
  });
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  expect(
    await screen.findByText('放弃未保存的修改？', {
      selector: '.ant-modal-confirm-title',
    }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));
  expect(screen.getByLabelText('角色名称')).toHaveValue('未保存角色');
  expect(close).not.toHaveBeenCalled();
});

it('CUSTOM实际详情返回前中性区域已存在，返回后同区域显示部门而不补挂整行', async () => {
  mocks.queryOrgs.mockResolvedValue({
    success: true,
    data: [{ id: 'org-a', name: '授权部门' }],
  });
  const view = render(form('view', { id: item.id }, { detailsLoading: true }));
  const dialog = screen.getByRole('dialog');
  const region = dialog.querySelector<HTMLElement>(
    '[data-role-department-region]',
  );
  if (!region) throw new Error('缺少条件布局区域');
  const minimum = region.style.minHeight;
  expect(minimum).toBe(
    'calc(var(--ant-control-height, 32px) + var(--ant-margin-lg, 24px))',
  );
  expect(region.querySelector('.ant-skeleton-node')).toBeInTheDocument();
  expect(region.textContent).toBe('');
  expect(
    within(dialog).queryByText('选择部门', { selector: 'label' }),
  ).toBeNull();
  expect(dialog).not.toHaveTextContent('—');
  expect(mocks.queryOrgs).not.toHaveBeenCalled();
  view.rerender(
    form('view', { ...item, dataScope: '0003', dataOrgIds: ['org-a'] }),
  );
  await waitFor(() =>
    expect(textField(dialog, '选择部门')).toHaveTextContent('授权部门'),
  );
  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(dialog.querySelector('[data-role-department-region]')).toBe(region);
  expect(region.style.minHeight).toBe(minimum);
  expect(region.querySelector('.ant-skeleton-node')).toBeNull();
  expect(region).not.toHaveAttribute('aria-hidden', 'true');
  expect(mocks.queryOrgs).toHaveBeenCalledOnce();
  expect(
    dialog.querySelector('form,input,textarea,select,[role="combobox"]'),
  ).toBeNull();
  fireEvent.keyDown(dialog, { key: 'Enter' });
  expect(mocks.save).not.toHaveBeenCalled();
  expect(mocks.check).not.toHaveBeenCalled();
});

it.each([undefined, '0001', ''])(
  '真实scope%s不适用时区域仍保几何，不伪造部门字段和值',
  (dataScope) => {
    const view = render(
      form('view', { id: item.id }, { detailsLoading: true }),
    );
    const dialog = screen.getByRole('dialog');
    const region = dialog.querySelector<HTMLElement>(
      '[data-role-department-region]',
    );
    if (!region) throw new Error('缺少条件布局区域');
    const minimum = region.style.minHeight;
    view.rerender(form('view', { ...item, dataScope }));
    expect(dialog.querySelector('[data-role-department-region]')).toBe(region);
    expect(region.style.minHeight).toBe(minimum);
    expect(region).toHaveAttribute('aria-hidden', 'true');
    expect(region).toBeEmptyDOMElement();
    expect(
      within(dialog).queryByText('选择部门', { selector: 'label' }),
    ).toBeNull();
    expect(mocks.queryOrgs).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
  },
);
