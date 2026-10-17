import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import SideLayout from './index';

it('折叠时保持同一个按钮并切换可访问名称和展开状态，保留40%布局', () => {
  render(
    <SideLayout title="字典分组" width="40%" body={<div>字典列表</div>}>
      详情
    </SideLayout>,
  );
  const button = screen.getByRole('button', { name: '收起' });
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(
    document.querySelector<HTMLElement>('.ant-layout-sider')?.style.width,
  ).toBe('40%');
  fireEvent.click(button);
  expect(screen.getByRole('button', { name: '展开' })).toBe(button);
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('字典列表')).not.toBeInTheDocument();
  expect(
    document.querySelector<HTMLElement>('.ant-layout-sider')?.style.width,
  ).toBe('45px');
  fireEvent.click(button);
  expect(screen.getByText('字典列表')).toBeInTheDocument();
  expect(
    document.querySelector<HTMLElement>('.ant-layout-sider')?.style.width,
  ).toBe('40%');
});
