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
import APIS from '@/apis';
import AOEForm from './aoeform';
import type { AccountItem, OrgNode } from './data.d';
import AccountPage from './index';
import * as accountService from './service';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  user: {} as object,
  ready: false,
}));
vi.mock('@umijs/max', async () => ({
  request: mocks.request,
  history: (await import('@@/core/history')).createHistory({
    type: 'memory',
    initialEntries: ['/sys/account'],
  }),
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
  useModel: () => ({ initialState: { currentUser: mocks.user } }),
}));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (await import('@ant-design/pro-components/es/table')).default,
}));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('@/components', async () => ({
  TreeSelector: (await import('@/components/TreeSelector')).default,
  SideLayout: ({
    body,
    children,
  }: {
    body: ReactNode;
    children: ReactNode;
  }) => (
    <>
      {body}
      {children}
    </>
  ),
}));
const d1 = '2113856614139469826';
const d2 = '2113856614139469827';
const orgs = [
  { id: d1, title: 'D1', name: 'D1' },
  { id: d2, title: 'D2', name: 'D2' },
];
const account: AccountItem = {
  id: '2113894345662021633',
  account: 'fixture_peer',
  name: '夹具用户',
  deptId: d1,
  tel: '13800000000',
  email: 'fixture@example.com',
  frozen: 0,
  locked: '0000',
  roles: [],
  roleIds: [],
  assignedRoles: [],
};
const writes = () =>
  mocks.request.mock.calls.filter(
    ([url]) =>
      url === APIS.ACCOUNT_EDIT ||
      url === APIS.ROLE_SAVEMODULE ||
      url === APIS.ACCOUNT_GRANT,
  );
function shell(
  children: ReactNode,
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return (
    <QueryClientProvider client={client}>
      <ConfigProvider
        locale={zhCN}
        button={{ autoInsertSpace: false }}
        theme={{ token: { motion: false } }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
function form(
  mode: 'create' | 'edit' | 'view',
  item: AccountItem = account,
  nodes = orgs,
) {
  return shell(
    <AOEForm
      operateType={mode}
      currentItem={mode === 'create' ? null : item}
      orgs={nodes}
      roles={[{ id: '1', name: '已有角色' }]}
      onClose={vi.fn()}
      onSuccess={vi.fn()}
    />,
  );
}
function field(label: string | RegExp) {
  const dialog = document.querySelector<HTMLElement>('.ant-modal[role=dialog]');
  if (dialog && !dialog.querySelector('form')) {
    const item = within(dialog)
      .getByText(
        (_text, element) => {
          if (element?.tagName !== 'LABEL') return false;
          const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
          return typeof label === 'string' ? text === label : label.test(text);
        },
        { selector: 'label' },
      )
      .closest('.ant-form-item');
    const value = item?.querySelector<HTMLElement>('.ant-form-item-control');
    if (!value) throw new Error(`缺少查看文本字段：${label}`);
    return value;
  }
  return dialog
    ? within(dialog).getByLabelText(label)
    : screen.getByLabelText(label);
}
function expectViewText(label: string, value: string) {
  const element = field(label);
  expect(element.matches('input,textarea,select,[role="combobox"]')).toBe(
    false,
  );
  expect(element).not.toHaveAttribute('name');
  expect(
    element.querySelector('input,textarea,select,[role="combobox"]'),
  ).toBeNull();
  expect(element.textContent).toBe(value);
}
function departmentText() {
  return field('所属部门').closest('.ant-select')?.textContent ?? '';
}
async function selectDepartment(label: string) {
  await waitFor(() => expect(field('所属部门')).not.toBeDisabled());
  fireEvent.mouseDown(field('所属部门'));
  const popup = document.querySelector<HTMLElement>(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
  );
  if (!popup) throw new Error('部门下拉未打开');
  fireEvent.click(
    await within(popup).findByText(label, {
      selector: '.ant-select-tree-title',
    }),
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.request.mockReset();
  mocks.user = {};
  mocks.ready = false;
  mocks.request.mockImplementation(async (url: string) => {
    const path = url.split('?')[0];
    if (path === APIS.ORG_LIST)
      return { success: true, data: mocks.ready ? orgs : [] };
    if (path === APIS.ROLE_LIST)
      return {
        success: true,
        data: {
          records: mocks.ready ? [{ id: '1', name: '已有角色' }] : [],
          total: mocks.ready ? 1 : 0,
        },
      };
    if (path === APIS.ACCOUNT_LIST)
      return { success: true, data: { records: [account], total: 1 } };
    if (path === `${APIS.ACCOUNT_GET}/${account.id}`)
      return { success: true, data: account };
    return { success: true };
  });
});

it('真实QueryClient缓存空后打开Modal重新读同范围候选，空树不令部门字段消失', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(shell(<AccountPage />, client));
  await screen.findByText('夹具用户');
  await waitFor(() => expect(client.isFetching()).toBe(0));
  mocks.ready = true;
  fireEvent.click(screen.getByRole('button', { name: '新增用户' }));
  expect(await screen.findByLabelText('所属部门')).toBeInTheDocument();
  expect(await screen.findByText('已有角色')).toBeInTheDocument();
  await selectDepartment('D1');
  expect(departmentText()).toContain('D1');
});

it('view复用1040业务栅格纯文本，无表单控件及密码上传，显示真实审计和缺值—', async () => {
  render(
    form('view', {
      ...account,
      createBy: '真实创建人',
      utcCreate: '2026-10-01 10:00:00',
      password: 'SECRET_PASSWORD',
      repassword: 'SECRET_PASSWORD',
      avatar: 'fixture-avatar.png',
      remark: '第一行备注\n第二行备注',
    }),
  );
  expect(screen.getByRole('dialog')).toHaveStyle({ width: '1040px' });
  expectViewText('姓名', '夹具用户');
  expectViewText('账号', account.account);
  expectViewText('所属部门', 'D1');
  expectViewText('手机号码', '13800000000');
  expectViewText('邮箱', 'fixture@example.com');
  expectViewText('头像', 'fixture-avatar.png');
  expectViewText('备注', '第一行备注\n第二行备注');
  expect(field('姓名').closest('.ant-form-item')?.parentElement).toHaveClass(
    'ant-col-sm-12',
  );
  expect(
    field('所属部门').closest('.ant-form-item')?.parentElement,
  ).toHaveClass('ant-col-24');
  expect(screen.queryByRole('button', { name: '保存' })).toBeNull();
  expectViewText('创建人', '真实创建人');
  expectViewText('创建时间', '2026-10-01 10:00:00');
  expectViewText('修改人', '—');
  expectViewText('修改时间', '—');
  expect(screen.getByRole('region', { name: '用户资料' })).toContainElement(
    field('创建人'),
  );
  expect(
    within(screen.getByRole('region', { name: '用户角色' })).queryByText(
      '创建人',
      { selector: 'label' },
    ),
  ).toBeNull();
  expect(document.body.innerHTML).not.toContain('SECRET_PASSWORD');
  expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  expect(screen.queryByText('已有角色')).toBeNull();
  expect(screen.queryByText('审计信息')).toBeNull();
  expect(document.querySelector('.ant-divider')).toBeNull();
  expect(
    screen
      .getByRole('dialog')
      .querySelector(
        'form,input,textarea,select,[role="combobox"],[name],[type="submit"]',
      ),
  ).toBeNull();
  expect(screen.queryByLabelText('密码')).toBeNull();
  expect(screen.queryByLabelText('确认密码')).toBeNull();
  fireEvent.submit(screen.getByRole('dialog'));
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
  expect(writes()).toHaveLength(0);
  expect(
    mocks.request.mock.calls.filter(
      ([, options]) => options?.method === 'POST',
    ),
  ).toHaveLength(0);
});

it('真实TreeSelect回填19位ID，编辑只改姓名保D1，审计不入payload', async () => {
  render(
    form('edit', {
      ...account,
      createBy: '审计人员',
      utcCreate: '2026-10-01 10:00:00',
    }),
  );
  expect(field('所属部门')).toBeInTheDocument();
  expect(departmentText()).toContain('D1');
  fireEvent.change(field('姓名'), {
    target: { value: '新姓名' },
  });
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][1].data).toMatchObject({
    deptId: d1,
    name: '新姓名',
    roleIds: [],
    frozen: 0,
  });
  expect(writes()[0][1].data).not.toHaveProperty('createBy');
  expect(writes()[0][1].data).not.toHaveProperty('utcCreate');
});

it('部门边界：按展示名称搜索，无关词为空、清空恢复且不改变已选ID或新增GET', async () => {
  const nodes = [
    { id: d1, title: 'QA_D1_20261023', name: 'QA_D1_20261023' },
    { id: d2, title: 'QA_D2_20261023', name: 'QA_D2_20261023' },
  ];
  render(form('edit', account, nodes));
  expect(departmentText()).toContain('QA_D1_20261023');
  fireEvent.mouseDown(field('所属部门'));
  const popup = document.querySelector<HTMLElement>(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
  );
  if (!popup) throw new Error('部门下拉未打开');
  const visibleNode = (label: string) =>
    within(popup).queryByText(label, { selector: '.ant-select-tree-title' });
  await waitFor(() => expect(visibleNode('QA_D2_20261023')).not.toBeNull());
  const callsBeforeSearch = mocks.request.mock.calls.length;
  fireEvent.change(field('所属部门'), { target: { value: 'qa_d1' } });
  await waitFor(() => {
    expect(visibleNode('QA_D1_20261023')).not.toBeNull();
    expect(visibleNode('QA_D2_20261023')).toBeNull();
  });
  fireEvent.change(field('所属部门'), { target: { value: '不存在的部门' } });
  expect(await within(popup).findByText('暂无可选部门')).toBeInTheDocument();
  expect(visibleNode('QA_D1_20261023')).toBeNull();
  fireEvent.change(field('所属部门'), { target: { value: '' } });
  await waitFor(() => {
    expect(visibleNode('QA_D1_20261023')).not.toBeNull();
    expect(visibleNode('QA_D2_20261023')).not.toBeNull();
  });
  expect(mocks.request.mock.calls).toHaveLength(callsBeforeSearch);
  expect(departmentText()).toContain('QA_D1_20261023');
  fireEvent.change(field('姓名'), { target: { value: '搜索后只改姓名' } });
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][1].data.deptId).toBe(d1);
  expect(typeof writes()[0][1].data.deptId).toBe('string');
});

it.each(
  ['string', 'null', 'missing'].flatMap((kind) =>
    ['org-first', 'detail-first'].map((order) => ({ kind, order })),
  ),
)(
  '部门边界：原service链到Form保留deptId与候选先后：$kind/$order',
  async ({ kind, order }) => {
    const raw: Record<string, unknown> = { ...account };
    if (kind === 'null') raw.deptId = null;
    if (kind === 'missing') delete raw.deptId;
    let resolveOrg!: (value: unknown) => void;
    let resolveDetail!: (value: unknown) => void;
    const orgPromise = new Promise((resolve) => {
      resolveOrg = resolve;
    });
    const detailPromise = new Promise((resolve) => {
      resolveDetail = resolve;
    });
    const originalRequest = mocks.request.getMockImplementation();
    mocks.request.mockImplementation(async (url: string, options: unknown) => {
      if (url.split('?')[0] === APIS.ORG_LIST) return orgPromise;
      if (url === `${APIS.ACCOUNT_GET}/${account.id}`) return detailPromise;
      return originalRequest?.(url, options);
    });
    const detailSpy = vi.spyOn(accountService, 'getAccount');
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    try {
      render(shell(<AccountPage />, client));
      const row = (await screen.findByText(account.name)).closest('tr');
      if (!row) throw new Error('账号列表缺少真实记录行');
      fireEvent.click(within(row).getByText('编辑'));
      const dialog = screen.getByRole('dialog');
      await waitFor(() => expect(detailSpy).toHaveBeenCalledOnce());
      const finishOrg = () =>
        resolveOrg({ success: true, data: [{ id: d1, name: '原接口部门D1' }] });
      const finishDetail = () => resolveDetail({ success: true, data: raw });
      await act(async () => {
        if (order === 'org-first') finishOrg();
        else finishDetail();
      });
      if (order === 'org-first') {
        await waitFor(() =>
          expect(
            client
              .getQueriesData<OrgNode[]>({ queryKey: ['sys', 'orgs'] })
              .some(([, nodes]) =>
                nodes?.some((node) => node.title === '原接口部门D1'),
              ),
          ).toBe(true),
        );
        expect(
          within(dialog).getByRole('region', { name: '用户资料' }),
        ).toHaveAttribute('aria-busy', 'true');
      } else {
        await waitFor(() =>
          expect(
            within(dialog).getByRole('region', { name: '用户资料' }),
          ).toHaveAttribute('aria-busy', 'false'),
        );
      }
      expect(field('所属部门')).toBeDisabled();
      await act(async () => {
        if (order === 'org-first') finishDetail();
        else finishOrg();
      });
      await waitFor(() => expect(field('所属部门')).not.toBeDisabled());
      expect(screen.getByRole('dialog')).toBe(dialog);
      const normalized = await detailSpy.mock.results[0].value;
      if (!normalized.data) throw new Error('原service未返回详情');
      expect(Object.hasOwn(normalized.data, 'deptId')).toBe(kind !== 'missing');
      if (kind === 'string') {
        expect(normalized.data.deptId).toBe(d1);
        expect(typeof normalized.data.deptId).toBe('string');
        expect(departmentText()).toContain('原接口部门D1');
      } else {
        if (kind === 'null') expect(normalized.data.deptId).toBeNull();
        else expect(normalized.data.deptId).toBeUndefined();
        expect(departmentText()).toContain('请选择所属部门');
        expect(
          field('所属部门')
            .closest('.ant-select')
            ?.querySelector('.ant-select-selection-item'),
        ).toBeNull();
      }
      fireEvent.change(field('姓名'), { target: { value: '原链路只改姓名' } });
      fireEvent.click(screen.getByRole('button', { name: '保存' }));
      if (kind === 'string') {
        await waitFor(() => expect(writes()).toHaveLength(1));
        expect(writes()[0][1].data.deptId).toBe(d1);
        expect(typeof writes()[0][1].data.deptId).toBe('string');
      } else {
        await waitFor(() =>
          expect(field('所属部门')).toHaveAttribute('aria-invalid', 'true'),
        );
        expect(writes()).toHaveLength(0);
      }
      expect(detailSpy).toHaveBeenCalledOnce();
    } finally {
      detailSpy.mockRestore();
    }
  },
);

it('编辑D1改D2后保存失败仍保留真实选择，清空受必填阻止而不发null', async () => {
  mocks.request.mockResolvedValue({ success: false, message: '保存拒绝' });
  render(form('edit'));
  await selectDepartment('D2');
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][1].data.deptId).toBe(d2);
  expect(departmentText()).toContain('D2');
  const clear = document.querySelector('.ant-select-clear');
  if (!clear) throw new Error('缺少清空部门入口');
  fireEvent.mouseDown(clear);
  fireEvent.click(clear);
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() =>
    expect(field('所属部门')).toHaveAttribute('aria-invalid', 'true'),
  );
  expect(writes()).toHaveLength(1);
});

it('未知组织包/拒绝是加载失败，真实空数组仍显示不可选字段', async () => {
  mocks.request.mockImplementation(async (url: string) =>
    url.startsWith(APIS.ORG_LIST)
      ? { success: false }
      : { success: true, data: { records: [], total: 0 } },
  );
  render(shell(<AccountPage />));
  fireEvent.click(screen.getByRole('button', { name: '新增用户' }));
  expect(await screen.findByText('部门列表加载失败')).toBeInTheDocument();
  expect(field('所属部门')).toBeInTheDocument();
  expect(writes()).toHaveLength(0);
});

it('列表查看Button与双击都只GET进入同Modal，关闭后再编辑恢复可写', async () => {
  mocks.ready = true;
  render(shell(<AccountPage />));
  const row = (await screen.findByText('夹具用户')).closest(
    'tr',
  ) as HTMLElement;
  fireEvent.click(within(row).getByRole('button', { name: '查看' }));
  await waitFor(() => expectViewText('姓名', '夹具用户'));
  fireEvent.click(screen.getByRole('button', { name: '关闭用户查看' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.doubleClick(within(row).getByText('夹具用户'));
  await waitFor(() => expectViewText('姓名', '夹具用户'));
  expect(writes()).toHaveLength(0);
});

it('同一AOE从view切edit恢复部门可选及保存，审计区消失且原部门不丢', async () => {
  const view = render(form('view', { ...account, createBy: '创建人员' }));
  expectViewText('所属部门', 'D1');
  expect(screen.queryByRole('combobox')).toBeNull();
  view.rerender(form('edit', { ...account, createBy: '创建人员' }));
  expect(field('所属部门')).not.toBeDisabled();
  expect(screen.queryByLabelText('创建人')).toBeNull();
  await selectDepartment('D2');
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][1].data).toMatchObject({
    deptId: d2,
    account: account.account,
    roleIds: [],
  });
  expect(writes()[0][1].data).not.toHaveProperty('createBy');
});

it('新增真实选择D1提交完整19位字符串，密码哈希但不混审计', async () => {
  render(form('create'));
  fireEvent.change(field(/账号/), { target: { value: 'fixture_new' } });
  fireEvent.change(field('姓名'), { target: { value: '新用户' } });
  fireEvent.change(field(/^密码/), { target: { value: 'abc12345' } });
  fireEvent.change(field('确认密码'), { target: { value: 'abc12345' } });
  fireEvent.change(field('手机号码'), { target: { value: '13800000000' } });
  fireEvent.change(field('邮箱'), { target: { value: 'new@example.com' } });
  await selectDepartment('D1');
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][1].data).toMatchObject({
    deptId: d1,
    name: '新用户',
    roleIds: [],
    frozen: 0,
  });
  expect(writes()[0][1].data.password).not.toBe('abc12345');
});

it('详情有D1但候选为空仍保值，不把undefined或字段隐藏变成null写入', async () => {
  render(form('edit', account, []));
  expect(field('所属部门')).toBeInTheDocument();
  fireEvent.change(field('姓名'), { target: { value: '只改姓名' } });
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][1].data.deptId).toBe(d1);
});

it('详情关闭后旧请求不能覆盖新记录，view错误不提供保存', async () => {
  let resolveOld!: (value: unknown) => void;
  const old = new Promise((resolve) => {
    resolveOld = resolve;
  });
  const other = { ...account, id: '2113894345662021634', name: '另一夹具' };
  mocks.request.mockImplementation(async (url: string) => {
    const path = url.split('?')[0];
    if (path === APIS.ACCOUNT_LIST)
      return { success: true, data: { records: [account, other], total: 2 } };
    if (path === `${APIS.ACCOUNT_GET}/${account.id}`) return old;
    if (path === `${APIS.ACCOUNT_GET}/${other.id}`)
      return { success: true, data: other };
    if (path === APIS.ORG_LIST) return { success: true, data: orgs };
    return { success: true, data: { records: [], total: 0 } };
  });
  render(shell(<AccountPage />));
  const first = (await screen.findByText('夹具用户')).closest(
    'tr',
  ) as HTMLElement;
  fireEvent.doubleClick(within(first).getByText('夹具用户'));
  expect(
    within(screen.getByRole('region', { name: '用户资料' })).getByText(
      '加载中...',
    ),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '关闭用户查看' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  const second = screen.getByText('另一夹具').closest('tr') as HTMLElement;
  fireEvent.doubleClick(within(second).getByText('另一夹具'));
  const secondDialog = screen.getByRole('dialog');
  await waitFor(() => expectViewText('姓名', '另一夹具'));
  expect(screen.getByRole('dialog')).toBe(secondDialog);
  await act(async () =>
    resolveOld({ success: true, data: { ...account, name: '旧响应' } }),
  );
  expectViewText('姓名', '另一夹具');
  expect(screen.getByRole('dialog')).toBe(secondDialog);
  expect(secondDialog).toBeInTheDocument();
  expect(writes()).toHaveLength(0);
});

it('同一QueryClient切换已验证用户快照不沿用旧可选角色', async () => {
  mocks.ready = true;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(shell(<AccountPage />, client));
  await screen.findByText('夹具用户');
  await waitFor(() => expect(client.isFetching()).toBe(0));
  mocks.user = {};
  mocks.ready = false;
  view.rerender(shell(<AccountPage />, client));
  await waitFor(() => expect(client.isFetching()).toBe(0));
  fireEvent.click(screen.getByRole('button', { name: '新增用户' }));
  expect(await screen.findByText('暂无可选角色')).toBeInTheDocument();
  expect(screen.queryByText('已有角色')).toBeNull();
  expect(field('所属部门')).toBeInTheDocument();
});

it('缺失部门的编辑不能把undefined发给ALWAYS清空；正常候选空仍有控件', async () => {
  render(form('edit', { ...account, deptId: undefined }, []));
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() =>
    expect(field('所属部门')).toHaveAttribute('aria-invalid', 'true'),
  );
  expect(writes()).toHaveLength(0);
});

it('view的文件选择/删除与隐藏submit均不上传或保存，关闭不误报dirty', async () => {
  const open = vi
    .spyOn(XMLHttpRequest.prototype, 'open')
    .mockImplementation(() => undefined);
  const send = vi
    .spyOn(XMLHttpRequest.prototype, 'send')
    .mockImplementation(() => undefined);
  const close = vi.fn();
  try {
    render(
      shell(
        <AOEForm
          operateType="view"
          currentItem={Object.assign({}, account, {
            createId: '999',
            modifyId: '888',
          })}
          orgs={orgs}
          roles={[]}
          onClose={close}
          onSuccess={vi.fn()}
        />,
      ),
    );
    expectViewText('创建人', '—');
    expectViewText('修改人', '—');
    expect(screen.queryByLabelText('密码')).toBeNull();
    expect(screen.queryByLabelText('确认密码')).toBeNull();
    expect(
      document.querySelector('input[type=file],.ant-upload,form'),
    ).toBeNull();
    fireEvent.submit(screen.getByRole('dialog'));
    fireEvent.click(screen.getByRole('button', { name: '关闭用户查看' }));
    expect(close).toHaveBeenCalledOnce();
    expect(screen.queryByText('放弃未保存的修改？')).toBeNull();
    expect(open).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(writes()).toHaveLength(0);
  } finally {
    open.mockRestore();
    send.mockRestore();
  }
});

it('详情读取拒绝仍同一Modal，只报安全错误且无保存', async () => {
  mocks.request.mockImplementation(async (url: string) => {
    const path = url.split('?')[0];
    if (path === APIS.ACCOUNT_LIST)
      return { success: true, data: { records: [account], total: 1 } };
    if (path === `${APIS.ACCOUNT_GET}/${account.id}`)
      throw new Error('SECRET_REJECT');
    if (path === APIS.ORG_LIST) return { success: true, data: [] };
    return { success: true, data: { records: [], total: 0 } };
  });
  render(shell(<AccountPage />));
  const row = (await screen.findByText('夹具用户')).closest(
    'tr',
  ) as HTMLElement;
  fireEvent.doubleClick(within(row).getByText('夹具用户'));
  expect(
    await screen.findByText('详情读取失败，请关闭后重试'),
  ).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toHaveStyle({ width: '1040px' });
  expect(screen.queryByRole('button', { name: '保存' })).toBeNull();
  expect(document.body.textContent).not.toContain('SECRET_REJECT');
  expect(writes()).toHaveLength(0);
});

it('view只用目标已授摘要，超过候选首200也不漏；edit仍显示候选且保分配', async () => {
  const owned = {
    ...account,
    roleIds: ['9000000000000000001', '9000000000000000002'],
    assignedRoles: [
      {
        id: '9000000000000000001',
        name: '目标专属甲',
        code: 'A',
        frozen: 1 as const,
      },
      {
        id: '9000000000000000002',
        name: '目标专属乙',
        code: 'B',
        frozen: 9999 as const,
      },
    ],
    roles: [{ id: '9000000000000000001' }, { id: '9000000000000000002' }],
  };
  const view = render(form('view', owned));
  expect(screen.getByText('目标专属甲')).toBeInTheDocument();
  expect(screen.getByText('目标专属乙')).toBeInTheDocument();
  expect(screen.queryByText('已有角色')).toBeNull();
  expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  expect(screen.getByText('已锁定')).toBeInTheDocument();
  expect(screen.getByText('系统只读')).toBeInTheDocument();
  view.rerender(form('edit', owned));
  expect(screen.getByText('已有角色')).toBeInTheDocument();
  expect(screen.queryByText('目标专属甲')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  await waitFor(() => expect(writes()).toHaveLength(1));
  expect(writes()[0][1].data.roleIds).toEqual(owned.roleIds);
  expect(writes()[0][1].data).not.toHaveProperty('assignedRoles');
});

it.each([
  {
    roleIds: [] as string[],
    assignedRoles: undefined,
    message: '角色信息未就绪',
  },
  {
    roleIds: ['9000000000000000001'],
    assignedRoles: [],
    message: '角色信息不完整',
  },
])(
  '角色元数据缺失不是未分配，也不用候选补名：$message',
  ({ roleIds, assignedRoles, message }) => {
    render(form('view', { ...account, roleIds, assignedRoles }));
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByText('暂无已分配角色')).toBeNull();
    expect(screen.queryByText('已有角色')).toBeNull();
    expect(writes()).toHaveLength(0);
  },
);

it('只有双空才未分配，切用户不闪全候选', () => {
  const view = render(form('view', account));
  expect(screen.getByText('暂无已分配角色')).toBeInTheDocument();
  const other = {
    ...account,
    id: '9000000000000000003',
    roleIds: ['2'],
    assignedRoles: [{ id: '2', name: '仅乙拥有', code: 'B', frozen: null }],
  };
  view.rerender(form('view', other));
  expect(screen.getByText('仅乙拥有')).toBeInTheDocument();
  expect(screen.queryByText('已有角色')).toBeNull();
  expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
});

it('编辑左右局部加载互不冒充，角色失败重试保留左侧输入与关闭入口', () => {
  const retry = vi.fn();
  const close = vi.fn();
  const contents = (
    detailsLoading: boolean,
    rolesLoading: boolean,
    rolesError = false,
  ) =>
    shell(
      <AOEForm
        operateType="edit"
        currentItem={account}
        orgs={orgs}
        roles={[{ id: '1', name: '已有角色' }]}
        detailsLoading={detailsLoading}
        rolesLoading={rolesLoading}
        rolesError={rolesError}
        onRetryRoles={retry}
        onClose={close}
        onSuccess={vi.fn()}
      />,
    );
  const view = render(contents(false, true));
  expect(screen.getByRole('region', { name: '用户资料' })).toHaveAttribute(
    'aria-busy',
    'false',
  );
  expect(screen.getByRole('region', { name: '用户角色' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(field('姓名')).not.toBeDisabled();
  fireEvent.change(field('姓名'), { target: { value: '未保存姓名' } });
  view.rerender(contents(false, false, true));
  expect(field('姓名')).toHaveValue('未保存姓名');
  fireEvent.click(
    within(screen.getByRole('region', { name: '用户角色' })).getByRole(
      'button',
      { name: '重试' },
    ),
  );
  expect(retry).toHaveBeenCalledOnce();
  expect(field('姓名')).toHaveValue('未保存姓名');
  view.rerender(contents(true, false));
  expect(screen.getByRole('region', { name: '用户角色' })).toHaveAttribute(
    'aria-busy',
    'false',
  );
  expect(
    within(screen.getByRole('region', { name: '用户资料' })).getByText(
      '加载中...',
    ),
  ).toBeInTheDocument();
  expect(field('姓名')).toBeDisabled();
  expect(writes()).toHaveLength(0);
});

it('查看角色元数据重试沿用单次详情读取，骨架保留资料布局且不借候选填补', async () => {
  let complete!: (value: unknown) => void;
  const pending = new Promise((resolve) => {
    complete = resolve;
  });
  const defaultRequest = mocks.request.getMockImplementation();
  let reads = 0;
  mocks.request.mockImplementation(async (url: string, options: unknown) => {
    if (url === `${APIS.ACCOUNT_GET}/${account.id}`) {
      reads += 1;
      return reads === 1
        ? { success: true, data: { ...account, assignedRoles: undefined } }
        : pending;
    }
    return defaultRequest?.(url, options);
  });
  render(shell(<AccountPage />));
  fireEvent.doubleClick(await screen.findByText('夹具用户'));
  await screen.findByText('角色信息未就绪');
  expectViewText('姓名', '夹具用户');
  fireEvent.click(screen.getByRole('button', { name: '重试角色' }));
  await waitFor(() => expect(reads).toBe(2));
  expect(field('姓名').querySelector('.ant-skeleton')).not.toBeNull();
  expect(field('姓名')).not.toHaveTextContent('夹具用户');
  expect(screen.getByRole('region', { name: '用户资料' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(screen.getByRole('region', { name: '用户角色' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await act(async () => complete({ success: true, data: account }));
  expect(await screen.findByText('暂无已分配角色')).toBeInTheDocument();
  expect(reads).toBe(2);
  expect(writes()).toHaveLength(0);
});

it.each(['view', 'edit'] as const)(
  '%s详情加载成功及同用户重开保持单次打开的Modal实例',
  async (mode) => {
    let completeFirst!: (value: unknown) => void;
    let completeSecond!: (value: unknown) => void;
    const first = new Promise((resolve) => {
      completeFirst = resolve;
    });
    const second = new Promise((resolve) => {
      completeSecond = resolve;
    });
    const defaultRequest = mocks.request.getMockImplementation();
    let reads = 0;
    mocks.ready = true;
    mocks.request.mockImplementation(async (url: string, options: unknown) => {
      if (url === `${APIS.ACCOUNT_GET}/${account.id}`)
        return ++reads === 1 ? first : second;
      return defaultRequest?.(url, options);
    });
    render(shell(<AccountPage />));
    const row = (await screen.findByText('夹具用户')).closest(
      'tr',
    ) as HTMLElement;
    const open = () =>
      mode === 'view'
        ? fireEvent.doubleClick(within(row).getByText('夹具用户'))
        : fireEvent.click(within(row).getByText('编辑'));
    const close = () =>
      fireEvent.click(
        screen.getByRole('button', {
          name: mode === 'view' ? '关闭用户查看' : '关闭',
        }),
      );
    open();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ width: '1040px' });
    expect(
      within(dialog).getByRole('region', { name: '用户资料' }),
    ).toHaveAttribute('aria-busy', 'true');
    if (mode === 'view')
      expect(
        within(dialog).getByRole('region', { name: '用户角色' }),
      ).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(reads).toBe(1));
    await act(async () =>
      completeFirst({
        success: true,
        data: { ...account, createBy: '真实创建人' },
      }),
    );
    await waitFor(() => {
      if (mode === 'view') expectViewText('姓名', '夹具用户');
      else expect(field('姓名')).toHaveValue('夹具用户');
    });
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole('region', { name: '用户资料' }),
    ).toHaveAttribute('aria-busy', 'false');
    if (mode === 'view') {
      expectViewText('创建人', '真实创建人');
      expect(
        within(dialog).getByRole('region', { name: '用户角色' }),
      ).toHaveAttribute('aria-busy', 'false');
      expect(within(dialog).getByText('暂无已分配角色')).toBeInTheDocument();
    }
    close();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    open();
    const reopened = screen.getByRole('dialog');
    expect(reopened).not.toBe(dialog);
    if (mode === 'view') {
      expect(field('姓名').querySelector('.ant-skeleton')).not.toBeNull();
      expect(field('姓名')).not.toHaveTextContent('—');
    } else
      expect(within(reopened).getByLabelText('姓名')).not.toHaveValue(
        '夹具用户',
      );
    await waitFor(() => expect(reads).toBe(2));
    await act(async () =>
      completeSecond({
        success: true,
        data: { ...account, name: '重开新详情' },
      }),
    );
    await waitFor(() => {
      if (mode === 'view') expectViewText('姓名', '重开新详情');
      else expect(field('姓名')).toHaveValue('重开新详情');
    });
    expect(screen.getByRole('dialog')).toBe(reopened);
    expect(reopened).toBeInTheDocument();
    expect(reads).toBe(2);
    expect(writes()).toHaveLength(0);
  },
);

it('view失败和重试成功始终保留首次打开的Modal实例', async () => {
  let fail!: (reason: unknown) => void;
  let complete!: (value: unknown) => void;
  const first = new Promise((_resolve, reject) => {
    fail = reject;
  });
  const retry = new Promise((resolve) => {
    complete = resolve;
  });
  const defaultRequest = mocks.request.getMockImplementation();
  let reads = 0;
  mocks.request.mockImplementation(async (url: string, options: unknown) => {
    if (url === `${APIS.ACCOUNT_GET}/${account.id}`)
      return ++reads === 1 ? first : retry;
    return defaultRequest?.(url, options);
  });
  render(shell(<AccountPage />));
  fireEvent.doubleClick(await screen.findByText('夹具用户'));
  const dialog = screen.getByRole('dialog');
  await waitFor(() => expect(reads).toBe(1));
  await act(async () => fail(new Error('PRIVATE_BACKEND_BODY')));
  expect(
    await screen.findByText('详情读取失败，请关闭后重试'),
  ).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(dialog).not.toHaveTextContent('PRIVATE_BACKEND_BODY');
  fireEvent.click(within(dialog).getByRole('button', { name: '重试资料' }));
  await waitFor(() => expect(reads).toBe(2));
  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(
    within(dialog).getByRole('region', { name: '用户资料' }),
  ).toHaveAttribute('aria-busy', 'true');
  expect(
    within(dialog).getByRole('region', { name: '用户角色' }),
  ).toHaveAttribute('aria-busy', 'true');
  await act(async () => complete({ success: true, data: account }));
  await waitFor(() => expectViewText('姓名', '夹具用户'));
  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(dialog).toBeInTheDocument();
  expect(
    dialog.querySelector('input,textarea,select,[role="combobox"],[name]'),
  ).toBeNull();
  expect(within(dialog).queryByRole('button', { name: '保存' })).toBeNull();
  expect(writes()).toHaveLength(0);
});

it('查看首帧保留字段框与骨架，加载及失败不展示旧值或成功缺值', () => {
  const retry = vi.fn();
  const stale: AccountItem = {
    ...account,
    name: '不应闪现的旧姓名',
    roleIds: ['101'],
    assignedRoles: [
      { id: '101', name: '不应闪现的旧角色', code: 'fixture-role', frozen: 0 },
    ],
  };
  const contents = (loading: boolean, error?: string, item = stale) =>
    shell(
      <AOEForm
        operateType="view"
        currentItem={item}
        detailsLoading={loading}
        detailsError={error}
        onRetryDetails={retry}
        orgs={orgs}
        roles={[]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
  const view = render(contents(true));
  const dialog = screen.getByRole('dialog');
  const profile = within(dialog).getByRole('region', { name: '用户资料' });
  const roleRegion = within(dialog).getByRole('region', { name: '用户角色' });
  const valueFrames = [...profile.querySelectorAll('.eva-view-value')];
  expect(valueFrames).toHaveLength(11);
  expect(profile.querySelectorAll('.ant-skeleton')).toHaveLength(11);
  expect(
    field('备注').querySelector('.eva-view-value-multiline'),
  ).not.toBeNull();
  expect(profile).not.toHaveTextContent('不应闪现的旧姓名');
  expect(profile).not.toHaveTextContent('—');
  expect(roleRegion).not.toHaveTextContent('不应闪现的旧角色');
  const table = roleRegion.querySelector('table');
  expect(table).not.toBeNull();
  expect(
    within(roleRegion).getByRole('columnheader', { name: /角色名称/ }),
  ).toBeInTheDocument();
  expect(dialog.querySelector('input,textarea,select,form')).toBeNull();

  view.rerender(contents(false, '资料读取失败'));
  expect(screen.getByRole('dialog')).toBe(dialog);
  [...profile.querySelectorAll('.eva-view-value')].forEach((frame, index) => {
    expect(frame).toBe(valueFrames[index]);
  });
  expect(profile.querySelector('.ant-skeleton')).toBeNull();
  expect(profile).not.toHaveTextContent('不应闪现的旧姓名');
  expect(profile).not.toHaveTextContent('—');
  expect(within(profile).getByRole('alert')).toHaveClass('eva-view-notice');
  expect(roleRegion.querySelector('table')).toBe(table);
  expect(roleRegion).toHaveTextContent('角色信息读取失败');
  expect(roleRegion).not.toHaveTextContent('暂无已分配角色');
  fireEvent.click(within(profile).getByRole('button', { name: '重试资料' }));
  expect(retry).toHaveBeenCalledOnce();

  view.rerender(
    contents(false, undefined, { ...account, name: '当前真实姓名' }),
  );
  [...profile.querySelectorAll('.eva-view-value')].forEach((frame, index) => {
    expect(frame).toBe(valueFrames[index]);
  });
  expectViewText('姓名', '当前真实姓名');
  expectViewText('创建人', '—');
  expect(roleRegion.querySelector('table')).toBe(table);
  expect(roleRegion).toHaveTextContent('暂无已分配角色');
  expect(writes()).toHaveLength(0);
});
