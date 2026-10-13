import DensityIcon from '@ant-design/pro-components/es/table/components/ToolBar/DensityIcon';
import {
  TableContext,
  TableProvider,
} from '@ant-design/pro-components/es/table/Store/Provide';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode, useContext } from 'react';
import { expect, it, vi } from 'vitest';

vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd')>()),
  Dropdown: ({
    menu,
  }: {
    menu: {
      selectedKeys: string[];
      onClick: (item: { key: string }) => void;
      items: { key: string; label: string }[];
    };
  }) => (
    <div data-testid="density-menu" data-selected={menu.selectedKeys[0]}>
      {menu.items.map((item) => (
        <button
          type="button"
          key={item.key}
          onClick={() => menu.onClick({ key: item.key })}
        >
          {item.key}
        </button>
      ))}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => children,
}));
function SizeDisplay() {
  return (
    <output data-testid="table-size">
      {useContext(TableContext).tableSize}
    </output>
  );
}

it('真实ProTable初始化及密度菜单从紧密切换中等/宽松，不被默认值锁住', () => {
  const onSizeChange = vi.fn();
  render(
    <TableProvider initValue={{ defaultSize: 'small', onSizeChange }}>
      <DensityIcon />
      <SizeDisplay />
    </TableProvider>,
  );
  expect(screen.getByTestId('table-size')).toHaveTextContent('small');
  expect(screen.getByTestId('density-menu')).toHaveAttribute(
    'data-selected',
    'small',
  );
  fireEvent.click(screen.getByRole('button', { name: 'middle' }));
  expect(screen.getByTestId('table-size')).toHaveTextContent('middle');
  expect(screen.getByTestId('density-menu')).toHaveAttribute(
    'data-selected',
    'middle',
  );
  fireEvent.click(screen.getByRole('button', { name: 'large' }));
  expect(screen.getByTestId('table-size')).toHaveTextContent('large');
  expect(screen.getByTestId('density-menu')).toHaveAttribute(
    'data-selected',
    'large',
  );
  expect(onSizeChange.mock.calls.map(([size]) => size)).toEqual([
    'middle',
    'large',
  ]);
});
