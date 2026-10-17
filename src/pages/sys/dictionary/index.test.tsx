import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import SideLayout from '@/components/SideLayout';
import DictionaryPage from './index';

vi.mock('@/components', () => ({ SideLayout }));
vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@umijs/max', () => ({
  useModel: () => ({ initialState: {}, setInitialState: vi.fn() }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [], isLoading: false, refetch: vi.fn() }),
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
