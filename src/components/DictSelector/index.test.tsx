import { fireEvent, render, screen, within } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  beginDictionarySession,
  type DictionaryState,
  dictionaryFields,
} from '@/utils/dictionaryState';
import DictSelector from './index';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  state: {} as DictionaryState,
}));
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  useModel: () => ({ initialState: mocks.state }),
}));
const user = { id: '1', tenantId: '0' };
const etag = `W/"dict-v1-${'a'.repeat(64)}"`;
const dict = { '0001': '本部门', '0003': '指定部门', '0006': '指定岗位' };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.state = {
    currentUser: user,
    ...dictionaryFields(user, beginDictionarySession(), {
      kind: 'updated',
      data: { DATA_SCOPE: dict },
      etag,
    }),
  };
});
const selector = (props: React.ComponentProps<typeof DictSelector> = {}) => (
  <ConfigProvider locale={zhCN}>
    <DictSelector
      code="DATA_SCOPE"
      showall={false}
      aria-label="数据权限"
      {...props}
    />
  </ConfigProvider>
);
function open() {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const popup = document.querySelector<HTMLElement>('.ant-select-dropdown');
  if (!popup) throw new Error('未打开字典选择器');
  return within(popup);
}
it('本地快照直接映射且多次挂载不发code请求，不默认选择或补ALL', () => {
  const view = render(selector());
  const popup = open();
  for (const label of Object.values(dict))
    expect(popup.getByText(label)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(popup.queryByText('全部')).toBeNull();
  view.unmount();
  render(selector());
  expect(mocks.request).not.toHaveBeenCalled();
});
it('全局快照原子更新后label变化，保存的code与onChange不被改写', () => {
  const change = vi.fn();
  const view = render(selector({ value: '0006', onChange: change }));
  expect(screen.getByText('指定岗位')).toBeInTheDocument();
  mocks.state = {
    ...mocks.state,
    dict: { DATA_SCOPE: { '0006': '新岗位标签' } },
  };
  view.rerender(selector({ value: '0006', onChange: change }));
  expect(screen.getByText('新岗位标签')).toBeInTheDocument();
  expect(screen.queryByText('指定岗位')).toBeNull();
  expect(change).not.toHaveBeenCalled();
  expect(mocks.request).not.toHaveBeenCalled();
});
it('同uid重登或tenant切换拒用旧快照但保留表单code', () => {
  const view = render(selector({ value: '0006' }));
  beginDictionarySession();
  view.rerender(selector({ value: '0006' }));
  expect(screen.queryByText('指定岗位')).toBeNull();
  expect(screen.getByText('0006')).toBeInTheDocument();
  mocks.state = {
    ...mocks.state,
    currentUser: { id: '1', tenantId: '2' },
    dictStatus: 'error',
  };
  view.rerender(selector({ value: '0006' }));
  open();
  expect(screen.getByText('字典暂不可用，请重试')).toBeInTheDocument();
  expect(mocks.request).not.toHaveBeenCalled();
});
it('显式data包括空映射优先，JSON错误失败不回退远程', () => {
  const view = render(selector({ data: { x: '显式' } }));
  expect(open().getByText('显式')).toBeInTheDocument();
  expect(screen.queryByText('指定岗位')).toBeNull();
  view.rerender(selector({ data: {} }));
  expect(screen.getAllByText('暂无数据').length).toBeGreaterThan(0);
  view.rerender(selector({ data: 'SECRET_INVALID_JSON' }));
  expect(screen.getByText('字典暂不可用，请重试')).toBeInTheDocument();
  expect(document.body.textContent).not.toContain('SECRET_');
  expect(mocks.request).not.toHaveBeenCalled();
});
it('可用空map为空态，缺code为失败态，stale保最后正确标签', () => {
  mocks.state = { ...mocks.state, dict: { DATA_SCOPE: {} } };
  const view = render(selector());
  open();
  expect(screen.getAllByText('暂无数据').length).toBeGreaterThan(0);
  mocks.state = { ...mocks.state, dict: {} };
  view.rerender(selector());
  expect(screen.getByText('字典暂不可用，请重试')).toBeInTheDocument();
  mocks.state = {
    ...mocks.state,
    dict: { DATA_SCOPE: dict },
    dictStatus: 'stale',
  };
  view.rerender(selector());
  expect(screen.getByText('指定岗位')).toBeInTheDocument();
});

it('合成全部与真实0000条目均从最终options解析选中标签', () => {
  const view = render(
    selector({ data: { a: '甲' }, showall: true, value: '0000' }),
  );
  expect(screen.getByText('全部')).toBeInTheDocument();
  expect(screen.queryByText('0000')).toBeNull();
  view.rerender(
    selector({ data: { '0000': '真实范围' }, showall: true, value: '0000' }),
  );
  expect(screen.getByText('真实范围')).toBeInTheDocument();
  expect(screen.queryByText('全部')).toBeNull();
  expect(mocks.request).not.toHaveBeenCalled();
});
