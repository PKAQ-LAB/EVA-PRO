import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import RoleAOEForm, { type RoleAOEFormProps } from './aoeform';
import type { RoleItem } from './data.d';

const mocks = vi.hoisted(() => ({
  request:
    vi.fn<
      (
        url: string,
        options?: { method?: string; data?: Record<string, unknown> },
      ) => Promise<unknown>
    >(),
}));
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  history: { block: () => vi.fn() },
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));
vi.mock('@/components', () => ({
  DictSelector: ({
    id,
    value,
    onChange,
  }: {
    id: string;
    value?: string;
    onChange: (value: string) => void;
  }) => (
    <select
      id={id}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">请选择</option>
      <option value="0001">本部门</option>
      <option value="0003">指定部门</option>
      <option value="0006">指定岗位</option>
    </select>
  ),
}));
const first = '2113857683657629697';
const second = '2113857683657629698';
const posts = [
  { id: first, title: '岗位甲', frozen: 0, children: null },
  { id: second, title: '岗位乙', frozen: 9999, children: null },
];
const departments = [
  {
    id: '100',
    name: '部门父',
    children: [
      { id: '101', name: '部门甲' },
      { id: '102', name: '部门乙' },
    ],
  },
];
const record: Partial<RoleItem> = {
  id: 'role-a',
  name: '测试角色',
  code: 'ROLE_TEST',
  frozen: 0,
  dataScope: '0006',
  dataPostIds: [first],
};
const saves = () =>
  mocks.request.mock.calls.filter(([url]) => url === APIS.ROLE_SAVE);
beforeEach(() => {
  mocks.request.mockReset();
  mocks.request.mockImplementation(async (url) =>
    url === APIS.ORG_LIST
      ? { success: true, data: departments }
      : url === APIS.POST_LIST
        ? { success: true, data: posts }
        : { success: true, data: [] },
  );
});
function show(
  item: Partial<RoleItem> = record,
  mode: RoleAOEFormProps['modalType'] = 'edit',
) {
  const close = vi.fn();
  const content = (currentItem: Partial<RoleItem>, modalType = mode) => (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <RoleAOEForm
          modalType={modalType}
          currentItem={currentItem}
          setModalType={close}
          onSuccess={vi.fn()}
        />
      </App>
    </ConfigProvider>
  );
  const view = render(content(item));
  return {
    ...view,
    close,
    change: (next: Partial<RoleItem>, nextMode = mode) =>
      view.rerender(content(next, nextMode)),
  };
}
it('恢复左右布局切换部门和岗位加宽弹窗，保留表单输入和未保存保护', async () => {
  const view = show({ ...record, dataScope: '0001', dataPostIds: [] });
  const dialog = screen.getByRole('dialog');
  const form = dialog.querySelector('form');
  const name = screen.getByLabelText('角色名称');
  expect(dialog).toHaveStyle({ width: '700px' });
  fireEvent.change(name, { target: { value: '尚未保存的角色' } });
  for (const scope of ['0003', '0006', '0001']) {
    act(() => name.focus());
    fireEvent.change(screen.getByLabelText('数据权限'), {
      target: { value: scope },
    });
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(dialog.querySelector('form')).toBe(form);
    expect(screen.getByLabelText('角色名称')).toBe(name);
    expect(name).toHaveValue('尚未保存的角色');
    await waitFor(() =>
      expect(dialog).toHaveStyle({
        width: scope === '0001' ? '700px' : '1060px',
      }),
    );
    expect(document.activeElement).toBe(name);
  }
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  expect(
    await screen.findByRole('button', { name: '放弃修改' }),
  ).toBeInTheDocument();
  expect(view.close).not.toHaveBeenCalled();
  expect(saves()).toHaveLength(0);
});

it('初始指定部门直接展开且已选部门不渲染标签', async () => {
  show({ ...record, dataScope: '0003', dataOrgIds: ['101'] });
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveStyle({ width: '1060px' });
  await screen.findByText('部门甲');
  expect(dialog.querySelector('.ant-select-selection-item')).toBeNull();
  const treeRow = screen
    .getByText('部门甲')
    .closest('.ant-select-tree-treenode');
  expect(
    treeRow?.querySelector('.ant-select-tree-checkbox-checked'),
  ).not.toBeNull();
});

it('编辑0006自动展开回选，精确多选Long字符串数组不自动选子孙', async () => {
  show();
  expect(screen.getByRole('dialog')).toHaveStyle({ width: '1060px' });
  const region = screen.getByRole('region', { name: '指定岗位' });
  expect(within(region).getByRole('status')).toHaveTextContent('加载中...');
  await within(region).findByText('岗位甲');
  const row = screen.getByText('岗位甲').closest('tr');
  const other = screen.getByText('岗位乙').closest('tr');
  if (!row || !other) throw new Error('岗位行缺失');
  expect(within(row).getByRole('checkbox')).toBeChecked();
  expect(within(other).getByRole('checkbox')).not.toBeChecked();
  fireEvent.click(within(other).getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saves()).toHaveLength(1));
  expect(saves()[0][1]?.data?.dataPostIds).toEqual([first, second]);
});
it('切0006立即展开，空集合禁存，切离清空且0003部门不被替代', async () => {
  show({ ...record, dataScope: '0001', dataPostIds: [] });
  fireEvent.change(screen.getByLabelText('数据权限'), {
    target: { value: '0006' },
  });
  expect(
    await screen.findByRole('region', { name: '指定岗位' }),
  ).toBeInTheDocument();
  await screen.findByText('岗位甲');
  expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
  const row = screen.getByText('岗位甲').closest('tr');
  if (!row) throw new Error('岗位行缺失');
  fireEvent.click(within(row).getByRole('checkbox'));
  fireEvent.change(screen.getByLabelText('数据权限'), {
    target: { value: '0003' },
  });
  await waitFor(() =>
    expect(screen.queryByRole('region', { name: '指定岗位' })).toBeNull(),
  );
  expect(await screen.findByLabelText('选择部门')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saves()).toHaveLength(1));
  expect(saves()[0][1]?.data?.dataPostIds).toEqual([]);
});

it('原0003非空部门切0006保存清空组织且岗位为精确数组', async () => {
  show({ ...record, dataScope: '0003', dataOrgIds: ['123'], dataPostIds: [] });
  fireEvent.change(screen.getByLabelText('数据权限'), {
    target: { value: '0006' },
  });
  await screen.findByText('岗位甲');
  const row = screen.getByText('岗位甲').closest('tr');
  if (!row) throw new Error('岗位行缺失');
  fireEvent.click(within(row).getByRole('checkbox'));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /确\s*定/ })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saves()).toHaveLength(1));
  expect(saves()[0][1]?.data).toMatchObject({
    dataScope: '0006',
    dataOrgIds: '',
    dataPostIds: [first],
  });
});
it('加载失败重试保留勾选，不在候选的已选和冻结1均阻止保存', async () => {
  mocks.request.mockRejectedValueOnce(new Error('failed'));
  show({ ...record, dataPostIds: [first, second] });
  await screen.findByText('岗位列表加载失败，请重试');
  expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
  mocks.request.mockResolvedValue({
    success: true,
    data: [{ ...posts[0], frozen: 1 }],
  });
  fireEvent.click(screen.getByRole('button', { name: '重试岗位' }));
  await screen.findByText(`岗位不可用（${second}）`);
  expect(
    screen.getByText('已选岗位已失效或不可见，请移除后重新选择'),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
  const region = screen.getByRole('region', { name: '指定岗位' });
  expect(
    within(region)
      .getAllByRole('checkbox')
      .filter((input) => (input as HTMLInputElement).checked),
  ).toHaveLength(3);
  expect(saves()).toHaveLength(0);
});
it('查看0006同区域只有真实岗位文本，无勾选控件和写请求', async () => {
  show(record, 'view');
  await screen.findByText('岗位甲');
  const region = screen.getByRole('region', { name: '指定岗位' });
  expect(within(region).queryByRole('checkbox')).toBeNull();
  expect(within(region).queryByText('岗位乙')).toBeNull();
  expect(saves()).toHaveLength(0);
});
it('快速切换角色忽略旧岗位响应，关闭后不恢复旧列表', async () => {
  let finish: (value: unknown) => void = () => {};
  mocks.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const view = show();
  view.change({ ...record, id: 'role-b', dataPostIds: [second] });
  await screen.findByText('岗位乙');
  await act(async () =>
    finish({
      success: true,
      data: [{ id: first, title: '旧角色迟到岗位', frozen: 0 }],
    }),
  );
  expect(screen.queryByText('旧角色迟到岗位')).toBeNull();
  view.change({}, '');
  expect(screen.queryByRole('region', { name: '指定岗位' })).toBeNull();
  expect(saves()).toHaveLength(0);
});
it('岗位修改取消触发未保存确认，不发保存请求', async () => {
  const view = show();
  await screen.findByText('岗位甲');
  const row = screen.getByText('岗位乙').closest('tr');
  if (!row) throw new Error('岗位行缺失');
  fireEvent.click(within(row).getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  fireEvent.click(await screen.findByRole('button', { name: '放弃修改' }));
  expect(view.close).toHaveBeenCalledWith('');
  expect(saves()).toHaveLength(0);
});

it('部门右树默认展开回显单子原ID，查看同位纯文本无勾选', async () => {
  const view = show({ ...record, dataScope: '0003', dataOrgIds: ['101'] });
  const region = screen.getByRole('region', { name: '指定部门' });
  expect(within(region).getByRole('status')).toHaveTextContent('加载中...');
  await within(region).findByText('部门甲');
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /确\s*定/ })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saves()).toHaveLength(1));
  expect(saves()[0][1]?.data).toMatchObject({
    dataScope: '0003',
    dataOrgIds: '101',
    dataPostIds: [],
  });
  view.change({ ...record, dataScope: '0003', dataOrgIds: ['101'] }, 'view');
  const readonly = screen.getByRole('region', { name: '指定部门' });
  await within(readonly).findByText('部门甲');
  expect(
    readonly.querySelector('input,select,[role="checkbox"],[role="tree"]'),
  ).toBeNull();
});

it('部门右树父全选仍按原SHOW_CHILD只保存子ID，树响应不变异', async () => {
  const original = JSON.stringify(departments);
  show({ ...record, dataScope: '0003', dataOrgIds: [] });
  const region = screen.getByRole('region', { name: '指定部门' });
  await within(region).findByText('部门父');
  const tree = region.querySelector('.ant-select-tree');
  if (!tree) throw new Error('部门树未展开');
  const parent = within(tree as HTMLElement)
    .getByText('部门父')
    .closest('.ant-select-tree-treenode');
  const checkbox = parent?.querySelector('.ant-select-tree-checkbox');
  if (!checkbox) throw new Error('部门选择框缺失');
  fireEvent.click(checkbox);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /确\s*定/ })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saves()).toHaveLength(1));
  expect(saves()[0][1]?.data?.dataOrgIds).toBe('101,102');
  expect(JSON.stringify(departments)).toBe(original);
});

it('部门加载失败重试保值，切角色不采纳旧部门树', async () => {
  mocks.request.mockRejectedValueOnce(new Error('failed'));
  const view = show({ ...record, dataScope: '0003', dataOrgIds: ['101'] });
  await screen.findByText('部门列表加载失败，请重试');
  expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '重试部门' }));
  await screen.findByText('部门甲');
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /确\s*定/ })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saves()).toHaveLength(1));
  expect(saves()[0][1]?.data?.dataOrgIds).toBe('101');
  let finish: (value: unknown) => void = () => {};
  mocks.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  view.change({
    ...record,
    id: 'late',
    dataScope: '0003',
    dataOrgIds: ['101'],
  });
  view.change({ ...record, id: 'new', dataScope: '0003', dataOrgIds: ['102'] });
  await screen.findByText('部门乙');
  await act(async () =>
    finish({ success: true, data: [{ id: '999', name: '旧响应部门' }] }),
  );
  expect(screen.queryByText('旧响应部门')).toBeNull();
});

it('部门树单子选择保持精确ID并参与取消草稿保护', async () => {
  const view = show({ ...record, dataScope: '0003', dataOrgIds: [] });
  const region = screen.getByRole('region', { name: '指定部门' });
  await within(region).findByText('部门乙');
  const row = within(region)
    .getByText('部门乙')
    .closest('.ant-select-tree-treenode');
  const checkbox = row?.querySelector('.ant-select-tree-checkbox');
  if (!checkbox) throw new Error('部门选择框缺失');
  fireEvent.click(checkbox);
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  fireEvent.click(await screen.findByRole('button', { name: '继续编辑' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /确\s*定/ })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saves()).toHaveLength(1));
  expect(saves()[0][1]?.data?.dataOrgIds).toBe('102');
  expect(view.close).toHaveBeenCalledTimes(1);
});
