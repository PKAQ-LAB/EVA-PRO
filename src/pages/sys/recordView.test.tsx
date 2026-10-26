import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { history } from '@umijs/max';
import { App, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import AccountPage from './account';
import DictionaryPage from './dictionary';
import ModulePage from './module';
import OrganizationPage from './organization';
import RolePage from './role';

const mocks = vi.hoisted(() => ({ request: vi.fn(), english: false }));
vi.mock('@umijs/max', async () => ({
  request: mocks.request,
  history: (await import('@@/core/history')).createHistory({
    type: 'memory',
    initialEntries: ['/sys/dictionary'],
  }),
  useIntl: () => ({
    formatMessage: ({
      id,
      defaultMessage,
    }: {
      id?: string;
      defaultMessage: string;
    }) => {
      const labels: Record<string, string> = {
        'pages.sys.role.moduleAuth': 'Module Auth',
        'pages.sys.role.userAuth': 'User Auth',
        'pages.sys.role.configAuth': 'Config Auth',
        'pages.sys.action.edit': 'Edit',
        'pages.sys.action.delete': 'Delete',
      };
      return mocks.english && id
        ? (labels[id] ?? defaultMessage)
        : defaultMessage;
    },
  }),
  useModel: () => ({
    initialState: {
      dict: {
        DATA_SCOPE: { '0001': '全部数据' },
        RESOURCE_TYPE: { GET: 'GET' },
      },
    },
    setInitialState: vi.fn(),
  }),
}));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (await import('@ant-design/pro-components/es/table')).default,
}));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('@/components', async () => ({
  SideLayout: (await import('@/components/SideLayout')).default,
  DictSelector: (await import('@/components/DictSelector')).default,
  TreeSelector: (await import('@/components/TreeSelector')).default,
  IconSelect: () => null,
}));

beforeEach(() => {
  mocks.request.mockReset();
  mocks.english = false;
  history.replace('/sys/dictionary');
});
function textField(dialog: HTMLElement, label: string) {
  const item = within(dialog)
    .getByText(label, { selector: 'label' })
    .closest('.ant-form-item');
  const value = item?.querySelector<HTMLElement>('.ant-form-item-control');
  if (!value) throw new Error(`缺少文本字段：${label}`);
  return value;
}
const cases = [
  {
    title: '用户',
    heading: '查看用户信息',
    field: '姓名',
    list: APIS.ACCOUNT_LIST,
    get: APIS.ACCOUNT_GET,
    page: () => <AccountPage />,
  },
  {
    title: '角色',
    heading: '查看角色',
    field: '角色名称',
    list: APIS.ROLE_LIST,
    get: APIS.ROLE_GET,
    page: () => <RolePage />,
  },
  {
    title: '组织',
    heading: '查看部门信息',
    field: '部门名称',
    list: APIS.ORG_LIST,
    get: APIS.ORG_GET,
    page: () => <OrganizationPage />,
  },
  {
    title: '模块',
    heading: '查看模块信息',
    field: '模块名称',
    list: APIS.MODULE_LIST,
    get: APIS.MODULE_GET,
    page: () => <ModulePage />,
  },
];
it.each(
  cases.flatMap((item) => [0, 1, 9999].map((frozen) => ({ ...item, frozen }))),
)(
  '$title真实列表普通/系统记录双击只GET查看，Enter不提交（frozen=$frozen）',
  async ({ title, heading, field, list, get, page, frozen }) => {
    const record = {
      id: 'record-a',
      name: '列表记录',
      account: 'qa',
      code: frozen === 9999 ? '9999' : 'QA',
      frozen,
      dataScope: '0001',
      roleIds: [],
      assignedRoles: [],
      routeUrl: '/fixture_route',
      path: '/structural_path',
      lines: [{ id: 'line-a', keyName: 'A', keyValue: '值A' }],
      resources: [
        {
          id: 'res-a',
          resourceDesc: '资源A',
          resourceUrl: '/safe',
          resourceType: 'GET',
        },
      ],
    };
    let finishDetails: (() => void) | undefined;
    let detailReads = 0;
    mocks.request.mockImplementation(async (url: string) => {
      const path = url.split('?')[0];
      if (title === '用户' && path === APIS.ORG_LIST)
        return { success: true, data: [] };
      if (title === '用户' && path === APIS.ROLE_LIST)
        return { success: true, data: { records: [], total: 0 } };
      if (path === list)
        return {
          success: true,
          data:
            list === APIS.ACCOUNT_LIST || list === APIS.ROLE_LIST
              ? { records: [record], total: 1 }
              : [record],
        };
      if (path === `${get}/record-a`) {
        const response = {
          success: true,
          data: {
            ...record,
            name: '详情记录',
            createBy: '真实创建人',
            utcCreate: '2026-10-01 10:00:00',
            createId: 'DO_NOT_USE_CREATOR_ID',
            modifyId: 'DO_NOT_USE_MODIFIER_ID',
            password: 'SECRET_SENTINEL',
            repassword: 'SECRET_SENTINEL',
          },
        };
        detailReads += 1;
        if (detailReads === 1)
          return new Promise((resolve) => {
            finishDetails = () => resolve(response);
          });
        return response;
      }
      throw new Error(`不允许的请求: ${path}`);
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <ConfigProvider theme={{ token: { motion: false } }}>
          <App>{page()}</App>
        </ConfigProvider>
      </QueryClientProvider>,
    );
    const cell = await screen.findByText('列表记录');
    const row = cell.closest('tr');
    if (!row) throw new Error('没有真实记录行');
    const viewButton = within(row).getByRole('button', { name: /查\s*看/ });
    const actionCell = viewButton.closest('td');
    expect(actionCell).toHaveStyle({
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'visible',
      textOverflow: 'clip',
    });
    expect(actionCell).not.toHaveClass('ant-table-cell-ellipsis');
    expect(viewButton.closest('[data-no-row-view]')).toHaveStyle({
      flexWrap: 'nowrap',
      whiteSpace: 'nowrap',
    });
    fireEvent.doubleClick(cell);
    let dialog = await screen.findByRole('dialog');
    const initialDialog = dialog;
    for (const label of [field, '创建人', '创建时间', '修改人', '修改时间']) {
      const slot = textField(dialog, label);
      expect(slot.querySelector('.eva-view-value')).not.toBeNull();
      expect(slot.querySelector('.ant-skeleton')).not.toBeNull();
      expect(slot).not.toHaveTextContent('—');
      expect(slot).not.toHaveTextContent('列表记录');
    }
    expect(
      dialog.querySelector('form,input,textarea,select,[name]'),
    ).toBeNull();
    await waitFor(() => expect(finishDetails).toBeTypeOf('function'));
    const finish = finishDetails;
    if (!finish) throw new Error('详情请求未进入延迟夹具');
    await act(async () => finish());
    await waitFor(() => {
      dialog = screen.getByRole('dialog');
      expect(textField(dialog, field)).toHaveTextContent('详情记录');
    });
    expect(dialog).toBe(initialDialog);
    expect(within(dialog).getByText(heading)).toBeInTheDocument();
    expect(
      dialog.querySelector(
        'form,input,textarea,select,[role="combobox"],[role="switch"],[name]',
      ),
    ).toBeNull();
    expect(textField(dialog, '创建人')).toHaveTextContent('真实创建人');
    expect(textField(dialog, '创建时间')).toHaveTextContent(
      '2026-10-01 10:00:00',
    );
    expect(textField(dialog, '修改人').textContent).toBe('—');
    expect(textField(dialog, '修改时间').textContent).toBe('—');
    for (const label of [field, '创建人', '创建时间', '修改人', '修改时间']) {
      const slot = textField(dialog, label);
      expect(slot.querySelector('.eva-view-value')).not.toBeNull();
      expect(slot.querySelector('.ant-skeleton')).toBeNull();
    }
    expect(within(dialog).queryByText('审计信息')).toBeNull();
    const footer = dialog.querySelector('.ant-modal-footer,.ant-drawer-footer');
    if (!footer) throw new Error('查看表单缺关闭栏');
    expect(within(footer as HTMLElement).getAllByRole('button')).toHaveLength(
      1,
    );
    expect(
      within(dialog).queryByRole('button', { name: /保\s*存|提\s*交|确\s*定/ }),
    ).toBeNull();
    expect(dialog).not.toHaveTextContent('SECRET_SENTINEL');
    expect(dialog.querySelector('input[value="SECRET_SENTINEL"]')).toBeNull();
    if (title === '模块') {
      expect(await within(dialog).findByText('资源A')).toBeInTheDocument();
      expect(textField(dialog, '路由地址')).toHaveTextContent('/fixture_route');
      expect(textField(dialog, '模块编码')).toHaveTextContent(record.code);
      expect(
        within(dialog).queryByRole('button', { name: '新增资源' }),
      ).toBeNull();
      const audit = textField(dialog, '创建人');
      expect(
        textField(dialog, '备注').compareDocumentPosition(audit) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).not.toBe(0);
      expect(
        audit.compareDocumentPosition(within(dialog).getByText('资源信息')) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).not.toBe(0);
    }
    if (title === '角色') {
      expect(textField(dialog, '数据权限').textContent).toBe('0001');
    }
    fireEvent.submit(dialog);
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
    expect(
      mocks.request.mock.calls.filter(([url]) => url === `${get}/record-a`),
    ).toHaveLength(1);
    expect(
      mocks.request.mock.calls.every(
        ([, options]) => !options?.method || options.method === 'GET',
      ),
    ).toBe(true);
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: title === '用户' ? '关闭用户查看' : /关\s*闭/,
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getAllByRole('button', { name: /查\s*看/ })[0]);
    await waitFor(() => {
      const reopened = screen.getByRole('dialog');
      expect(within(reopened).getByText(heading)).toBeInTheDocument();
      expect(textField(reopened, field)).toHaveTextContent('详情记录');
      expect(
        reopened.querySelector(
          'form,input,textarea,select,[role="combobox"],[name]',
        ),
      ).toBeNull();
      expect(textField(reopened, '修改人').textContent).toBe('—');
    });
    expect(
      mocks.request.mock.calls.filter(([url]) => url === `${get}/record-a`),
    ).toHaveLength(2);
    expect(
      mocks.request.mock.calls.every(
        ([, options]) => !options?.method || options.method === 'GET',
      ),
    ).toBe(true);
  },
);

it.each(cases)(
  '$title详情失败保留字段框与审计位，显示真实错误而非加载或成功缺值',
  async ({ field, list, get, page }) => {
    const record = {
      id: 'failed-record',
      name: '失败前列表名称',
      account: 'fixture_failure',
      code: 'FIXTURE',
      frozen: 0,
    };
    let failDetails: (() => void) | undefined;
    mocks.request.mockImplementation(async (url: string) => {
      const path = url.split('?')[0];
      if (list === APIS.ACCOUNT_LIST && path === APIS.ORG_LIST)
        return { success: true, data: [] };
      if (list === APIS.ACCOUNT_LIST && path === APIS.ROLE_LIST)
        return { success: true, data: { records: [], total: 0 } };
      if (path === list)
        return {
          success: true,
          data:
            list === APIS.ACCOUNT_LIST || list === APIS.ROLE_LIST
              ? { records: [record], total: 1 }
              : [record],
        };
      if (path === `${get}/${record.id}`)
        return new Promise((_resolve, reject) => {
          failDetails = () => reject(new Error('SECRET_BACKEND_FAILURE'));
        });
      throw new Error(`不允许的请求: ${path}`);
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <ConfigProvider theme={{ token: { motion: false } }}>
          <App>{page()}</App>
        </ConfigProvider>
      </QueryClientProvider>,
    );
    fireEvent.doubleClick(await screen.findByText(record.name));
    const dialog = await screen.findByRole('dialog');
    const frame = textField(dialog, field).querySelector('.eva-view-value');
    expect(frame).not.toBeNull();
    await waitFor(() => expect(failDetails).toBeTypeOf('function'));
    const fail = failDetails;
    if (!fail) throw new Error('详情请求未进入失败夹具');
    await act(async () => fail());
    await waitFor(() => {
      expect(within(dialog).getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(textField(dialog, field).querySelector('.eva-view-value')).toBe(
      frame,
    );
    for (const label of [field, '创建人', '创建时间', '修改人', '修改时间']) {
      const slot = textField(dialog, label);
      expect(slot.querySelector('.eva-view-value')).not.toBeNull();
      expect(slot).not.toHaveTextContent('—');
      expect(slot).not.toHaveTextContent(record.name);
    }
    expect(
      dialog.querySelector('[aria-busy="true"],.ant-skeleton-active'),
    ).toBeNull();
    expect(within(dialog).queryByRole('status')).toBeNull();
    expect(dialog).not.toHaveTextContent('SECRET_BACKEND_FAILURE');
    expect(
      dialog.querySelector('form,input,textarea,select,[name]'),
    ).toBeNull();
    fireEvent.submit(dialog);
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
    expect(
      mocks.request.mock.calls.filter(([url]) => url === `${get}/${record.id}`),
    ).toHaveLength(1);
    expect(
      mocks.request.mock.calls.every(
        ([, options]) => !options?.method || options.method === 'GET',
      ),
    ).toBe(true);
  },
);

it.each([0, 9999])(
  '字典主表单击右侧编辑，系统记录只读且删除不触发行加载（frozen=%s）',
  async (frozen) => {
    const record = {
      id: 'dict-main',
      name: '主字典',
      code: frozen === 9999 ? '9999' : 'FIXTURE',
      frozen,
      lines: [],
    };
    mocks.request.mockImplementation(async (url: string) => {
      const path = url.split('?')[0];
      if (path === APIS.DICT_LIST) return { success: true, data: [record] };
      if (path === `${APIS.DICT_GET}/${record.id}`)
        return { success: true, data: record };
      throw new Error(`不允许的请求: ${path}`);
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={client}>
        <ConfigProvider theme={{ token: { motion: false } }}>
          <App>
            <DictionaryPage />
          </App>
        </ConfigProvider>
      </QueryClientProvider>,
    );
    const row = await screen.findByRole('row', { name: '选择字典主字典' });
    expect(
      within(row).queryByRole('button', { name: /查\s*看|编\s*辑/ }),
    ).toBeNull();
    const reads = () =>
      mocks.request.mock.calls.filter(
        ([url]) => url === `${APIS.DICT_GET}/${record.id}`,
      );
    if (frozen === 0) {
      fireEvent.click(within(row).getByRole('button', { name: /删\s*除/ }));
      const confirmation = await screen.findByRole('dialog');
      expect(reads()).toHaveLength(0);
      fireEvent.click(
        within(confirmation).getByRole('button', { name: /取\s*消/ }),
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    } else {
      expect(within(row).queryByRole('button', { name: /删\s*除/ })).toBeNull();
    }
    fireEvent.click(within(row).getByText('主字典'));
    await waitFor(() =>
      expect(screen.getByLabelText('字典描述')).toHaveValue('主字典'),
    );
    expect(screen.getByLabelText('字典描述')).toHaveProperty(
      'disabled',
      frozen === 9999,
    );
    expect(screen.getByRole('button', { name: /保\s*存/ })).toHaveProperty(
      'disabled',
      frozen === 9999,
    );
    expect(reads()).toHaveLength(1);
    fireEvent.doubleClick(within(row).getByText('主字典'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(reads()).toHaveLength(1);
    expect(
      mocks.request.mock.calls.every(
        ([, options]) => !options?.method || options.method === 'GET',
      ),
    ).toBe(true);
    if (frozen === 0) {
      fireEvent.change(screen.getByLabelText('字典描述'), {
        target: { value: '未保存主字典' },
      });
      const blocked = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(blocked);
      expect(blocked.defaultPrevented).toBe(true);
      act(() => history.push('/fixture-next'));
      let confirmation!: HTMLElement;
      await waitFor(() => {
        const discard = screen.getByRole('button', { name: '放弃修改' });
        expect(discard).toBeVisible();
        const dialog = discard.closest<HTMLElement>('[role="dialog"]');
        if (!dialog) throw new Error('缺少当前离开确认弹窗');
        expect(dialog).toBeVisible();
        expect(dialog).toHaveTextContent('放弃未保存的修改？');
        confirmation = dialog;
      });
      expect(history.location.pathname).toBe('/sys/dictionary');
      fireEvent.click(
        within(confirmation).getByRole('button', { name: '继续编辑' }),
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(screen.getByLabelText('字典描述')).toHaveValue('未保存主字典');
      expect(reads()).toHaveLength(1);
      expect(
        mocks.request.mock.calls.every(
          ([, options]) => !options?.method || options.method === 'GET',
        ),
      ).toBe(true);
    }
    view.unmount();
    const released = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(released);
    expect(released.defaultPrevented).toBe(false);
    act(() => history.push('/fixture-unmounted'));
    expect(history.location.pathname).toBe('/fixture-unmounted');
  },
);

it('实际英文授权文案完整保留，窄容器使用明确列宽与横滚', async () => {
  mocks.english = true;
  mocks.request.mockResolvedValue({
    success: true,
    data: {
      records: [{ id: 'role-en', name: 'English role', code: 'EN', frozen: 0 }],
      total: 1,
    },
  });
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <div style={{ width: 320 }}>
          <RolePage />
        </div>
      </App>
    </ConfigProvider>,
  );
  const name = await screen.findByText('English role');
  const row = name.closest('tr');
  if (!row) throw new Error('没有角色行');
  for (const label of ['Module Auth', 'User Auth', 'Config Auth']) {
    const button = within(row).getByRole('button', { name: label });
    const cell = button.closest('td');
    expect(cell).toHaveStyle({
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'visible',
    });
    expect(cell).not.toHaveClass('ant-table-cell-ellipsis');
    expect(button).toBeVisible();
    const index = Array.from(row.children).indexOf(cell as Element);
    expect(
      screen.getByRole('table').querySelectorAll('col')[index],
    ).toHaveStyle({ width: '140px' });
  }
  expect(within(row).getByText('Edit')).toBeVisible();
  expect(within(row).getByText('Delete')).toBeVisible();
  expect(screen.getByRole('table')).toHaveStyle({ width: '1440px' });
  expect(screen.getByRole('table').parentElement).toHaveStyle({
    overflowX: 'auto',
  });
});

it.each(
  [
    {
      title: '模块',
      list: APIS.MODULE_LIST,
      get: APIS.MODULE_GET,
      sort: APIS.MODULE_SORT,
      page: ModulePage,
    },
    {
      title: '组织',
      list: APIS.ORG_LIST,
      get: APIS.ORG_GET,
      sort: APIS.ORG_SORT,
      page: OrganizationPage,
    },
  ].flatMap((item) => [true, false].map((enabled) => ({ ...item, enabled }))),
)(
  '$title真实排序svg/path两click+dblclick不查看（可用=$enabled）',
  async ({ list, get, sort, page: Page, enabled }) => {
    const records = [
      { id: 'sort-a', name: '排序记录A', frozen: 0, parentId: '0', orders: 1 },
      { id: 'sort-b', name: '排序记录B', frozen: 0, parentId: '0', orders: 2 },
    ];
    mocks.request.mockImplementation(async (url: string) => {
      if (url.split('?')[0] === list) return { success: true, data: records };
      if (url === sort) return { success: true };
      if (url === `${get}/sort-a`) return { success: true, data: records[0] };
      throw new Error(`不允许的请求: ${url}`);
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <ConfigProvider theme={{ token: { motion: false } }}>
          <App>
            <Page />
          </App>
        </ConfigProvider>
      </QueryClientProvider>,
    );
    const cell = await screen.findByText('排序记录A');
    const row = cell.closest('tr');
    const path = row?.querySelector(
      enabled ? '.anticon-caret-down svg path' : '.anticon-caret-up svg path',
    );
    if (!path) throw new Error('没有找到真实排序箭头path');
    fireEvent.click(path);
    fireEvent.click(path);
    fireEvent.doubleClick(path);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(
      mocks.request.mock.calls.filter(([url]) => url.startsWith(`${get}/`)),
    ).toHaveLength(0);
    const sortRequests = mocks.request.mock.calls.filter(
      ([url]) => url === sort,
    );
    expect(sortRequests).toHaveLength(enabled ? 2 : 0);
    for (const [, options] of sortRequests)
      expect(options).toMatchObject({
        method: 'POST',
        data: { id: 'sort-a', oldSort: 1, newSort: 2 },
      });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.doubleClick(cell);
    const field = get === APIS.MODULE_GET ? '模块名称' : '部门名称';
    await waitFor(() =>
      expect(textField(screen.getByRole('dialog'), field)).toHaveTextContent(
        '排序记录A',
      ),
    );
    expect(
      mocks.request.mock.calls.filter(([url]) => url === `${get}/sort-a`),
    ).toHaveLength(1);
  },
);
