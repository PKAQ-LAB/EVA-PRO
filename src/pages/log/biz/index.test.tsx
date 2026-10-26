import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider, theme } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import BizLogPage from './index';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  dict: {} as Record<string, unknown>,
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.dict = {};
});
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  useModel: () => ({ initialState: { dict: mocks.dict } }),
}));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (await import('@ant-design/pro-components/es/table')).default,
}));

it.each([false, true])(
  '真实业务日志表格有边框、小密度，records翻页与重置保持契约（暗色=%s）',
  async (dark) => {
    const response = {
      success: true,
      data: {
        records: [
          { id: 'biz-a', description: '示例业务操作', operateType: 'QUERY' },
        ],
        total: '41',
        current: '1',
        size: '20',
      },
    };
    mocks.request.mockImplementation(async (url: string) =>
      url === `${APIS.BIZLOG_GET}/biz-a`
        ? {
            success: true,
            data: {
              id: 'biz-a',
              description: '示例业务操作',
              operateType: 'QUERY',
            },
          }
        : response,
    );
    render(
      <ConfigProvider
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <App>
          <BizLogPage />
        </App>
      </ConfigProvider>,
    );
    expect(await screen.findByText('示例业务操作')).toBeInTheDocument();
    const beforeView = mocks.request.mock.calls.length;
    fireEvent.doubleClick(screen.getByText('示例业务操作'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('业务日志明细');
    await waitFor(() => expect(dialog).toHaveTextContent('示例业务操作'));
    expect(dialog.querySelector('form,input,[type="submit"]')).toBeNull();
    expect(mocks.request.mock.calls).toHaveLength(beforeView + 1);
    expect(mocks.request).toHaveBeenLastCalledWith(`${APIS.BIZLOG_GET}/biz-a`);
    fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('table').closest('.ant-table')).toHaveClass(
      'ant-table-bordered',
      'ant-table-small',
    );
    fireEvent.click(screen.getByTitle('2'));
    await waitFor(() =>
      expect(
        mocks.request.mock.calls.some(
          ([url]) =>
            new URL(url, 'http://localhost').searchParams.get('pageNo') === '2',
        ),
      ).toBe(true),
    );
    fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
    await waitFor(() => {
      const url = new URL(
        mocks.request.mock.calls.at(-1)?.[0],
        'http://localhost',
      );
      expect(url.searchParams.has('begin')).toBe(false);
      expect(url.searchParams.has('end')).toBe(false);
      expect(url.searchParams.has('pageSize')).toBe(true);
      expect(url.searchParams.has('pageCount')).toBe(false);
    });
  },
);

it('真实业务日志自定义字典长文案悬停全文，不新增详情读取或双击查看', async () => {
  const label = '已授权操作类型的完整中文长文案及EnglishLabel'.repeat(12);
  mocks.dict = { BIZ_OPERATE_TYPE: { QUERY: label } };
  mocks.request.mockResolvedValue({
    success: true,
    data: {
      records: [
        {
          id: 'hover-log',
          operateType: 'QUERY',
          description: '已脱敏列表描述',
        },
      ],
      total: 1,
    },
  });
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <BizLogPage />
      </App>
    </ConfigProvider>,
  );
  const trigger = await screen.findByText(label);
  const requests = mocks.request.mock.calls.length;
  fireEvent.mouseEnter(trigger);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent(label);
  fireEvent.doubleClick(tooltip);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(mocks.request.mock.calls).toHaveLength(requests);
});

it.each([false, true])(
  '业务日志空表也保留真实边框类（暗色=%s）',
  async (dark) => {
    mocks.request.mockResolvedValue({
      success: true,
      data: { records: [], total: '0', current: '1', size: '20' },
    });
    render(
      <ConfigProvider
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <App>
          <BizLogPage />
        </App>
      </ConfigProvider>,
    );
    await waitFor(() =>
      expect(
        screen.getByRole('table').querySelector('.ant-table-placeholder'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('table').closest('.ant-table')).toHaveClass(
      'ant-table-bordered',
      'ant-table-small',
    );
  },
);
