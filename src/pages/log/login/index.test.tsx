import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider, theme } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import access from '@/access';
import APIS from '@/apis';
import type { ResourcePermissionUser } from '@/utils/resourcePermission';
import LoginLogPage from './index';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  user: undefined as ResourcePermissionUser | undefined,
  loading: false,
  error: undefined as unknown,
}));
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  useAccess: () => access({ currentUser: mocks.user }),
  useModel: () => ({
    initialState: { currentUser: mocks.user },
    loading: mocks.loading,
    error: mocks.error,
  }),
}));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (await import('@ant-design/pro-components/es/table')).default,
}));
const fixture = {
  id: '2115792898971795458',
  account: 'fixture-user',
  utcCreate: '2026-10-29T12:00:00',
  success: false,
  failReason: '<script>fixture</script>',
  sessionId: 'PRIVATE_SESSION_FIXTURE',
  deviceFingerprint: 'PRIVATE_FINGERPRINT_FIXTURE',
  userAgent: 'PRIVATE_AGENT_FIXTURE',
  tenantId: '42',
};
const grant = (key = 'all') => ({
  resourcePermissionEnabled: true,
  menus: [
    {
      id: 'login-menu',
      routeUrl: '/log/login',
      resources: key === 'all' ? ['list', 'read'] : ['list'],
    },
  ],
});
beforeEach(() => {
  mocks.request.mockReset();
  mocks.user = grant();
  mocks.loading = false;
  mocks.error = undefined;
  mocks.request.mockImplementation(async (url: string) =>
    url.split('?')[0] === APIS.LOGINLOG_LIST
      ? { success: true, data: { records: [fixture], total: '41' } }
      : { success: true, data: fixture },
  );
});
function content(dark = false) {
  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { motion: false },
      }}
    >
      <App>
        <LoginLogPage />
      </App>
    </ConfigProvider>
  );
}

it.each([false, true])(
  '实际列表和只读600详情，固定底色框/字段白名单/失败false保留，暗色=%s',
  async (dark) => {
    render(content(dark));
    await screen.findByText('fixture-user');
    expect(screen.getByText('2026-10-29 12:00:00')).toBeInTheDocument();
    expect(screen.getByText('fixture-user').closest('.ant-table')).toHaveClass(
      'ant-table-bordered',
      'ant-table-small',
    );
    fireEvent.click(screen.getByRole('button', { name: '查看' }));
    const dialog = await screen.findByRole('dialog');
    await within(dialog).findByText('<script>fixture</script>');
    expect(dialog.querySelector('script')).toBeNull();
    expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(21);
    expect(dialog.closest('.ant-drawer-content-wrapper')).toHaveStyle({
      width: '600px',
    });
    expect(
      dialog.querySelector('form,input,textarea,[type="submit"]'),
    ).toBeNull();
    expect(dialog).not.toHaveTextContent('PRIVATE_');
    expect(dialog).not.toHaveTextContent('创建人');
    expect(within(dialog).getByText('失败')).toBeInTheDocument();
    expect(within(dialog).getByText('2026-10-29 12:00:00')).toBeInTheDocument();
    expect(
      mocks.request.mock.calls.filter(
        ([url]) => url === `${APIS.LOGINLOG_GET}/${fixture.id}`,
      ),
    ).toHaveLength(1);
    expect(
      mocks.request.mock.calls.every(
        ([, options]) => !options?.method || options.method === 'GET',
      ),
    ).toBe(true);
  },
);

it.each(['missing-menu', 'unknown', 'loading', 'error'])(
  '%s不调用列表或详情接口',
  (state) => {
    if (state === 'missing-menu')
      mocks.user = { resourcePermissionEnabled: false, access: 'admin' };
    if (state === 'unknown') mocks.user = { menus: grant().menus };
    if (state === 'loading') mocks.loading = true;
    if (state === 'error') mocks.error = new Error('PRIVATE_BOOTSTRAP');
    render(content());
    expect(screen.getByText('无权限查看登录日志')).toBeInTheDocument();
    expect(mocks.request).not.toHaveBeenCalled();
  },
);

it('list-only没有详情入口；分页仍发送pageNo/pageSize且无targetTenantId', async () => {
  mocks.user = grant('list');
  render(content());
  await screen.findByText('fixture-user');
  expect(screen.queryByRole('button', { name: '查看' })).toBeNull();
  fireEvent.click(screen.getByTitle('2'));
  await waitFor(() =>
    expect(
      mocks.request.mock.calls.some(
        ([url]) =>
          new URL(url, 'http://localhost').searchParams.get('pageNo') === '2',
      ),
    ).toBe(true),
  );
  expect(
    mocks.request.mock.calls.every(([url]) => !url.includes('targetTenantId')),
  ).toBe(true);
});

it('详情先显示21个固定骨架，权限撤回后晚响应不复活', async () => {
  let finish: (value: object) => void = () => {};
  mocks.request.mockImplementation((url: string) =>
    url.split('?')[0] === APIS.LOGINLOG_LIST
      ? Promise.resolve({
          success: true,
          data: { records: [fixture], total: 1 },
        })
      : new Promise((resolve) => {
          finish = resolve;
        }),
  );
  const view = render(content());
  await screen.findByText('fixture-user');
  fireEvent.click(screen.getByRole('button', { name: '查看' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('status')).toHaveTextContent('加载中...');
  expect(dialog.querySelectorAll('.eva-view-value .ant-skeleton')).toHaveLength(
    21,
  );
  mocks.user = { access: 'admin', resourcePermissionEnabled: false };
  view.rerender(content());
  await act(async () => finish({ success: true, data: fixture }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  mocks.user = grant();
  view.rerender(content());
  await screen.findByText('fixture-user');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('详情拒绝保固定错误框架，不呈现私有错误响应', async () => {
  mocks.request.mockImplementation(async (url: string) => {
    if (url.split('?')[0] === APIS.LOGINLOG_LIST)
      return { success: true, data: { records: [fixture], total: 1 } };
    throw new Error('PRIVATE_SERVER_ERROR');
  });
  render(content());
  await screen.findByText('fixture-user');
  fireEvent.click(screen.getByRole('button', { name: '查看' }));
  const dialog = await screen.findByRole('dialog');
  expect(await within(dialog).findByRole('alert')).toHaveTextContent(
    '详情读取失败',
  );
  expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(21);
  expect(dialog).not.toHaveTextContent('PRIVATE_');
});

it('查询失败false不是清空条件，重置后分页查询不再携带旧条件', async () => {
  render(content());
  await screen.findByText('fixture-user');
  fireEvent.change(screen.getByLabelText('登录账号'), {
    target: { value: 'filtered-user' },
  });
  fireEvent.mouseDown(screen.getByLabelText('操作结果'));
  fireEvent.click(
    await screen.findByText('失败', {
      selector: '.ant-select-item-option-content',
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  await waitFor(() => {
    const params = new URL(
      mocks.request.mock.calls.at(-1)?.[0],
      'http://localhost',
    ).searchParams;
    expect(params.get('account')).toBe('filtered-user');
    expect(params.get('success')).toBe('false');
  });
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  await waitFor(() => {
    const params = new URL(
      mocks.request.mock.calls.at(-1)?.[0],
      'http://localhost',
    ).searchParams;
    expect(params.has('account')).toBe(false);
    expect(params.has('success')).toBe(false);
  });
});

it('后端列表资格拒绝显示固定错误，无数据或私有错误正文', async () => {
  mocks.request.mockRejectedValue(new Error('PRIVATE_ROLE_DENIED'));
  render(content());
  expect(
    await screen.findByText('登录日志读取失败，请重试'),
  ).toBeInTheDocument();
  expect(screen.queryByText('fixture-user')).toBeNull();
  expect(screen.queryByText('PRIVATE_ROLE_DENIED')).toBeNull();
});
