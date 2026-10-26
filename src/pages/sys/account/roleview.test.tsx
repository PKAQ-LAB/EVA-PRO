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
import AOEForm from './aoeform';
import type { AccountItem } from './data.d';

const mocks = vi.hoisted(() => ({ request: vi.fn(), close: vi.fn() }));
vi.mock('@umijs/max', async () => {
  const { createHistory } = await import('@@/core/history');
  return {
    request: mocks.request,
    history: createHistory({
      type: 'memory',
      initialEntries: ['/sys/account'],
    }),
  };
});
vi.mock('@/components', () => ({
  TreeSelector: ({
    id,
    value = '',
    onChange,
  }: {
    id?: string;
    value?: string;
    onChange?: (value: string) => void;
  }) => (
    <input
      id={id}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));
const roles = [
  { id: '101', name: '角色甲' },
  { id: '102', name: '角色乙' },
];
const account: AccountItem = {
  id: '10',
  account: 'user10',
  name: '测试用户',
  tel: '13800000000',
  email: 'user@example.com',
  deptId: '1',
  locked: '0001',
  frozen: 1,
  roles: [{ id: '101' }],
};
const permission = {
  success: true,
  data: {
    modules: [
      {
        id: '20',
        name: '结构父目录',
        children: [
          {
            id: '21',
            name: '已授权模块',
            resources: [
              { id: '211', resourceDesc: '已授权查询', checked: 1 },
              { id: '212', resourceDesc: '未授予删除', checked: 0 },
            ],
          },
          {
            id: '22',
            name: '仅可选模块',
            resources: [{ id: '221', resourceDesc: '未授予候选', checked: 0 }],
          },
        ],
      },
    ],
    checkedModuleIds: ['21'],
  },
};
function treeRequest() {
  return mocks.request.mock.calls.filter(([url]) =>
    String(url).startsWith(APIS.ROLE_LISTMOUDLE),
  );
}
function writes() {
  return mocks.request.mock.calls.filter(
    ([, options]) => options?.method === 'POST',
  );
}
function content(
  item = account,
  list = roles,
  mode: 'edit' | 'create' = 'edit',
) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <AOEForm
          operateType={mode}
          currentItem={mode === 'create' ? null : item}
          roles={list}
          orgs={[]}
          onClose={mocks.close}
          onSuccess={vi.fn()}
        />
      </App>
    </ConfigProvider>
  );
}
const roleRow = (name = '角色甲') =>
  screen.getByText(name, { selector: 'span' }).closest('tr') as HTMLElement;
// rc util在test环境固定useId；通过独立关闭按钮定位嵌套dialog，避免同名ARIA引用夹具冲突。
const previewDialog = () =>
  screen
    .getByRole('button', { name: '关闭权限查看' })
    .closest('[role=dialog]') as HTMLElement;
const preview = () => within(previewDialog());
function deferred() {
  let resolve!: (value: unknown) => void;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it('权限查看加载和失败保留原表头与容器，不把占位当授权或成功空', async () => {
  const load = deferred();
  mocks.request.mockReturnValueOnce(load.promise);
  render(content());
  fireEvent.doubleClick(roleRow());
  const dialog = previewDialog();
  const table = dialog.querySelector('table');
  expect(table).not.toBeNull();
  expect(
    preview().getByRole('columnheader', { name: '模块名称' }),
  ).toBeInTheDocument();
  expect(
    preview().getByRole('columnheader', { name: '授权情况' }),
  ).toBeInTheDocument();
  expect(
    preview().getByRole('columnheader', { name: '已授予资源' }),
  ).toBeInTheDocument();
  expect(dialog.querySelector('.ant-skeleton')).not.toBeNull();
  expect(preview().queryByText('已授权模块')).toBeNull();
  expect(preview().queryByText('暂无已授予模块权限')).toBeNull();
  await act(async () => load.resolve({ success: false }));
  expect(previewDialog()).toBe(dialog);
  expect(dialog.querySelector('table')).toBe(table);
  expect(preview().getByRole('alert')).toHaveClass('eva-view-notice');
  expect(preview().queryByText('暂无已授予模块权限')).toBeNull();
  expect(dialog.querySelector('input,textarea,select,form')).toBeNull();
  expect(writes()).toHaveLength(0);
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.request.mockReset();
  mocks.request.mockImplementation(async (url: string) =>
    String(url).startsWith(APIS.ROLE_LISTMOUDLE)
      ? permission
      : { success: true },
  );
});

it.each(['create', 'edit'] as const)(
  '%s角色行双击只读已有授权及父结构，Enter/关闭不写，保留勾选和账号dirty',
  async (mode) => {
    render(content(account, roles, mode));
    if (mode === 'create')
      fireEvent.click(screen.getByRole('checkbox', { name: '授权角色角色甲' }));
    fireEvent.change(screen.getByLabelText('姓名'), {
      target: { value: '未保存姓名' },
    });
    fireEvent.doubleClick(roleRow());
    expect(await preview().findByText('已授权模块')).toBeInTheDocument();
    expect(preview().getByText('结构父目录')).toBeInTheDocument();
    expect(preview().getByText('已授权查询')).toBeInTheDocument();
    expect(preview().queryByText('仅可选模块')).toBeNull();
    expect(preview().queryByText('未授予删除')).toBeNull();
    const table = previewDialog().querySelector('table');
    fireEvent.click(preview().getByRole('button', { name: '关闭行' }));
    expect(preview().queryByText('已授权模块')).toBeNull();
    expect(preview().getByText('结构父目录')).toBeInTheDocument();
    const parentRow = preview().getByText('结构父目录').closest('tr');
    expect(parentRow).not.toBeNull();
    fireEvent.click(
      within(parentRow as HTMLElement).getByRole('button', { name: '展开行' }),
    );
    expect(preview().getByText('已授权模块')).toBeInTheDocument();
    expect(preview().getByText('已授权查询')).toBeInTheDocument();
    expect(previewDialog().querySelector('table')).toBe(table);
    expect(preview().queryAllByRole('checkbox')).toHaveLength(0);
    expect(
      preview().queryByRole('button', { name: /保存|确定|授权/ }),
    ).toBeNull();
    fireEvent.keyDown(previewDialog(), {
      key: 'Enter',
      code: 'Enter',
    });
    expect(treeRequest()).toHaveLength(1);
    expect(writes()).toHaveLength(0);
    expect(treeRequest()[0][0]).toBe(`${APIS.ROLE_LISTMOUDLE}?roleId=101`);
    fireEvent.click(preview().getByRole('button', { name: '关闭权限查看' }));
    expect(screen.getByLabelText('姓名')).toHaveValue('未保存姓名');
    expect(
      screen.getByRole('checkbox', { name: '授权角色角色甲' }),
    ).toBeChecked();
    expect(mocks.close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
    expect(
      await screen.findByText('放弃未保存的修改？', {
        selector: '.ant-modal-confirm-title',
      }),
    ).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  },
);

it('无查看列，checkbox按键不查看，聚焦行Enter单次读取且不改角色', async () => {
  render(content());
  const checkbox = screen.getByRole('checkbox', { name: '授权角色角色乙' });
  fireEvent.click(checkbox);
  fireEvent.doubleClick(checkbox);
  fireEvent.keyDown(checkbox, { key: 'Enter' });
  expect(checkbox).toBeChecked();
  expect(treeRequest()).toHaveLength(0);
  fireEvent.click(roleRow());
  expect(treeRequest()).toHaveLength(0);
  expect(screen.queryByRole('columnheader', { name: '查看' })).toBeNull();
  expect(within(roleRow()).queryByRole('button', { name: '查看' })).toBeNull();
  fireEvent.keyDown(roleRow(), { key: 'Enter' });
  fireEvent.keyDown(roleRow(), { key: 'Enter', repeat: true });
  expect(await preview().findByText('已授权查询')).toBeInTheDocument();
  expect(
    preview().queryByText('仅显示当前身份可读取的已授予权限。'),
  ).toBeNull();
  expect(treeRequest()).toHaveLength(1);
  expect(writes()).toHaveLength(0);
});

it('角色行双击单次读取，查看关闭后原账号保存roleIds和锁定保持', async () => {
  render(content());
  fireEvent.doubleClick(roleRow('角色乙'));
  expect(await preview().findByText('已授权查询')).toBeInTheDocument();
  expect(treeRequest()).toHaveLength(1);
  expect(treeRequest()[0][0]).toBe(`${APIS.ROLE_LISTMOUDLE}?roleId=102`);
  fireEvent.click(preview().getByRole('button', { name: '关闭权限查看' }));
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][0]).toBe(APIS.ACCOUNT_EDIT);
  expect(writes()[0][1].data).toMatchObject({ roleIds: ['101'], frozen: 1 });
  expect(writes()[0][1].data.password).toBeUndefined();
  expect(
    mocks.request.mock.calls.some(([url]) => url === APIS.ROLE_SAVEMODULE),
  ).toBe(false);
});

it.each([
  {
    error: Object.assign(new Error('SECRET_FORBIDDEN'), {
      response: { status: 403 },
    }),
    text: '无权限查看此角色模块权限',
  },
  { error: new Error('SECRET_NETWORK'), text: '模块权限加载失败，请稍后重试' },
  {
    response: { success: false, message: 'SECRET_BIZ' },
    text: '模块权限加载失败，请稍后重试',
  },
  {
    response: { success: true, data: { modules: [], checkedModuleIds: [] } },
    text: '暂无已授予模块权限',
  },
])(
  '权限/失败/空有明确状态且不泄漏错误或提交：$text',
  async ({ error, response, text }) => {
    if (error) mocks.request.mockRejectedValue(error);
    else mocks.request.mockResolvedValue(response);
    render(content());
    fireEvent.doubleClick(roleRow());
    expect(await preview().findByText(text)).toBeInTheDocument();
    expect(preview().queryByText(/SECRET_/)).toBeNull();
    expect(writes()).toHaveLength(0);
  },
);

it('关闭和切account忽略旧响应，重新打开按当前role读取', async () => {
  const old = deferred();
  mocks.request.mockReturnValueOnce(old.promise);
  const view = render(content());
  fireEvent.doubleClick(roleRow());
  await waitFor(() =>
    expect(preview().getByText('加载中...')).toBeInTheDocument(),
  );
  view.rerender(content({ ...account, id: '11', name: '另一用户', roles: [] }));
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: '关闭权限查看' })).toBeNull(),
  );
  await act(async () =>
    old.resolve({
      success: true,
      data: {
        modules: [{ id: '99', name: '旧响应', resources: [] }],
        checkedModuleIds: ['99'],
      },
    }),
  );
  expect(screen.queryByText('旧响应')).toBeNull();
  fireEvent.doubleClick(roleRow('角色乙'));
  expect(await preview().findByText('已授权查询')).toBeInTheDocument();
  expect(treeRequest()).toHaveLength(2);
  expect(writes()).toHaveLength(0);
  expect(
    screen.getByRole('checkbox', { name: '授权角色角色甲' }),
  ).not.toBeChecked();
});

it('关闭加载中的甲再查看乙，甲的迟到响应不覆盖乙或更改角色勾选', async () => {
  const old = deferred();
  mocks.request.mockReturnValueOnce(old.promise);
  render(content());
  fireEvent.doubleClick(roleRow());
  await waitFor(() =>
    expect(preview().getByText('加载中...')).toBeInTheDocument(),
  );
  fireEvent.click(preview().getByRole('button', { name: '关闭权限查看' }));
  fireEvent.doubleClick(roleRow('角色乙'));
  expect(await preview().findByText('已授权模块')).toBeInTheDocument();
  await act(async () =>
    old.resolve({
      success: true,
      data: {
        modules: [{ id: '99', name: '旧角色权限' }],
        checkedModuleIds: ['99'],
      },
    }),
  );
  expect(preview().queryByText('旧角色权限')).toBeNull();
  expect(treeRequest()).toHaveLength(2);
  expect(writes()).toHaveLength(0);
  expect(
    screen.getByRole('checkbox', { name: '授权角色角色甲' }),
  ).toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: '授权角色角色乙' }),
  ).not.toBeChecked();
});

it('长名称悬停全文、无查看列，Tooltip门户双击不触发读取', async () => {
  const name = '很长的角色名称'.repeat(25);
  render(content(account, [{ id: '101', name }]));
  const text = screen.getByText(name, { selector: 'span' });
  fireEvent.mouseEnter(text);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent(name);
  fireEvent.doubleClick(tooltip);
  expect(treeRequest()).toHaveLength(0);
  expect(screen.queryByRole('columnheader', { name: '查看' })).toBeNull();
  expect((text.closest('tr') as HTMLElement).tabIndex).toBe(0);
});

it('新增表单校验失败保留布局伸展策略，阻止账号和授权保存', async () => {
  render(content(account, roles, 'create'));
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() =>
    expect(screen.getByLabelText('姓名')).toHaveAttribute(
      'aria-invalid',
      'true',
    ),
  );
  const region = screen.getByRole('region', { name: '用户角色' });
  expect(
    window.getComputedStyle(region.parentElement as HTMLElement).alignItems,
  ).toBe('stretch');
  expect(
    window.getComputedStyle(
      screen.getByLabelText('备注').closest('.ant-form-item') as HTMLElement,
    ).marginBottom,
  ).toBe('0px');
  expect(
    mocks.request.mock.calls.some(
      ([url]) => url === APIS.ACCOUNT_EDIT || url === APIS.ROLE_SAVEMODULE,
    ),
  ).toBe(false);
});

it.each(
  (['create', 'edit'] as const).flatMap((mode) =>
    [0, 1, 30].map((count) => ({ mode, count })),
  ),
)(
  '$mode角色数$count保持外框伸展与末项零尾距，不撑高行或硬算总高度',
  ({ mode, count }) => {
    const list = Array.from({ length: count }, (_, index) => ({
      id: String(index + 100),
      name: `角色${index}`,
    }));
    render(content(account, list, mode));
    const remark = screen
      .getByLabelText('备注')
      .closest('.ant-form-item') as HTMLElement;
    expect(window.getComputedStyle(remark).marginBottom).toBe('0px');
    const region = screen.getByRole('region', { name: '用户角色' });
    expect(
      window.getComputedStyle(region.parentElement as HTMLElement).alignItems,
    ).toBe('stretch');
    expect(
      window.getComputedStyle(
        region.querySelector('.ant-table-wrapper') as HTMLElement,
      ).overflow,
    ).toBe('auto');
  },
);
