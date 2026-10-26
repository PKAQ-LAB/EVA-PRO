import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ConfigProvider, Table, theme } from 'antd';
import { expect, it, vi } from 'vitest';
import RecordView, { useRecordView, viewRow } from './index';

type Item = { id: string; name: string };
const deferred = () => {
  let resolve: (response: { success: boolean; data?: Item }) => void = () => {};
  const promise = new Promise<{ success: boolean; data?: Item }>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

function Fixture({
  load,
  dark = false,
}: {
  load: (id: string) => Promise<{ success: boolean; data?: Item }>;
  dark?: boolean;
}) {
  const view = useRecordView<Item>();
  const open = (id: string) => void view.read(id, () => load(id));
  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { motion: false },
      }}
    >
      <button type="button" onClick={() => open('a')}>
        读取A
      </button>
      <button type="button" onClick={() => open('b')}>
        读取B
      </button>
      <button type="button" onClick={() => open('')}>
        空ID
      </button>
      <Table
        rowKey="id"
        dataSource={[
          {
            id: 'a',
            name: '行名称',
            children: [{ id: 'child', name: '子记录' }],
          },
        ]}
        columns={[
          { title: '名称', dataIndex: 'name' },
          {
            title: '操作',
            render: () => (
              <>
                <button type="button">编辑</button>
                <a href="#noop">链接</a>
                <input aria-label="行输入" />
                <span data-no-row-view>复制区域</span>
              </>
            ),
          },
        ]}
        rowSelection={{}}
        onRow={(record) => viewRow(() => open(record.id))}
        pagination={false}
      />
      <RecordView
        title="查看记录"
        view={view}
        items={(record) => [
          { key: 'name', label: '名称', children: record.name },
        ]}
      />
    </ConfigProvider>
  );
}

it.each([false, true])(
  '真实表格双击只读且交互控件/展开不会触发详情（暗色=%s）',
  async (dark) => {
    const load = vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'a', name: '已读取详情', password: 'SECRET_SENTINEL' },
    });
    render(<Fixture load={load} dark={dark} />);
    const expand = document.querySelector('.ant-table-row-expand-icon');
    if (!expand) throw new Error('没有找到真实树展开按钮');
    for (const target of [
      screen.getByText('编辑'),
      screen.getByText('链接'),
      screen.getByLabelText('行输入'),
      screen.getByText('复制区域'),
      screen.getAllByRole('checkbox')[1],
      expand,
    ])
      fireEvent.doubleClick(target);
    expect(load).not.toHaveBeenCalled();
    fireEvent.click(expand);
    expect(await screen.findByText('子记录')).toBeInTheDocument();
    fireEvent.doubleClick(screen.getByText('行名称'));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('已读取详情')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
    expect(
      dialog.querySelector('form,input,textarea,select,[type="submit"]'),
    ).toBeNull();
    expect(dialog).not.toHaveTextContent('SECRET_SENTINEL');
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
    expect(load).toHaveBeenCalledTimes(1);
  },
);

it('切行、关闭、失败与空ID不留下旧详情或恢复过期请求', async () => {
  const first = deferred();
  const second = deferred();
  const third = deferred();
  const load = vi
    .fn()
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)
    .mockReturnValueOnce(third.promise)
    .mockResolvedValue({ success: false });
  render(<Fixture load={load} />);
  fireEvent.click(screen.getByText('空ID'));
  expect(load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('读取A'));
  fireEvent.click(screen.getByText('读取B'));
  await act(async () =>
    second.resolve({ success: true, data: { id: 'b', name: '新详情B' } }),
  );
  expect(await screen.findByText('新详情B')).toBeInTheDocument();
  await act(async () =>
    first.resolve({ success: true, data: { id: 'a', name: '过期详情A' } }),
  );
  expect(screen.queryByText('过期详情A')).toBeNull();
  fireEvent.click(screen.getByText('读取A'));
  expect(screen.queryByText('新详情B')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /关\s*闭/ }));
  await act(async () =>
    third.resolve({ success: true, data: { id: 'a', name: '关闭后详情' } }),
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(screen.getByText('读取B'));
  expect(await screen.findByRole('alert')).toHaveTextContent('详情读取失败');
  expect(screen.queryByText('关闭后详情')).toBeNull();
});
