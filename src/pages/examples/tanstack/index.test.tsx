import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider, theme } from 'antd';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import LocalRecordsPage from './index';
import { storageKey } from './service';

function textField(dialog: HTMLElement, label: string) {
  const node = within(dialog)
    .getByText(label, { selector: 'label' })
    .closest('.ant-form-item')
    ?.querySelector<HTMLElement>('.ant-form-item-control');
  if (!node) throw new Error(`缺少字段：${label}`);
  return node;
}

const mocks = vi.hoisted(() => ({ block: vi.fn(), request: vi.fn() }));
vi.mock('@umijs/max', () => ({
  history: { block: mocks.block },
  request: mocks.request,
}));
vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
}));
const clients: QueryClient[] = [];
function show(dark = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <ConfigProvider
        componentSize="small"
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: { motion: false },
        }}
      >
        <App>
          <LocalRecordsPage />
        </App>
      </ConfigProvider>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  localStorage.clear();
  mocks.block.mockReturnValue(vi.fn());
});
afterEach(() => {
  onlineManager.setOnline(true);
  for (const client of clients) client.clear();
  clients.length = 0;
});
async function search(code: string) {
  fireEvent.change(screen.getByLabelText('名称或编码'), {
    target: { value: code },
  });
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
}

it.each([false, true])(
  '双击TanStack记录只读查看且不写存储，独立编辑入口保留（暗色=%s）',
  async (dark) => {
    show(dark);
    const cell = await screen.findByText('DEMO_01');
    const snapshot = localStorage.getItem(storageKey);
    const writes = vi.spyOn(localStorage, 'setItem');
    writes.mockClear();
    fireEvent.doubleClick(cell);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('查看记录');
    expect(dialog.parentElement).toHaveStyle({ width: '560px' });
    expect(textField(dialog, '编码')).toHaveTextContent('DEMO_01');
    expect(
      dialog.querySelector('form,input,textarea,select,[role="combobox"]'),
    ).toBeNull();
    for (const label of ['创建人', '创建时间', '修改人', '修改时间'])
      expect(textField(dialog, label)).toHaveTextContent('—');
    expect(
      within(dialog).queryByRole('button', { name: /保\s*存/ }),
    ).toBeNull();
    expect(dialog.querySelector('[type="submit"]')).toBeNull();
    fireEvent.submit(dialog);
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
    fireEvent.click(within(dialog).getByRole('button', { name: /关\s*闭/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(writes).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBe(snapshot);
    expect(mocks.request).not.toHaveBeenCalled();
    const row = cell.closest('tr');
    if (!row) throw new Error('没有找到记录行');
    fireEvent.click(within(row).getByRole('button', { name: '编辑' }));
    expect(
      await screen.findByRole('textbox', { name: '名称' }),
    ).toBeInTheDocument();
  },
);

it.each([false, true])(
  '真实TanStack CRUD/校验/失败保留/刷新持久化，主题dark=%s',
  async (dark) => {
    const page = show(dark);
    await screen.findByText('DEMO_01');
    fireEvent.click(screen.getByRole('button', { name: '新增记录' }));
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    expect(
      await screen.findByText('请输入 1–50 个字符的名称'),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: '名称' }), {
      target: { value: '本地新增' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '编码' }), {
      target: { value: 'TEST_LOCAL' },
    });
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await search('TEST_LOCAL');
    expect(await screen.findByText('本地新增')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '编辑' }));
    fireEvent.change(screen.getByRole('textbox', { name: '名称' }), {
      target: { value: '失败仍保留' },
    });
    const write = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    expect(
      await screen.findByText('保存失败，浏览器存储不可用或空间不足'),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '名称' })).toHaveValue(
      '失败仍保留',
    );
    expect(screen.getByText('本地新增')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    write.mockRestore();
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    page.unmount();
    show(dark);
    await screen.findByText('DEMO_01');
    await search('TEST_LOCAL');
    expect(await screen.findByText('失败仍保留')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '删除' }));
    const confirm = await screen.findByRole('dialog');
    fireEvent.click(within(confirm).getByRole('button', { name: /删\s*除/ }));
    await waitFor(() => expect(screen.queryByText('失败仍保留')).toBeNull());
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]')).toHaveLength(
      12,
    );
    expect(mocks.request).not.toHaveBeenCalled();
  },
);

it('TanStack行模型实际分页、排序、过滤空态与重置，操作列居中且默认紧密', async () => {
  show();
  await screen.findByText('DEMO_01');
  expect(screen.queryByText('DEMO_12')).toBeNull();
  fireEvent.click(screen.getByTitle('2'));
  expect(await screen.findByText('DEMO_12')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  await screen.findByText('DEMO_01');
  fireEvent.click(screen.getAllByRole('columnheader', { name: '编码' })[0]);
  fireEvent.click(screen.getAllByRole('columnheader', { name: '编码' })[0]);
  await waitFor(() =>
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('DEMO_12'),
  );
  await search('NOT_PRESENT');
  expect(await screen.findByText('暂无记录')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  expect(screen.getByLabelText('名称或编码')).toHaveValue('');
  await screen.findByText('DEMO_01');
  expect(screen.getByRole('table').closest('.ant-table')).toHaveClass(
    'ant-table-small',
  );
  expect(screen.getByRole('columnheader', { name: '操作' })).toHaveStyle({
    textAlign: 'center',
  });
  fireEvent.mouseDown(screen.getByLabelText('状态'));
  const dropdown = document.querySelector<HTMLElement>(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
  );
  if (!dropdown) throw new Error('没有找到状态下拉选项');
  fireEvent.click(within(dropdown).getByText('停用'));
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  expect(await screen.findByText('共 4 条')).toBeInTheDocument();
  expect(screen.queryByText('DEMO_02')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  expect(await screen.findByText('共 12 条')).toBeInTheDocument();
});

it('离线仍可读取和保存本地记录，不触发后台请求', async () => {
  onlineManager.setOnline(false);
  localStorage.setItem(storageKey, '[]');
  show();
  await screen.findByText('暂无记录');
  fireEvent.click(screen.getByRole('button', { name: '新增记录' }));
  fireEvent.change(screen.getByRole('textbox', { name: '名称' }), {
    target: { value: '离线记录' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: '编码' }), {
    target: { value: 'OFFLINE' },
  });
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(await screen.findByText('离线记录')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]')).toHaveLength(1);
  expect(mocks.request).not.toHaveBeenCalled();
});

it('损坏存储显示错误重试，不伪装空表或自动清库', async () => {
  localStorage.setItem(storageKey, 'broken');
  show();
  expect(await screen.findByText('本地记录读取失败')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveClass('eva-view-notice');
  expect(screen.queryByRole('table')).toBeNull();
  expect(screen.queryByRole('button', { name: '新增记录' })).toBeNull();
  expect(localStorage.getItem(storageKey)).toBe('broken');
  localStorage.setItem(storageKey, '[]');
  fireEvent.click(screen.getByRole('button', { name: /重\s*试/ }));
  expect(await screen.findByText('暂无记录')).toBeInTheDocument();
});

it('已确认view入口与行内按钮互斥，跨tab失效刷新保留且查看不写本地数据', async () => {
  show();
  const cell = await screen.findByText('DEMO_01');
  const row = cell.closest('tr');
  if (!row) throw new Error('没有找到记录行');
  const button = within(row).getByRole('button', { name: /查\s*看/ });
  fireEvent.doubleClick(button);
  expect(screen.queryByRole('dialog')).toBeNull();
  const writes = vi.spyOn(localStorage, 'setItem');
  writes.mockClear();
  fireEvent.click(button);
  const dialog = await screen.findByRole('dialog');
  expect(textField(dialog, '编码')).toHaveTextContent('DEMO_01');
  fireEvent.submit(dialog);
  expect(writes).not.toHaveBeenCalled();
  const otherTab = [
    {
      id: 'other-tab',
      name: '另一个窗口记录',
      code: 'OTHER_TAB',
      status: 'enabled',
      remark: '',
    },
  ];
  localStorage.setItem(storageKey, JSON.stringify(otherTab));
  writes.mockClear();
  window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
  expect(await screen.findByText('OTHER_TAB')).toBeInTheDocument();
  expect(textField(dialog, '编码')).toHaveTextContent('DEMO_01');
  fireEvent.click(within(dialog).getByRole('button', { name: /关\s*闭/ }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(writes).not.toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]')).toEqual(
    otherTab,
  );
  expect(mocks.request).not.toHaveBeenCalled();
});
