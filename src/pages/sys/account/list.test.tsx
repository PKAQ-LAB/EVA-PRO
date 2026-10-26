import type { ActionType } from '@ant-design/pro-components';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, type Ref, useImperativeHandle } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import type { AccountItem } from './data.d';
import AccountList from './list';

const mocks = vi.hoisted(() => ({
  view: vi.fn(),
  lockAccounts: vi.fn(),
  getAccount: vi.fn(),
  reload: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  rows: [] as AccountItem[],
}));
vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));
vi.mock('./service', () => ({
  lockAccounts: mocks.lockAccounts,
  getAccount: mocks.getAccount,
  deleteAccounts: vi.fn(),
  queryAccountList: vi.fn(),
}));
vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd')>()),
  App: {
    useApp: () => ({
      message: { success: mocks.success, error: mocks.error },
      modal: {},
    }),
  },
}));
vi.mock('@ant-design/pro-components', () => ({
  ProTable: ({
    columns,
    onRow,
    actionRef,
  }: {
    columns: {
      title: string;
      render?: (value: unknown, record: AccountItem) => ReactNode;
    }[];
    onRow: (record: AccountItem) => { onDoubleClick: () => void };
    actionRef: Ref<Partial<ActionType>>;
  }) => {
    useImperativeHandle(actionRef, () => ({ reload: mocks.reload }));
    return mocks.rows.map((row) => (
      <div key={row.id} data-testid={`row-${row.id}`} {...onRow(row)}>
        {columns
          .find((column) => column.title === '操作')
          ?.render?.(undefined, row)}
      </div>
    ));
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rows = [{ id: 'user-a', account: 'test', name: '测试用户', frozen: 0 }];
  mocks.lockAccounts.mockResolvedValue({ success: true });
  mocks.getAccount.mockResolvedValue({ data: mocks.rows[0] });
});
const show = () => {
  const edit = vi.fn();
  render(
    <AccountList
      selectedRowKeys={[]}
      setSelectedRowKeys={vi.fn()}
      onView={mocks.view}
      onEdit={edit}
      onGrant={vi.fn()}
    />,
  );
  return edit;
};

it('单行锁定传当前ID，双击按钮不查看；行双击改为只读查看', async () => {
  const edit = show();
  const button = screen.getByRole('button', { name: /锁\s*定/ });
  fireEvent.click(button);
  fireEvent.doubleClick(button);
  await waitFor(() =>
    expect(mocks.lockAccounts).toHaveBeenCalledWith(['user-a'], '0001'),
  );
  expect(mocks.lockAccounts).toHaveBeenCalledTimes(1);
  expect(mocks.getAccount).not.toHaveBeenCalled();
  expect(mocks.reload).toHaveBeenCalledTimes(1);
  fireEvent.doubleClick(screen.getByTestId('row-user-a'));
  expect(mocks.view).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'user-a' }),
  );
  expect(edit).not.toHaveBeenCalled();
  expect(mocks.getAccount).not.toHaveBeenCalled();
});

it('已锁定账号仅可单行解锁，保留只读及锁定账号编辑限制', async () => {
  mocks.rows = [
    { id: 'locked', account: 'locked', name: '锁定用户', frozen: 1 },
    { id: 'system', account: 'system', name: '系统用户', frozen: 9999 },
  ];
  show();
  expect(screen.queryByText('编辑')).toBeNull();
  expect(screen.getByTestId('row-system')).toHaveTextContent('查看');
  fireEvent.doubleClick(screen.getByTestId('row-locked'));
  fireEvent.doubleClick(screen.getByTestId('row-system'));
  expect(mocks.view).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: /解\s*锁/ }));
  await waitFor(() =>
    expect(mocks.lockAccounts).toHaveBeenCalledWith(['locked'], '0000'),
  );
});

it('锁定请求期间防重复，失败不刷新且恢复重试按钮', async () => {
  let finish: (result: { success: boolean; message: string }) => void =
    () => {};
  mocks.lockAccounts.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  show();
  const button = screen.getByRole('button', { name: /锁\s*定/ });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(mocks.lockAccounts).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  finish({ success: false, message: '锁定未成功' });
  await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('锁定未成功'));
  expect(mocks.reload).not.toHaveBeenCalled();
  expect(button).not.toBeDisabled();
});
