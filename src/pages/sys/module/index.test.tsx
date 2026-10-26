import { fireEvent, render, screen } from '@testing-library/react';
import { App } from 'antd';
import { expect, it, vi } from 'vitest';
import type { ModuleAOEFormProps } from './aoeform';
import SysModulePage from './index';

const mocks = vi.hoisted(() => ({ getModule: vi.fn() }));
vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      {
        id: 'm1',
        name: '模块',
        path: '/0/m1',
        routeUrl: '/sys/module',
        frozen: 0,
      },
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
vi.mock('./service', () => ({ getModule: mocks.getModule }));
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
