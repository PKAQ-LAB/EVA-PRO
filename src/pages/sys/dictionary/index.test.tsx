import { render, screen } from '@testing-library/react';
import { App, Spin } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import SideLayout from '@/components/SideLayout';
import DictionaryPage from './index';
import DictListView from './list';

const queryState = vi.hoisted(() => ({ loading: false }));
beforeEach(() => {
  queryState.loading = false;
});

vi.mock('@/components', () => ({ SideLayout }));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: (
    await import(
      '@ant-design/pro-components/es/layout/components/PageContainer'
    )
  ).PageContainer,
}));
vi.mock('@umijs/max', () => ({
  useModel: () => ({ initialState: {}, setInitialState: vi.fn() }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [],
    isLoading: queryState.loading,
    refetch: vi.fn(),
  }),
}));
vi.mock('./service', () => ({
  deleteDict: vi.fn(),
  getDict: vi.fn(),
  queryDicts: vi.fn(),
  editDict: vi.fn(),
}));

it('真实字典页面固定40/60结构，分组标题和列表保留且没有任何折叠按钮', () => {
  render(
    <App>
      <DictionaryPage />
    </App>,
  );
  expect(screen.getByText('字典分组')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /^新\s*增$/u }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: '收起' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: '展开' }),
  ).not.toBeInTheDocument();
  const sider = document.querySelector<HTMLElement>('.ant-layout-sider');
  expect(sider?.style.width).toBe('40%');
  expect(sider).not.toHaveClass('ant-layout-sider-collapsed');
  expect(document.querySelector('.side-handle')).not.toBeInTheDocument();
});

it('真实PageContainer为路由列表接入共用高度链，保留GridContent包装和左右面板', () => {
  const view = render(
    <App>
      <DictionaryPage />
    </App>,
  );
  const page = view.container.querySelector(
    '[data-testid="pro-page-container"]',
  );
  expect(page).toHaveClass('eva-list-page');
  expect(
    page?.querySelector(
      '.ant-pro-grid-content-children > .ant-pro-page-container-children-container > .eva-body > .eva-list-side-layout',
    ),
  ).not.toBeNull();
});

it('初始列表加载仍先渲染真实页面、左右面板和表头，完成后沿用同一容器', () => {
  queryState.loading = true;
  const content = () => (
    <App>
      <DictionaryPage />
    </App>
  );
  const view = render(content());
  const page = view.container.querySelector(
    '[data-testid="pro-page-container"]',
  );
  const layout = view.container.querySelector('.eva-side-layout');
  expect(screen.getByText('字典分组')).toBeInTheDocument();
  expect(screen.getByText('字典信息')).toBeInTheDocument();
  expect(screen.getByText('字典明细')).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: '字典描述' }),
  ).toBeInTheDocument();
  expect(screen.getAllByText('加载中...')).not.toHaveLength(0);
  queryState.loading = false;
  view.rerender(content());
  expect(
    view.container.querySelector('[data-testid="pro-page-container"]'),
  ).toBe(page);
  expect(view.container.querySelector('.eva-side-layout')).toBe(layout);
});

it.each([true, false])(
  '字典主表在loading=%s时保留固定表头的DOM与独立Spin',
  (loading) => {
    const view = render(
      <App>
        <DictListView
          data={[{ id: 'layout-only', code: 'LAYOUT', name: '布局测试' }]}
          loading={loading}
          onCreate={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
        <Spin data-testid="other-spin" spinning={loading}>
          <div>其它区域</div>
        </Spin>
      </App>,
    );
    try {
      const table = view.container.querySelector('.eva-page-table');
      const spin = table?.querySelector(':scope > .ant-spin');
      expect(spin).not.toBeNull();
      if (!(spin instanceof HTMLElement))
        throw new Error('缺少真实Table直接Spin');
      expect(spin).toHaveAttribute('aria-busy', String(loading));
      expect(
        spin.querySelector(
          ':scope > .ant-spin-container > .ant-table > .ant-table-container > .ant-table-body',
        ),
      ).not.toBeNull();
      expect(
        screen.getByTestId('other-spin').closest('.eva-page-table'),
      ).toBeNull();
      if (loading)
        expect(spin.querySelector(':scope > .ant-spin-section')).not.toBeNull();
    } finally {
      view.unmount();
    }
  },
);

vi.mock('@/utils/useMenuAccess', async () => ({
  default: (await import('@root/tests/menuAccessFixture')).menuAccessFixture({
    '/sys/dictionary': ['list', 'create', 'update', 'delete'],
  }),
}));
