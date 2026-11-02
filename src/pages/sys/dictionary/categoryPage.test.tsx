import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import access from '@/access';
import APIS from '@/apis';
import type { ResourcePermissionUser } from '@/utils/resourcePermission';
import type { DictItem } from './data.d';
import Page from './index';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  user: {
    name: 'fixture',
    resourcePermissionEnabled: false,
  } as ResourcePermissionUser,
  writable: true as unknown,
  rows: [] as DictItem[],
}));
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  useAccess: () => access({ currentUser: mocks.user }),
  history: { block: () => vi.fn() },
  useModel: () => ({
    initialState: { currentUser: mocks.user },
    setInitialState: vi.fn(),
  }),
}));
vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/components', async () => ({
  SideLayout: (await import('@/components/SideLayout')).default,
}));
const sys: DictItem = {
  id: '7',
  category: 'SYSTEM',
  readOnly: true,
  frozen: 0,
  code: 'SYS',
  name: '系统项',
  lines: [{ id: 's1', keyName: 'S', keyValue: '系统值' }],
};
const biz: DictItem = {
  id: '7',
  category: 'BUSINESS',
  readOnly: false,
  frozen: 0,
  code: 'BIZ',
  name: '业务项',
  remark: '业务备注',
  lines: [
    { id: 'b1', keyName: 'B', keyValue: '业务值' },
    { id: 'b2', keyName: 'LOCK', keyValue: '只读值', frozen: 9999 },
  ],
};
beforeEach(() => {
  mocks.request.mockReset();
  mocks.user = {
    name: 'fixture',
    resourcePermissionEnabled: false,
    menus: [{ id: 'dict-menu', routeUrl: '/sys/dictionary', resources: [] }],
  };
  mocks.writable = true;
  mocks.rows = [sys, biz];
  mocks.request.mockImplementation(async (url: string) => {
    if (url === APIS.DICT_LIST)
      return {
        success: true,
        businessWritable: mocks.writable,
        data: mocks.rows,
      };
    if (url.includes(`${APIS.DICT_GET}/7`))
      return {
        success: true,
        data: url.includes('category=SYSTEM') ? sys : biz,
      };
    return { success: true };
  });
});
function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const content = () => (
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <QueryClientProvider client={client}>
          <Page />
        </QueryClientProvider>
      </App>
    </ConfigProvider>
  );
  const view = render(content());
  return { ...view, rerenderPage: () => view.rerender(content()) };
}

it('身份切换后旧详情返回不能恢复旧业务项或写权限', async () => {
  let finish: (value: unknown) => void = () => {};
  mocks.request.mockImplementation((url: string) => {
    if (url === APIS.DICT_LIST)
      return Promise.resolve({
        success: true,
        businessWritable: mocks.writable,
        data: mocks.rows,
      });
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const view = show();
  fireEvent.click(await screen.findByText('业务项'));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      `${APIS.DICT_GET}/7?category=BUSINESS`,
    ),
  );
  mocks.user = {
    name: 'another-user',
    resourcePermissionEnabled: false,
    menus: [{ id: 'dict-menu', routeUrl: '/sys/dictionary', resources: [] }],
  };
  mocks.rows = [sys];
  mocks.writable = false;
  view.rerenderPage();
  await waitFor(() => expect(screen.queryByText('业务项')).toBeNull());
  finish({ success: true, data: biz });
  await waitFor(() => expect(screen.queryByLabelText('字典编码')).toBeNull());
  expect(screen.queryByDisplayValue('BIZ')).toBeNull();
  expect(screen.getByRole('button', { name: /^新\s*增$/ })).toBeDisabled();
  expect(
    mocks.request.mock.calls.some(([, options]) => options?.method === 'POST'),
  ).toBe(false);
});

it.each(['wrong-id', 'missing-id', 'missing-success', 'string-success'])(
  '详情%s拒绝切换，保留原草稿且不发写请求',
  async (scenario) => {
    const other = { ...biz, id: '8', name: '另一业务项', code: 'OTHER' };
    mocks.rows = [biz, other];
    mocks.request.mockImplementation(async (url: string) => {
      if (url === APIS.DICT_LIST)
        return { success: true, businessWritable: true, data: mocks.rows };
      if (url.includes(`${APIS.DICT_GET}/7`))
        return { success: true, data: biz };
      return {
        success:
          scenario === 'missing-success'
            ? undefined
            : scenario === 'string-success'
              ? 'true'
              : true,
        data: {
          ...other,
          id:
            scenario === 'wrong-id'
              ? '7'
              : scenario === 'missing-id'
                ? undefined
                : '8',
        },
      };
    });
    show();
    fireEvent.click(await screen.findByText('业务项'));
    const description = await screen.findByLabelText('字典描述');
    fireEvent.change(description, { target: { value: '保留草稿' } });
    fireEvent.click(screen.getByText('另一业务项'));
    fireEvent.click(await screen.findByRole('button', { name: '放弃修改' }));
    await screen.findByText('字典详情加载失败，请重新选择重试');
    expect(screen.getByLabelText('字典编码')).toHaveValue('BIZ');
    expect(screen.getByLabelText('字典描述')).toHaveValue('保留草稿');
    expect(
      mocks.request.mock.calls.some(
        ([, options]) => options?.method === 'POST',
      ),
    ).toBe(false);
  },
);

it.each([undefined, 'true', false])(
  '列表success=%s不采纳可写能力',
  async (success) => {
    mocks.request.mockResolvedValue({
      success,
      businessWritable: true,
      data: [biz],
    });
    show();
    await screen.findByText('字典列表加载失败');
    expect(screen.getByRole('button', { name: /^新\s*增$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /保\s*存/ })).toBeDisabled();
    expect(screen.queryByLabelText('字典编码')).toBeNull();
    expect(
      mocks.request.mock.calls.some(
        ([, options]) => options?.method === 'POST',
      ),
    ).toBe(false);
  },
);

it('两虚根只有展开，不请求；同ID两分类单click正确消歧，系统0也纯文本只读', async () => {
  show();
  await screen.findByText('系统字典');
  fireEvent.click(screen.getByText('系统字典'));
  expect(mocks.request).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('系统项'));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      `${APIS.DICT_GET}/7?category=SYSTEM`,
    ),
  );
  await waitFor(() =>
    expect(screen.getAllByText('SYS').length).toBeGreaterThan(1),
  );
  expect(screen.queryByLabelText('字典编码')).toBeNull();
  expect(screen.getByRole('button', { name: /保\s*存/ })).toBeDisabled();
  fireEvent.click(screen.getByText('业务项'));
  await waitFor(() =>
    expect(screen.getByLabelText('字典编码')).toHaveValue('BIZ'),
  );
  expect(mocks.request).toHaveBeenCalledWith(
    `${APIS.DICT_GET}/7?category=BUSINESS`,
  );
  const locked = screen.getByText('LOCK').closest('tr');
  if (!locked) throw new Error('缺少只读子行');
  expect(within(locked).queryByText('编辑')).toBeNull();
  expect(within(locked).queryByText('删除')).toBeNull();
  expect(within(locked).getByRole('button', { name: /查\s*看/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /保\s*存/ })).toBeEnabled();
  expect(
    mocks.request.mock.calls.some(([url]) => url.includes('category:')),
  ).toBe(false);
});
it.each([undefined, 'true', false])(
  '能力%s缺失/非bool/拒绝时无可写入口，旧分类行不静默丢',
  async (capability) => {
    mocks.writable = capability;
    mocks.rows = [{ id: 'legacy', code: 'OLD', name: '未分类旧项', frozen: 0 }];
    show();
    await screen.findByText('未分类旧项');
    expect(screen.queryByText('系统字典')).toBeNull();
    expect(screen.getByRole('button', { name: /^新\s*增$/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull();
    expect(
      screen.getByText('分类维护契约尚未完整提供，当前字典仅供读取'),
    ).toBeInTheDocument();
  },
);
it('空业务集合真资格仍可新建，POST不含category/readOnly能力或虚根', async () => {
  mocks.rows = [];
  show();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /^新\s*增$/ })).toBeEnabled(),
  );
  expect(screen.getByText('业务字典')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^新\s*增$/ }));
  fireEvent.change(await screen.findByLabelText('字典编码'), {
    target: { value: 'NEW_CODE' },
  });
  fireEvent.change(screen.getByLabelText('字典描述'), {
    target: { value: '新增业务' },
  });
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      APIS.DICT_EDIT,
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({ code: 'NEW_CODE', name: '新增业务' }),
      }),
    ),
  );
  const body = mocks.request.mock.calls.find(
    ([url]) => url === APIS.DICT_EDIT,
  )?.[1]?.data;
  for (const key of [
    'category',
    'readOnly',
    'businessWritable',
    'pid',
    'path',
    'ownerSchema',
  ])
    expect(body).not.toHaveProperty(key);
});

it('维护能力为true也不能绕过具体POST资源，能读取业务项但没有写入口', async () => {
  mocks.user = {
    name: 'fixture',
    resourcePermissionEnabled: true,
    menus: [
      {
        id: 'dict-menu',
        routeUrl: '/sys/dictionary',
        resources: ['list'],
      },
    ],
  };
  show();
  await screen.findByText('业务项');
  fireEvent.click(screen.getByText('业务项'));
  await waitFor(() =>
    expect(screen.getAllByText('BIZ').length).toBeGreaterThan(1),
  );
  expect(screen.queryByLabelText('字典编码')).toBeNull();
  expect(screen.queryByRole('button', { name: /^新\s*增$/ })).toBeNull();
  expect(screen.queryByRole('button', { name: /保\s*存/ })).toBeNull();
  expect(
    mocks.request.mock.calls.some(([, options]) => options?.method === 'POST'),
  ).toBe(false);
});
