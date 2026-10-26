import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from 'antd';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import APIS from '@/apis';
import ErrorLogPage from './index';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (await import('@ant-design/pro-components/es/table')).default,
}));

it('真实错误日志表格可显示分页对象中的记录，翻页及重置保留请求契约', async () => {
  const response = {
    success: true,
    data: {
      records: [
        { id: 'error-a', className: 'ExampleError', exDesc: '示例异常' },
      ],
      total: '41',
      current: '1',
      size: '20',
    },
  };
  mocks.request.mockImplementation(async (url: string) =>
    url === `${APIS.ERROR_GET}/error-a`
      ? {
          success: true,
          data: {
            id: 'error-a',
            className: 'ExampleError',
            exDesc: '示例异常',
          },
        }
      : response,
  );
  render(
    <App>
      <ErrorLogPage />
    </App>,
  );
  expect(await screen.findByText('示例异常')).toBeInTheDocument();
  const beforeView = mocks.request.mock.calls.length;
  fireEvent.doubleClick(screen.getByText('示例异常'));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveTextContent('错误日志明细');
  await waitFor(() => expect(dialog).toHaveTextContent('示例异常'));
  expect(dialog.querySelector('form,input,[type="submit"]')).toBeNull();
  expect(mocks.request.mock.calls).toHaveLength(beforeView + 1);
  expect(mocks.request).toHaveBeenLastCalledWith(`${APIS.ERROR_GET}/error-a`);
  fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
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
    expect(url.searchParams.has('pageCount')).toBe(true);
  });
});
