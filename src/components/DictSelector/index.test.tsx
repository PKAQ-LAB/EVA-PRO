import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ConfigProvider, Modal } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, it, vi } from 'vitest';
import DictSelector from './index';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));
const dict = {
  '0000': '全部数据',
  '0001': '本部门',
  '0002': '部门及下级',
  '0003': '指定部门',
  '0007': '本人',
};
function deferred() {
  let resolve!: (value: unknown) => void;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function selector(code = 'DATA_SCOPE') {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <DictSelector code={code} showall={false} aria-label="数据权限" />
    </ConfigProvider>
  );
}
function open() {
  fireEvent.mouseDown(screen.getByRole('combobox'));
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.request.mockResolvedValue({ success: true, data: dict });
});

it('实际request映射成功五项，无默认选择也不额外补全部', async () => {
  render(selector());
  await waitFor(() => expect(mocks.request).toHaveBeenCalledOnce());
  open();
  const popup = document.querySelector<HTMLElement>('.ant-select-dropdown');
  if (!popup) throw new Error('未打开字典选择器');
  for (const label of Object.values(dict))
    expect(await within(popup).findByText(label)).toBeInTheDocument();
  expect(popup.querySelectorAll('.ant-select-item-option')).toHaveLength(5);
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(mocks.request).toHaveBeenCalledWith(
    '/api/sys/dictionary/query/DATA_SCOPE',
  );
});

it('成功空映射是空态，不能当失败或补ALL', async () => {
  mocks.request.mockResolvedValue({ success: true, data: {} });
  render(selector());
  open();
  expect((await screen.findAllByText('暂无数据')).length).toBeGreaterThan(0);
  expect(screen.queryByText(/字典加载失败/)).toBeNull();
  expect(screen.queryByText('全部')).toBeNull();
});

it.each([
  { response: { success: true, data: undefined } },
  { error: Object.assign(new Error('SECRET_BIZ'), { name: 'BizError' }) },
  { response: { success: false, message: 'SECRET_SERVER_BODY' } },
  { response: { success: true, data: 'SECRET_INVALID_SHAPE' } },
  { error: new Error('SECRET_NETWORK_BODY') },
  {
    error: Object.assign(new Error('SECRET_PERMISSION_BODY'), {
      response: { status: 403 },
    }),
  },
])('错误或未知shape呈失败态而非成功空：%j', async ({ response, error }) => {
  if (error) mocks.request.mockRejectedValue(error);
  else mocks.request.mockResolvedValue(response);
  render(selector());
  open();
  expect(
    await screen.findByText('字典加载失败，请稍后重试'),
  ).toBeInTheDocument();
  expect(screen.queryByText('暂无数据')).toBeNull();
  expect(document.body.textContent).not.toContain('SECRET_');
});

it('延迟完成前显示加载，旧code迟到不能覆盖新code', async () => {
  const old = deferred();
  mocks.request
    .mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce({ success: true, data: { new: '新字典' } });
  const view = render(selector());
  open();
  expect(await screen.findByText('加载中...')).toBeInTheDocument();
  view.rerender(selector('OTHER'));
  expect(await screen.findByText('新字典')).toBeInTheDocument();
  await act(async () =>
    old.resolve({ success: true, data: { old: '旧字典' } }),
  );
  expect(screen.queryByText('旧字典')).toBeNull();
  expect(mocks.request).toHaveBeenCalledTimes(2);
});

it('条件挂载Modal关闭再开，原请求不能覆盖新一轮选项', async () => {
  const old = deferred();
  mocks.request
    .mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce({ success: true, data: dict });
  const content = (show: boolean) =>
    show ? (
      <Modal open footer={null}>
        {selector()}
      </Modal>
    ) : null;
  const view = render(content(true));
  await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1));
  view.rerender(content(false));
  view.rerender(content(true));
  open();
  expect(await screen.findByText('本人')).toBeInTheDocument();
  await act(async () =>
    old.resolve({ success: true, data: { old: '过期内容' } }),
  );
  expect(screen.queryByText('过期内容')).toBeNull();
  expect(mocks.request).toHaveBeenCalledTimes(2);
});

it('内联data优先并保留资源类型映射，JSON错误显示失败且不发请求', async () => {
  const view = render(
    <DictSelector
      code="RESOURCE_TYPE"
      data={{ operation: '操作' }}
      showall={false}
    />,
  );
  open();
  expect(await screen.findByText('操作')).toBeInTheDocument();
  expect(mocks.request).not.toHaveBeenCalled();
  view.rerender(
    <DictSelector code="RESOURCE_TYPE" data="invalid JSON" showall={false} />,
  );
  expect(
    await screen.findByText('字典加载失败，请稍后重试'),
  ).toBeInTheDocument();
  expect(screen.queryByText('操作')).toBeNull();
  expect(mocks.request).not.toHaveBeenCalled();
});

it('保留已有数组响应兼容，不额外添加ALL或默认选择', async () => {
  mocks.request.mockResolvedValue({
    success: true,
    data: [{ value: 'test', name: '已有数组选项' }],
  });
  render(selector());
  open();
  expect(await screen.findByText('已有数组选项')).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(screen.queryByText('全部')).toBeNull();
  expect(mocks.request).toHaveBeenCalledOnce();
});
