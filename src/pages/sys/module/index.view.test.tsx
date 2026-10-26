import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { App } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import type { ModuleAOEFormProps } from './aoeform';
import type { ModuleItem } from './data.d';
import ModulePage from './index';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      { id: '1234567890123456789', name: '列表A' },
      { id: '2234567890123456789', name: '列表B' },
    ],
    isLoading: false,
    refetch: vi.fn(),
  }),
}));
vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: import('react').ReactNode }) =>
    children,
}));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('./service', () => ({ getModule: mocks.get }));
vi.mock('./aoeform', () => ({
  default: ({
    operateType,
    currentItem,
    detailsLoading,
    detailsError,
    onClose,
  }: ModuleAOEFormProps) => (
    <section aria-label="AOE">
      <span>{operateType}</span>
      <span>
        {detailsLoading ? '加载中...' : (detailsError ?? currentItem.name)}
      </span>
      <button type="button" onClick={onClose}>
        关闭AOE
      </button>
    </section>
  ),
}));
beforeEach(() => vi.clearAllMocks());
function deferred() {
  let resolve!: (value: { success: boolean; data: ModuleItem }) => void;
  const promise = new Promise<{ success: boolean; data: ModuleItem }>(
    (done) => {
      resolve = done;
    },
  );
  return { promise, resolve };
}

it('旧view迟响应不盖后view，19位详情ID不转换', async () => {
  const first = deferred();
  const second = deferred();
  mocks.get
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  render(
    <App>
      <ModulePage />
    </App>,
  );
  fireEvent.doubleClick(screen.getByText('列表A'));
  expect(screen.getByLabelText('AOE')).toHaveTextContent('加载中...');
  fireEvent.doubleClick(screen.getByText('列表B'));
  await act(async () =>
    second.resolve({
      success: true,
      data: { id: '2234567890123456789', name: '详情B' },
    }),
  );
  expect(screen.getByLabelText('AOE')).toHaveTextContent('详情B');
  await act(async () =>
    first.resolve({
      success: true,
      data: { id: '1234567890123456789', name: '过期详情A' },
    }),
  );
  expect(screen.getByLabelText('AOE')).toHaveTextContent('详情B');
  expect(mocks.get.mock.calls).toEqual([
    ['1234567890123456789'],
    ['2234567890123456789'],
  ]);
});

it('edit先打开容器显示局部loading，详情返回后使用同一请求key回填', async () => {
  const pending = deferred();
  mocks.get.mockReturnValueOnce(pending.promise);
  render(
    <App>
      <ModulePage />
    </App>,
  );
  fireEvent.click(screen.getAllByText('编辑')[0]);
  const container = screen.getByLabelText('AOE');
  expect(container).toHaveTextContent('edit');
  expect(container).toHaveTextContent('加载中...');
  await act(async () =>
    pending.resolve({
      success: true,
      data: { id: '1234567890123456789', name: '编辑详情' },
    }),
  );
  expect(screen.getByLabelText('AOE')).toBe(container);
  expect(container).toHaveTextContent('编辑详情');
  expect(container).not.toHaveTextContent('加载中...');
});

it('关闭view并新增后迟响应不能重新打开或污染新增', async () => {
  const pending = deferred();
  mocks.get.mockReturnValueOnce(pending.promise);
  render(
    <App>
      <ModulePage />
    </App>,
  );
  fireEvent.doubleClick(screen.getByText('列表A'));
  fireEvent.click(screen.getByRole('button', { name: '关闭AOE' }));
  fireEvent.click(screen.getByRole('button', { name: /新增模块/ }));
  await act(async () =>
    pending.resolve({
      success: true,
      data: { id: '1234567890123456789', name: '旧详情' },
    }),
  );
  expect(screen.getByLabelText('AOE')).toHaveTextContent('create');
  expect(screen.getByLabelText('AOE')).not.toHaveTextContent('旧详情');
});

it('edit迟响应不能覆盖随后打开的view，view读取错误明确展示', async () => {
  const edit = deferred();
  mocks.get
    .mockReturnValueOnce(edit.promise)
    .mockRejectedValueOnce(new Error('403'));
  render(
    <App>
      <ModulePage />
    </App>,
  );
  fireEvent.click(screen.getAllByText('编辑')[0]);
  fireEvent.doubleClick(screen.getByText('列表B'));
  await waitFor(() =>
    expect(screen.getByLabelText('AOE')).toHaveTextContent('详情读取失败'),
  );
  await act(async () =>
    edit.resolve({
      success: true,
      data: { id: '1234567890123456789', name: '迟编辑' },
    }),
  );
  expect(screen.getByLabelText('AOE')).toHaveTextContent('view');
  expect(screen.getByLabelText('AOE')).not.toHaveTextContent('迟编辑');
});
