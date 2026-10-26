import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import BizLogPage from './biz';
import ErrorLogPage from './error';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  useModel: () => ({
    initialState: { dict: { BIZ_OPERATE_TYPE: { QUERY: '查询' } } },
  }),
}));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (await import('@ant-design/pro-components/es/table')).default,
}));
beforeEach(() => {
  mocks.request.mockReset();
});

const cases = [
  {
    kind: 'biz',
    Page: BizLogPage,
    list: APIS.BIZLOG_LIST,
    get: APIS.BIZLOG_GET,
    title: '业务日志明细',
    action: '查看明细',
    labels: ['操作时间', '操作人', '操作类型', '描述'],
  },
  {
    kind: 'error',
    Page: ErrorLogPage,
    list: APIS.ERROR_LIST,
    get: APIS.ERROR_GET,
    title: '错误日志明细',
    action: '查看',
    labels: [
      '记录时间',
      '请求耗时',
      '类名',
      '请求 IP',
      '方法名',
      '方法参数',
      '异常描述',
    ],
  },
];
const record = (id = 'fixture-log') => ({
  id,
  description: `业务描述${id}`,
  operateDatetime: '2026-10-01T10:00:00',
  operator: '夹具操作人',
  operateType: 'QUERY',
  requestTime: '2026-10-01 10:00:00',
  spendTime: 12,
  className: `FixtureClass${id}`,
  ip: '192.0.2.10',
  method: 'fixtureMethod',
  params: '{"fixture":"already-redacted"}',
  exDesc: `夹具异常${id}\n at fixture.method()`,
});
function show(Page: typeof BizLogPage) {
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <Page />
      </App>
    </ConfigProvider>,
  );
}
const assertReadOnly = (dialog: HTMLElement) => {
  expect(
    dialog.querySelector('form,input,textarea,[type="submit"]'),
  ).toBeNull();
  expect(
    within(dialog).queryByRole('button', { name: /保存|提交|授权|删除/ }),
  ).toBeNull();
  fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
  expect(
    mocks.request.mock.calls.every(
      ([, options]) => !options?.method || options.method === 'GET',
    ),
  ).toBe(true);
};

it.each(cases)(
  '$kind原显式入口和双击共用原600抽屉，完整字段及单列有框样式保留',
  async ({ kind, Page, list, get, title, action, labels }) => {
    const detail = record();
    mocks.request.mockImplementation(async (url: string) => {
      if (url.split('?')[0] === list)
        return { success: true, data: { records: [detail], total: 1 } };
      if (url === `${get}/${detail.id}`) return { success: true, data: detail };
      throw new Error('夹具禁止额外接口');
    });
    show(Page);
    const cell = await screen.findByText(
      kind === 'biz' ? detail.description : detail.className,
    );
    const row = cell.closest('tr');
    if (!row) throw new Error('缺少日志行');
    expect(within(row).getAllByRole('button', { name: action })).toHaveLength(
      1,
    );
    fireEvent.click(within(row).getByRole('button', { name: action }));
    const dialog = await screen.findByRole('dialog');
    await waitFor(() =>
      expect(
        dialog.querySelectorAll('.ant-descriptions-item-label'),
      ).toHaveLength(labels.length),
    );
    expect(dialog).toHaveTextContent(title);
    expect(dialog.closest('.ant-drawer-content-wrapper')).toHaveStyle({
      width: '600px',
    });
    expect(
      dialog.querySelector('.ant-descriptions-bordered.ant-descriptions-small'),
    ).not.toBeNull();
    expect(
      Array.from(
        dialog.querySelectorAll('.ant-descriptions-item-label'),
        (label) => label.textContent,
      ),
    ).toEqual(labels);
    expect(dialog.querySelectorAll('.ant-descriptions-row')).toHaveLength(
      labels.length,
    );
    if (kind === 'biz') {
      expect(dialog).toHaveTextContent(detail.description);
      expect(dialog).toHaveTextContent(detail.operator);
      expect(dialog).toHaveTextContent('查询');
      expect(dialog).toHaveTextContent('2026-10-01 10:00:00');
    } else {
      for (const value of [
        detail.requestTime,
        detail.className,
        detail.ip,
        detail.method,
        detail.params,
      ])
        expect(dialog).toHaveTextContent(value);
      expect(dialog.textContent).toContain(detail.exDesc);
      expect(dialog).toHaveTextContent('12');
    }
    assertReadOnly(dialog);
    expect(
      mocks.request.mock.calls.filter(([url]) => url === `${get}/${detail.id}`),
    ).toHaveLength(1);
    fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.doubleClick(cell);
    await waitFor(() =>
      expect(
        within(screen.getByRole('dialog')).getByText(title),
      ).toBeInTheDocument(),
    );
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    await waitFor(() =>
      expect(
        screen
          .getByRole('dialog')
          .querySelectorAll('.ant-descriptions-item-label'),
      ).toHaveLength(labels.length),
    );
    expect(
      mocks.request.mock.calls.filter(([url]) => url === `${get}/${detail.id}`),
    ).toHaveLength(2);
    expect(
      screen.queryByText(kind === 'biz' ? '查看业务日志' : '查看错误日志'),
    ).toBeNull();
  },
);

it.each(
  cases.flatMap((item) =>
    ['network', 'rejected', 'empty'].map((failure) => ({ ...item, failure })),
  ),
)(
  '$kind详情$failure明确失败且不伪装为列表摘要',
  async ({ kind, Page, list, get, failure }) => {
    const item = record();
    mocks.request.mockImplementation(async (url: string) => {
      if (url.split('?')[0] === list)
        return { success: true, data: { records: [item], total: 1 } };
      if (url === `${get}/${item.id}`) {
        if (failure === 'network') throw new Error('PRIVATE_BACKEND_BODY');
        return failure === 'empty'
          ? { success: true, data: null }
          : { success: false, message: 'PRIVATE_BACKEND_BODY' };
      }
      throw new Error('夹具禁止额外接口');
    });
    show(Page);
    fireEvent.doubleClick(
      await screen.findByText(
        kind === 'biz' ? item.description : item.className,
      ),
    );
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '详情读取失败',
    );
    expect(dialog.querySelector('.ant-descriptions')).toBeNull();
    expect(dialog).not.toHaveTextContent('PRIVATE_BACKEND_BODY');
    assertReadOnly(dialog);
  },
);

it.each(cases)(
  '$kind关闭加载后切另一记录，旧详情不能覆盖或重新打开',
  async ({ kind, Page, list, get }) => {
    const first = record('first');
    const second = record('second');
    let complete!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      complete = resolve;
    });
    mocks.request.mockImplementation(async (url: string) => {
      if (url.split('?')[0] === list)
        return { success: true, data: { records: [first, second], total: 2 } };
      if (url === `${get}/${first.id}`) return pending;
      if (url === `${get}/${second.id}`) return { success: true, data: second };
      throw new Error('夹具禁止额外接口');
    });
    show(Page);
    fireEvent.doubleClick(
      await screen.findByText(
        kind === 'biz' ? first.description : first.className,
      ),
    );
    await waitFor(() =>
      expect(
        within(screen.getByRole('dialog')).getByText('加载中...'),
      ).toBeInTheDocument(),
    );
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: /close/i,
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.doubleClick(
      screen.getByText(kind === 'biz' ? second.description : second.className),
    );
    await waitFor(() =>
      expect(screen.getByRole('dialog')).toHaveTextContent(
        kind === 'biz' ? second.description : second.className,
      ),
    );
    await act(async () => complete({ success: true, data: first }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveTextContent(
      kind === 'biz' ? first.description : first.className,
    );
    assertReadOnly(dialog);
  },
);
