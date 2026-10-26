import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { history } from '@umijs/max';
import { App, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import DictionaryPage from './index';

const api = vi.hoisted(() => ({
  queryDicts: vi.fn(),
  getDict: vi.fn(),
  editDict: vi.fn(),
  deleteDict: vi.fn(),
}));
vi.mock('./service', () => api);
vi.mock('@umijs/max', async () => {
  const { createHistory } = await import('@@/core/history');
  return {
    history: createHistory({
      type: 'memory',
      initialEntries: ['/sys/dictionary'],
    }),
    useModel: () => ({ initialState: {}, setInitialState: vi.fn() }),
  };
});
vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/components', async () => ({
  SideLayout: (await import('@/components/SideLayout')).default,
}));

const records = [
  {
    id: 'a',
    name: '字典甲',
    code: 'A',
    lines: [{ id: 'line-a', keyName: 'KEY_A', keyValue: '值甲' }],
  },
  { id: 'b', name: '字典乙', code: 'B', lines: [] },
  { id: 'readonly', name: '内置字典', code: 'SYSTEM', frozen: 9999, lines: [] },
];
beforeEach(() => {
  history.replace('/sys/dictionary');
  vi.clearAllMocks();
  api.queryDicts.mockResolvedValue({ success: true, data: records });
  api.getDict.mockImplementation(async (id: string) => ({
    success: true,
    data: records.find((record) => record.id === id),
  }));
  api.editDict.mockResolvedValue({ success: true });
  api.deleteDict.mockResolvedValue({ success: true });
});

function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <App>
          <DictionaryPage />
        </App>
      </ConfigProvider>
    </QueryClientProvider>,
  );
}
async function select(name = '字典甲') {
  const cell = await screen.findByText(name);
  fireEvent.click(cell);
  await waitFor(() =>
    expect(screen.getByLabelText('字典描述')).toHaveValue(name),
  );
}
function unload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

it('主表单击/键盘加载右编辑，双击不再开查看，搜索保留已选编辑对象', async () => {
  show();
  await select();
  const row = screen.getByRole('row', { name: '选择字典字典甲' });
  expect(row).toHaveAttribute('aria-selected', 'true');
  expect(within(row).queryByText('查看')).toBeNull();
  expect(within(row).queryByText('编辑')).toBeNull();
  fireEvent.doubleClick(screen.getByText('字典甲'));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(api.getDict).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(screen.getByRole('row', { name: '选择字典字典乙' }), {
    key: 'Enter',
  });
  await waitFor(() =>
    expect(screen.getByLabelText('字典描述')).toHaveValue('字典乙'),
  );
  const search = screen.getByPlaceholderText('输入编码或名称进行搜索');
  fireEvent.change(search, { target: { value: '字典甲' } });
  fireEvent.keyDown(search, { key: 'Enter', code: 'Enter' });
  expect(screen.queryByText('字典乙')).toBeNull();
  expect(screen.getByLabelText('字典描述')).toHaveValue('字典乙');
  expect(api.editDict).not.toHaveBeenCalled();
});

it('切换与新增须确认放弃，取消不请求、不清原表单，刷新和路由也保护', async () => {
  show();
  await select();
  fireEvent.change(screen.getByLabelText('字典描述'), {
    target: { value: '未保存甲' },
  });
  expect(unload()).toBe(true);
  fireEvent.click(screen.getByText('字典乙'));
  expect(
    await screen.findByRole('button', { name: '放弃修改' }),
  ).toBeInTheDocument();
  expect(api.getDict).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.getByLabelText('字典描述')).toHaveValue('未保存甲');
  act(() => history.push('/sys/role'));
  expect(history.location.pathname).toBe('/sys/dictionary');
  fireEvent.click(await screen.findByRole('button', { name: '继续编辑' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /^新\s*增$/ }));
  fireEvent.click(await screen.findByRole('button', { name: '放弃修改' }));
  await waitFor(() =>
    expect(screen.getByLabelText('字典描述')).toHaveValue(''),
  );
  expect(unload()).toBe(false);
});

it('明细修改也参与dirty确认，并保留独立编辑入口', async () => {
  show();
  await select();
  const row = screen.getByText('KEY_A').closest('tr');
  if (!row) throw new Error('缺少明细行');
  fireEvent.click(within(row).getByText('编辑'));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('描述'), {
    target: { value: '新值甲' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: /提\s*交/ }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.getByText('新值甲')).toBeInTheDocument();
  fireEvent.click(screen.getByText('字典乙'));
  expect(
    await screen.findByRole('button', { name: '放弃修改' }),
  ).toBeInTheDocument();
  expect(api.getDict).toHaveBeenCalledTimes(1);
});

it('详情失败保留原值和dirty，再次选择可重试；9999只读且无删除', async () => {
  show();
  await select();
  fireEvent.change(screen.getByLabelText('字典描述'), {
    target: { value: '未保存甲' },
  });
  api.getDict.mockRejectedValueOnce(new Error('失败'));
  fireEvent.click(screen.getByText('字典乙'));
  fireEvent.click(await screen.findByRole('button', { name: '放弃修改' }));
  expect(
    await screen.findByText('字典详情加载失败，请重新选择重试'),
  ).toBeInTheDocument();
  expect(screen.getByLabelText('字典描述')).toHaveValue('未保存甲');
  expect(unload()).toBe(true);
  fireEvent.click(screen.getByText('内置字典'));
  fireEvent.click(await screen.findByRole('button', { name: '放弃修改' }));
  await waitFor(() =>
    expect(screen.getByLabelText('字典描述')).toHaveValue('内置字典'),
  );
  expect(screen.getByLabelText('字典描述')).toBeDisabled();
  expect(screen.getByRole('button', { name: /保\s*存/ })).toBeDisabled();
  expect(
    within(screen.getByRole('row', { name: '选择字典内置字典' })).queryByText(
      '删除',
    ),
  ).toBeNull();
  expect(api.editDict).not.toHaveBeenCalled();
});

it('保存期间阻止切换与重复提交，失败保留输入和离开保护', async () => {
  let rejectSave: (reason: Error) => void = () => {};
  api.editDict.mockImplementation(
    () =>
      new Promise((_resolve, reject) => {
        rejectSave = reject;
      }),
  );
  show();
  await select();
  fireEvent.change(screen.getByLabelText('字典描述'), {
    target: { value: '保存中甲' },
  });
  const save = screen.getByRole('button', { name: /保\s*存/ });
  fireEvent.click(save);
  fireEvent.click(save);
  await waitFor(() => expect(api.editDict).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByText('字典乙'));
  expect(api.getDict).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('字典描述')).toBeDisabled();
  await act(async () => rejectSave(new Error('保存失败')));
  await waitFor(() =>
    expect(screen.getByLabelText('字典描述')).not.toBeDisabled(),
  );
  expect(screen.getByLabelText('字典描述')).toHaveValue('保存中甲');
  expect(unload()).toBe(true);
});

it('删除独立确认且不触发行加载；删除当前对象清理右侧选择', async () => {
  show();
  const row = (await screen.findByText('字典乙')).closest('tr');
  if (!row) throw new Error('缺少主表行');
  fireEvent.click(within(row).getByRole('button', { name: /删\s*除/ }));
  expect(api.getDict).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(api.deleteDict).toHaveBeenCalledWith('b'));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await select();
  const selectedRow = screen.getByRole('row', { name: '选择字典字典甲' });
  fireEvent.click(within(selectedRow).getByRole('button', { name: /删\s*除/ }));
  fireEvent.click(await screen.findByRole('button', { name: /确\s*定/ }));
  await waitFor(() =>
    expect(screen.getByLabelText('字典描述')).toHaveValue(''),
  );
  expect(screen.getByLabelText('字典描述')).toBeDisabled();
});

it('详情读取期间阻止覆盖编辑，卸载后旧详情不写回', async () => {
  let resolveDetail: (value: unknown) => void = () => {};
  api.getDict.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveDetail = resolve;
      }),
  );
  const view = show();
  fireEvent.click(await screen.findByText('字典甲'));
  expect(await screen.findByText('加载中...')).toBeInTheDocument();
  fireEvent.click(screen.getByText('字典乙'));
  expect(api.getDict).toHaveBeenCalledTimes(1);
  view.unmount();
  await act(async () => resolveDetail({ success: true, data: records[0] }));
  expect(api.editDict).not.toHaveBeenCalled();
});
