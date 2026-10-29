import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import access from '@/access';
import APIS from '@/apis';
import type { ResourcePermissionUser } from '@/utils/resourcePermission';
import OrgAOEForm from './aoeform';
import type { OrgItem } from './data.d';
import OrganizationPage from './index';

const mocks = vi.hoisted(() => ({
  currentUser: undefined as ResourcePermissionUser | undefined,
  request: vi.fn(),
  bootstrap: { loading: false, error: undefined as unknown },
}));
vi.mock('@umijs/max', () => ({
  useAccess: () => access({ currentUser: mocks.currentUser }),
  useModel: () => mocks.bootstrap,
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
  request: mocks.request,
  history: { block: () => vi.fn() },
}));
vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
}));

const records: OrgItem[] = [
  {
    id: '7',
    name: '可维护部门',
    code: 'ORG7',
    status: '0001',
    frozen: 0,
    orders: 1,
  },
  {
    id: '8',
    name: '同级部门',
    code: 'ORG8',
    status: '0001',
    frozen: 0,
    orders: 2,
  },
  {
    id: '9',
    name: '系统只读部门',
    code: 'SYS9',
    status: '9999',
    frozen: 9999,
    orders: 3,
  },
];
function grant(paths: string[], enabled = true) {
  mocks.currentUser = {
    access: 'admin',
    resourcePermissionEnabled: enabled,
    menus: [
      {
        resources: paths.map((path) => {
          const [resourceType, resourceUrl] = path.split(' ');
          return { resourceType, resourceUrl };
        }),
      },
    ],
  };
}
const read = ['GET /sys/organization/list', 'GET /sys/organization/get/{id}'];
const write = [
  'POST /sys/organization/edit',
  'POST /sys/organization/checkUnique',
];
function wrapper(children: ReactNode) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
function showPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const content = () =>
    wrapper(
      <QueryClientProvider client={client}>
        <OrganizationPage />
      </QueryClientProvider>,
    );
  const view = render(content());
  return {
    ...view,
    update: () => view.rerender(content()),
    hide: () =>
      view.rerender(
        wrapper(
          <QueryClientProvider client={client}>
            <span>已离开组织页</span>
          </QueryClientProvider>,
        ),
      ),
  };
}
function row(name = '可维护部门') {
  const element = screen.getByText(name).closest('tr');
  if (!element) throw new Error('部门行未渲染');
  return within(element);
}
beforeEach(() => {
  mocks.bootstrap = { loading: false, error: undefined };
  mocks.request.mockReset();
  grant(read);
  mocks.request.mockImplementation(async (url: string) => {
    if (url === APIS.ORG_LIST) return { success: true, data: records };
    if (url === `${APIS.ORG_GET}/7`) return { success: true, data: records[0] };
    return { success: true };
  });
});

it('get/list-only仍能只读查看，admin字符串不授予写入口', async () => {
  showPage();
  await screen.findByText('可维护部门');
  expect(screen.queryByText('新增部门')).toBeNull();
  for (const text of ['编辑', '添加下级', '删除'])
    expect(row().queryByText(text)).toBeNull();
  fireEvent.click(row().getByText('查看'));
  const dialog = await screen.findByRole('dialog');
  await waitFor(() =>
    expect(within(dialog).getByText('ORG7')).toBeInTheDocument(),
  );
  expect(within(dialog).queryByRole('button', { name: /确\s*定/ })).toBeNull();
  expect(
    mocks.request.mock.calls.every(
      ([, options]) => !options?.method || options.method === 'GET',
    ),
  ).toBe(true);
});

it('edit/get和checkUnique均授权才可编辑，并能正常保存真实service请求', async () => {
  grant([...read, ...write]);
  showPage();
  await screen.findByText('可维护部门');
  expect(row().queryByText('删除')).toBeNull();
  fireEvent.click(row().getByText('编辑'));
  await waitFor(() =>
    expect(screen.getByLabelText('部门名称')).toHaveValue('可维护部门'),
  );
  fireEvent.change(screen.getByLabelText('部门名称'), {
    target: { value: '更新名称' },
  });
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      APIS.ORG_EDIT,
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({ id: '7', name: '更新名称' }),
      }),
    ),
  );
});

it('delete-only与排序独立，确认框打开后撤权不能沿旧闭包写入', async () => {
  grant([...read, 'POST /sys/organization/del']);
  const view = showPage();
  await screen.findByText('可维护部门');
  expect(row().queryByText('编辑')).toBeNull();
  expect(row().queryByLabelText('caret-down')).toBeNull();
  fireEvent.click(row().getByText('删除'));
  await screen.findByRole('dialog');
  grant(read);
  view.update();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(row().queryByText('删除')).toBeNull());
  expect(mocks.request.mock.calls.some(([url]) => url === APIS.ORG_DEL)).toBe(
    false,
  );
});

it('批删确认后选择目标变化，不删除旧目标或新目标', async () => {
  grant([...read, 'POST /sys/organization/del']);
  showPage();
  await screen.findByText('可维护部门');
  fireEvent.click(row().getByRole('checkbox'));
  fireEvent.click(screen.getByText('删除部门'));
  await screen.findByRole('dialog');
  fireEvent.click(row().getByRole('checkbox'));
  fireEvent.click(row('同级部门').getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  expect(mocks.request.mock.calls.some(([url]) => url === APIS.ORG_DEL)).toBe(
    false,
  );
});

it('宽授权允许排序与删除，9999仍无写入口且不可勾选', async () => {
  grant(['* /sys/organization/**']);
  showPage();
  await screen.findByText('可维护部门');
  expect(row('系统只读部门').queryByText('删除')).toBeNull();
  expect(row('系统只读部门').getByRole('checkbox')).toBeDisabled();
  fireEvent.click(row().getByLabelText('caret-down'));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(APIS.ORG_SORT, {
      method: 'POST',
      data: { id: '7', oldSort: 1, newSort: 2 },
    }),
  );
  fireEvent.click(row().getByText('删除'));
  fireEvent.click(await screen.findByRole('button', { name: /确\s*定/ }));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(APIS.ORG_DEL, {
      method: 'POST',
      data: { param: ['7'] },
    }),
  );
});

it('关闭资源校验不解除系统只读；未知能力不读取列表或发写请求', async () => {
  grant([], false);
  const view = showPage();
  await screen.findByText('可维护部门');
  expect(screen.getByText('新增部门')).toBeInTheDocument();
  expect(row('系统只读部门').queryByText('编辑')).toBeNull();
  mocks.currentUser = { access: 'admin' };
  view.update();
  expect(screen.queryByText('新增部门')).toBeNull();
  expect(screen.queryByText('可维护部门')).toBeNull();
  expect(
    mocks.request.mock.calls.some(([, options]) => options?.method === 'POST'),
  ).toBe(false);
});

it('唯一校验await期间撤权，返回后不得保存并保留输入', async () => {
  grant([...read, ...write]);
  let finish: (value: { success: boolean }) => void = () => {};
  mocks.request.mockImplementation((url: string) =>
    url === APIS.ORG_CHECKUNIQUE
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : Promise.resolve({ success: true }),
  );
  const currentItem = {};
  const content = () =>
    wrapper(
      <OrgAOEForm
        operateType="create"
        currentItem={currentItem}
        data={[]}
        canRequest={access({ currentUser: mocks.currentUser }).canRequest}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
  const view = render(content());
  fireEvent.change(screen.getByLabelText('部门名称'), {
    target: { value: '保留输入' },
  });
  fireEvent.change(screen.getByLabelText('部门编码'), {
    target: { value: 'NEW7' },
  });
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      APIS.ORG_CHECKUNIQUE,
      expect.anything(),
    ),
  );
  grant(read);
  view.rerender(content());
  await act(async () => finish({ success: true }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /确\s*定/ })).not.toHaveClass(
      'ant-btn-loading',
    ),
  );
  expect(screen.getByLabelText('部门名称')).toHaveValue('保留输入');
  expect(mocks.request.mock.calls.some(([url]) => url === APIS.ORG_EDIT)).toBe(
    false,
  );
});

it('没有list授权时query enabled与实际入口都不请求，get按实际行id判断', async () => {
  grant(['POST /sys/organization/del']);
  const view = showPage();
  expect(mocks.request).not.toHaveBeenCalled();
  grant([
    'GET /sys/organization/list',
    'GET /sys/organization/get/7',
    ...write,
  ]);
  view.update();
  await screen.findByText('可维护部门');
  expect(row().getByText('编辑')).toBeInTheDocument();
  expect(row('同级部门').queryByText('编辑')).toBeNull();
  expect(row('同级部门').queryByText('查看')).toBeNull();
});

it('资源关闭仍保留父子删除阻塞，不能因宽授权删除非叶部门', async () => {
  grant([], false);
  mocks.request.mockResolvedValue({
    success: true,
    data: [{ ...records[0], children: [records[1]] }],
  });
  showPage();
  await screen.findByText('可维护部门');
  fireEvent.click(row().getByText('删除'));
  fireEvent.click(await screen.findByRole('button', { name: /确\s*定/ }));
  await screen.findByText(/存在子节点，无法删除/);
  expect(mocks.request.mock.calls.some(([url]) => url === APIS.ORG_DEL)).toBe(
    false,
  );
});

it.each(['loading', 'error'] as const)(
  'bootstrap %s 保留旧false时，旧确认框也不得写入',
  async (state) => {
    grant([], false);
    const view = showPage();
    await screen.findByText('可维护部门');
    fireEvent.click(row().getByText('删除'));
    await screen.findByRole('dialog');
    mocks.bootstrap =
      state === 'loading'
        ? { loading: true, error: undefined }
        : { loading: false, error: new Error('菜单刷新失败') };
    view.update();
    expect(screen.queryByText('新增部门')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(mocks.request.mock.calls.some(([url]) => url === APIS.ORG_DEL)).toBe(
      false,
    );
  },
);

it('页面已卸载但App确认框仍存续时，旧onOk无写入能力', async () => {
  grant([], false);
  const view = showPage();
  await screen.findByText('可维护部门');
  fireEvent.click(row().getByText('删除'));
  await screen.findByRole('dialog');
  view.hide();
  expect(screen.getByText('已离开组织页')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  expect(mocks.request.mock.calls.some(([url]) => url === APIS.ORG_DEL)).toBe(
    false,
  );
});

it('详情晚到前撤回get权限，不能重新激活编辑保存', async () => {
  grant([...read, ...write]);
  let finish: (value: { success: boolean; data: OrgItem }) => void = () => {};
  mocks.request.mockImplementation((url: string) =>
    url === APIS.ORG_LIST
      ? Promise.resolve({ success: true, data: records })
      : new Promise((resolve) => {
          finish = resolve;
        }),
  );
  const view = showPage();
  await screen.findByText('可维护部门');
  fireEvent.click(row().getByText('编辑'));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(`${APIS.ORG_GET}/7`),
  );
  grant(['GET /sys/organization/list', ...write]);
  view.update();
  await act(async () => finish({ success: true, data: records[0] }));
  await waitFor(() =>
    expect(screen.getByLabelText('部门名称')).toHaveValue('可维护部门'),
  );
  expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  expect(mocks.request.mock.calls.some(([url]) => url === APIS.ORG_EDIT)).toBe(
    false,
  );
});
