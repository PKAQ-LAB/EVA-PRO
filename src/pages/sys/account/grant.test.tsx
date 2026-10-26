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
import type { AccountItem } from './data.d';
import AccountPage from './index';
import RoleModal from './rolemodal';

const mocks = vi.hoisted(() => ({ request: vi.fn(), user: {} as object }));
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
vi.mock('@/components', () => ({
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
type GrantFixture = AccountItem & { id: string };
const first: GrantFixture = {
  id: '9000000000000000011',
  account: 'fixture_first',
  name: '用户甲',
  frozen: 0,
  roles: [],
  roleIds: [],
  assignedRoles: [],
};
const second: GrantFixture = {
  ...first,
  id: '9000000000000000012',
  account: 'fixture_second',
  name: '用户乙',
};
const roles = [
  { id: '9000000000000000021', name: '角色甲' },
  { id: '9000000000000000022', name: '角色乙' },
];
const owned = (item = first, role = roles[0]) => ({
  ...item,
  roles: [{ id: role.id }],
  roleIds: [role.id],
});
function deferred() {
  let resolve!: (value: unknown) => void;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function shell(children: ReactNode) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
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
function panels() {
  return screen
    .getByRole('dialog')
    .querySelectorAll<HTMLElement>('.ant-transfer-section');
}
function closeButton(dialog = screen.getByRole('dialog')) {
  const footer = dialog.querySelector<HTMLElement>('.ant-modal-footer');
  if (!footer) throw new Error('缺少授权窗口关闭栏');
  return within(footer).getByRole('button', { name: '关闭' });
}
async function ready() {
  await waitFor(() => expect(panels()).toHaveLength(2));
}
function addSecondRole() {
  const item = within(panels()[0]).getByText('角色乙').closest('li');
  if (!item) throw new Error('缺少候选角色');
  fireEvent.click(within(item).getByRole('checkbox'));
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'right' }),
  );
}
async function openGrant(name = '用户甲') {
  const row = (await screen.findByText(name)).closest('tr');
  if (!row) throw new Error('缺少用户行');
  fireEvent.click(within(row).getByText('角色授权'));
  return screen.getByRole('dialog');
}
const grants = () =>
  mocks.request.mock.calls.filter(([url]) => url === APIS.ACCOUNT_GRANT);
const reads = (id = first.id) =>
  mocks.request.mock.calls.filter(
    ([url]) => url === `${APIS.ACCOUNT_GET}/${id}`,
  );
beforeEach(() => {
  mocks.request.mockReset();
  mocks.user = {};
  mocks.request.mockImplementation(async (url: string) => {
    const path = url.split('?')[0];
    if (path === APIS.ACCOUNT_LIST)
      return { success: true, data: { records: [first, second], total: 2 } };
    if (path === APIS.ORG_LIST) return { success: true, data: [] };
    if (path === APIS.ROLE_LIST)
      return { success: true, data: { records: roles, total: 2 } };
    if (path === `${APIS.ACCOUNT_GET}/${first.id}`)
      return { success: true, data: owned() };
    if (path === `${APIS.ACCOUNT_GET}/${second.id}`)
      return { success: true, data: owned(second, roles[1]) };
    if (path === APIS.ACCOUNT_GRANT) return { success: true };
    throw new Error('夹具禁止额外接口');
  });
});

it('授权点击先开稳定Modal，详情与候选就绪后正确初选，单GET及原写载荷', async () => {
  const detail = deferred();
  const candidates = deferred();
  const fallback = mocks.request.getMockImplementation();
  mocks.request.mockImplementation(async (url: string, options: unknown) => {
    if (url === `${APIS.ACCOUNT_GET}/${first.id}`) return detail.promise;
    if (url.split('?')[0] === APIS.ROLE_LIST) return candidates.promise;
    return fallback?.(url, options);
  });
  render(shell(<AccountPage />));
  const dialog = await openGrant();
  expect(within(dialog).getByText('选择授权角色')).toBeInTheDocument();
  expect(within(dialog).getByText('加载中...')).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: '确定' })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('button', { name: '确定' }));
  expect(grants()).toHaveLength(0);
  await act(async () => detail.resolve({ success: true, data: owned() }));
  expect(within(dialog).getByRole('button', { name: '确定' })).toBeDisabled();
  expect(panels()).toHaveLength(0);
  await act(async () =>
    candidates.resolve({ success: true, data: { records: roles, total: 2 } }),
  );
  await ready();
  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(panels()[1]).toHaveTextContent('角色甲');
  expect(panels()[1]).not.toHaveTextContent('角色乙');
  expect(reads()).toHaveLength(1);
  addSecondRole();
  fireEvent.click(within(dialog).getByRole('button', { name: '确定' }));
  await waitFor(() => expect(grants()).toHaveLength(1));
  expect(grants()[0]).toEqual([
    APIS.ACCOUNT_GRANT,
    {
      method: 'POST',
      data: { userId: first.id, roleIds: [roles[1].id, roles[0].id] },
    },
  ]);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('详情失败不假空，重试仍同Modal且连续重试不重复GET', async () => {
  const pending = deferred();
  const fallback = mocks.request.getMockImplementation();
  let attempts = 0;
  mocks.request.mockImplementation(async (url: string, options: unknown) => {
    if (url === `${APIS.ACCOUNT_GET}/${first.id}`)
      return ++attempts === 1
        ? { success: false, message: 'PRIVATE_ERROR' }
        : pending.promise;
    return fallback?.(url, options);
  });
  render(shell(<AccountPage />));
  const dialog = await openGrant();
  const retry = await within(dialog).findByRole('button', {
    name: '重试用户角色',
  });
  expect(dialog).not.toHaveTextContent('PRIVATE_ERROR');
  expect(panels()).toHaveLength(0);
  expect(within(dialog).getByRole('button', { name: '确定' })).toBeDisabled();
  fireEvent.click(retry);
  fireEvent.click(retry);
  await waitFor(() => expect(reads()).toHaveLength(2));
  expect(screen.getByRole('dialog')).toBe(dialog);
  await act(async () => pending.resolve({ success: true, data: owned() }));
  await ready();
  expect(panels()[1]).toHaveTextContent('角色甲');
  expect(grants()).toHaveLength(0);
});

it('候选拒绝有独立错误与重试，保留已读取初选且禁写', async () => {
  const fallback = mocks.request.getMockImplementation();
  let failed = true;
  mocks.request.mockImplementation(async (url: string, options: unknown) => {
    if (url.split('?')[0] === APIS.ROLE_LIST && failed)
      return { success: false };
    return fallback?.(url, options);
  });
  render(shell(<AccountPage />));
  const dialog = await openGrant();
  expect(
    await within(dialog).findByText('角色列表加载失败'),
  ).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: '确定' })).toBeDisabled();
  expect(panels()).toHaveLength(0);
  failed = false;
  fireEvent.click(within(dialog).getByRole('button', { name: '重试候选角色' }));
  await ready();
  expect(panels()[1]).toHaveTextContent('角色甲');
  expect(reads()).toHaveLength(1);
  expect(grants()).toHaveLength(0);
});

it('关闭甲加载再看乙，旧甲不覆盖；重开同一用户重新读取初选', async () => {
  const old = deferred();
  const fallback = mocks.request.getMockImplementation();
  mocks.request.mockImplementation(async (url: string, options: unknown) =>
    url === `${APIS.ACCOUNT_GET}/${first.id}`
      ? old.promise
      : fallback?.(url, options),
  );
  render(shell(<AccountPage />));
  const firstDialog = await openGrant();
  fireEvent.click(closeButton(firstDialog));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  const secondDialog = await openGrant('用户乙');
  await ready();
  expect(panels()[1]).toHaveTextContent('角色乙');
  await act(async () => old.resolve({ success: true, data: owned() }));
  expect(screen.getByRole('dialog')).toBe(secondDialog);
  expect(panels()[1]).not.toHaveTextContent('角色甲');
  fireEvent.click(closeButton(secondDialog));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await openGrant('用户乙');
  await ready();
  expect(reads(second.id)).toHaveLength(2);
  expect(grants()).toHaveLength(0);
});

it('同用户关闭重开时旧读取不能回填新窗口', async () => {
  const old = deferred();
  const fresh = deferred();
  const fallback = mocks.request.getMockImplementation();
  let attempts = 0;
  mocks.request.mockImplementation(async (url: string, options: unknown) =>
    url === `${APIS.ACCOUNT_GET}/${first.id}`
      ? ++attempts === 1
        ? old.promise
        : fresh.promise
      : fallback?.(url, options),
  );
  render(shell(<AccountPage />));
  const previous = await openGrant();
  fireEvent.click(closeButton(previous));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  const current = await openGrant();
  await act(async () => old.resolve({ success: true, data: owned() }));
  expect(screen.getByRole('dialog')).toBe(current);
  expect(panels()).toHaveLength(0);
  expect(within(current).getByRole('button', { name: '确定' })).toBeDisabled();
  await act(async () =>
    fresh.resolve({ success: true, data: owned(first, roles[1]) }),
  );
  await ready();
  expect(panels()[1]).toHaveTextContent('角色乙');
  expect(panels()[1]).not.toHaveTextContent('角色甲');
  expect(reads()).toHaveLength(2);
});

it('候选刷新和同目标迟到详情对象不覆盖用户已改勾选', async () => {
  const close = vi.fn();
  const contents = (item: GrantFixture, loading = false) =>
    shell(
      <RoleModal
        open
        targetId={first.id}
        currentItem={item}
        roles={roles}
        rolesLoading={loading}
        onClose={close}
      />,
    );
  const view = render(contents(owned()));
  await ready();
  addSecondRole();
  view.rerender(contents({ ...first, roles: [] }, true));
  expect(screen.getByRole('button', { name: '确定' })).toBeDisabled();
  view.rerender(contents({ ...first, roles: [] }));
  await ready();
  expect(panels()[1]).toHaveTextContent('角色甲');
  expect(panels()[1]).toHaveTextContent('角色乙');
  fireEvent.click(screen.getByRole('button', { name: '确定' }));
  await waitFor(() => expect(grants()).toHaveLength(1));
  expect(grants()[0][1].data.roleIds).toEqual([roles[1].id, roles[0].id]);
});

it('授权失败保选中可重试，保存期间防重复/关闭，旧保存不关闭新目标', async () => {
  const saving = deferred();
  const close = vi.fn();
  const fallback = mocks.request.getMockImplementation();
  mocks.request.mockImplementation(async (url: string, options: unknown) =>
    url === APIS.ACCOUNT_GRANT ? saving.promise : fallback?.(url, options),
  );
  const contents = (item: GrantFixture) =>
    shell(
      <RoleModal
        open
        targetId={item.id}
        currentItem={item}
        roles={roles}
        onClose={close}
      />,
    );
  const view = render(contents(owned()));
  await ready();
  const submit = screen.getByRole('button', { name: '确定' });
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(grants()).toHaveLength(1);
  expect(closeButton()).toBeDisabled();
  view.rerender(contents(owned(second, roles[1])));
  await ready();
  await act(async () => saving.resolve({ success: false }));
  expect(close).not.toHaveBeenCalled();
  expect(panels()[1]).toHaveTextContent('角色乙');
  expect(screen.getByRole('button', { name: '确定' })).not.toBeDisabled();
});

it('当前目标授权失败保输入，重试原角色写载荷不清空', async () => {
  const close = vi.fn();
  const fallback = mocks.request.getMockImplementation();
  let attempts = 0;
  mocks.request.mockImplementation(async (url: string, options: unknown) => {
    if (url === APIS.ACCOUNT_GRANT && ++attempts === 1)
      throw new Error('PRIVATE_POST_BODY');
    return fallback?.(url, options);
  });
  render(
    shell(
      <RoleModal
        open
        targetId={first.id}
        currentItem={owned()}
        roles={roles}
        onClose={close}
      />,
    ),
  );
  await ready();
  addSecondRole();
  fireEvent.click(screen.getByRole('button', { name: '确定' }));
  await screen.findByText('授权失败，请重试');
  expect(screen.getByRole('dialog')).not.toHaveTextContent('PRIVATE_POST_BODY');
  expect(close).not.toHaveBeenCalled();
  expect(panels()[1]).toHaveTextContent('角色乙');
  fireEvent.click(screen.getByRole('button', { name: '确定' }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(grants()).toHaveLength(2);
  expect(grants()[1][1].data).toEqual({
    userId: first.id,
    roleIds: [roles[1].id, roles[0].id],
  });
});
