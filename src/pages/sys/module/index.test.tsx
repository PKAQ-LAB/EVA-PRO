import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import type { ModuleAOEFormProps } from './aoeform';
import type { ModuleItem } from './data.d';
import SysModulePage from './index';

const mocks = vi.hoisted(() => ({
  getModule: vi.fn(),
  switchModuleStatus: vi.fn(),
  refetch: vi.fn(),
  rows: [] as ModuleItem[],
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rows = [
    {
      id: 'm1',
      name: '模块',
      path: '/0/m1',
      routeUrl: '/sys/module',
      frozen: 0,
    },
  ];
  mocks.switchModuleStatus.mockResolvedValue({ success: true });
});
vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mocks.rows,
    isLoading: false,
    refetch: mocks.refetch,
  }),
}));
vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: import('react').ReactNode }) =>
    children,
}));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('./aoeform', () => ({
  default: ({
    currentItem,
    detailsLoading,
    detailsError,
  }: ModuleAOEFormProps) => (
    <div>
      编辑窗口已打开
      {detailsLoading && <span>加载中...</span>}
      {detailsError && <div role="alert">{detailsError}</div>}
      <input
        aria-label="草稿路由"
        value={currentItem.routeUrl ?? ''}
        readOnly
      />
      <input
        aria-label="草稿父节点"
        value={currentItem.parentId ?? ''}
        readOnly
      />
    </div>
  ),
}));
vi.mock('./service', () => ({
  getModule: mocks.getModule,
  switchModuleStatus: mocks.switchModuleStatus,
}));

it('锁定单请求防重复，失败恢复重试且不刷新，成功刷新', async () => {
  let finish: (value: unknown) => void = () => {};
  mocks.switchModuleStatus.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  render(
    <App>
      <SysModulePage />
    </App>,
  );
  const button = screen.getByRole('button', { name: '锁定' });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(mocks.switchModuleStatus).toHaveBeenCalledExactlyOnceWith(
    'm1',
    '0001',
  );
  finish({ success: false });
  await screen.findByText('状态修改失败，请重试');
  expect(mocks.refetch).not.toHaveBeenCalled();
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(mocks.refetch).toHaveBeenCalledTimes(1));
});

it.each([0, 1] as const)(
  '父状态%s切换需级联确认，冻结父下子不可解锁且9999无状态操作',
  async (frozen) => {
    mocks.rows = [
      {
        id: 'p',
        name: '父模块',
        frozen,
        status: frozen === 1 ? '0001' : '0000',
        children: [
          { id: 'c', parentId: 'p', name: '子模块', frozen: 1, status: '0001' },
        ],
      },
      { id: 'r', name: '只读模块', frozen: 9999, status: '9999' },
    ];
    render(
      <App>
        <SysModulePage />
      </App>,
    );
    const parent = screen.getByText('父模块').closest('tr');
    const child = screen.getByText('子模块').closest('tr');
    const readonly = screen.getByText('只读模块').closest('tr');
    if (!parent || !child || !readonly) throw new Error('模块行缺失');
    expect(
      within(child)
        .getByRole('button', { name: '解锁' })
        .hasAttribute('disabled'),
    ).toBe(frozen === 1);
    expect(within(readonly).queryByRole('button', { name: '锁定' })).toBeNull();
    expect(within(readonly).queryByRole('button', { name: '解锁' })).toBeNull();
    fireEvent.click(
      within(parent).getByRole('button', {
        name: frozen === 1 ? '解锁' : '锁定',
      }),
    );
    expect(
      await screen.findByText(
        '该操作会级联更新所有子孙节点，只读节点保持不变。',
      ),
    ).toBeInTheDocument();
    expect(mocks.switchModuleStatus).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    await waitFor(() =>
      expect(mocks.switchModuleStatus).toHaveBeenCalledExactlyOnceWith(
        'p',
        frozen === 1 ? '0000' : '0001',
      ),
    );
  },
);
it('真实编辑点击的服务器异常被反馈，列表显示routeUrl而非ID路径', async () => {
  mocks.getModule.mockRejectedValue(new Error('服务器发生错误,请联系管理员'));
  render(
    <App>
      <SysModulePage />
    </App>,
  );
  expect(screen.getByText('/sys/module')).toBeInTheDocument();
  expect(screen.queryByText('/0/m1')).toBeNull();
  fireEvent.click(screen.getByText('编辑'));
  expect(screen.getByText('编辑窗口已打开')).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '详情读取失败，请关闭后重试',
  );
  expect(screen.getByText('编辑窗口已打开')).toBeInTheDocument();
});
it('实际新增下级入口只预填父路由和父ID，不带父层级path作为子路由', () => {
  render(
    <App>
      <SysModulePage />
    </App>,
  );
  fireEvent.click(screen.getByText('添加下级'));
  expect(screen.getByLabelText('草稿路由')).toHaveValue('/sys/module');
  expect(screen.getByLabelText('草稿父节点')).toHaveValue('m1');
  expect(screen.queryByDisplayValue('/0/m1')).not.toBeInTheDocument();
});
