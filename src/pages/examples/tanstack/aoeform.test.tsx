import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import AOEForm from './aoeform';

function textField(dialog: HTMLElement, label: string) {
  const node = within(dialog)
    .getByText(label, { selector: 'label' })
    .closest('.ant-form-item')
    ?.querySelector<HTMLElement>('.ant-form-item-control');
  if (!node) throw new Error(`缺少字段：${label}`);
  return node;
}

const mocks = vi.hoisted(() => ({ block: vi.fn(), unblock: vi.fn() }));
vi.mock('@umijs/max', () => ({ history: { block: mocks.block } }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.block.mockReturnValue(mocks.unblock);
});

it('dirty取消/路由/刷新离开均保护，确认放弃才解除导航', async () => {
  const close = vi.fn();
  const view = render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <AOEForm mode="create" record={null} onSave={vi.fn()} onClose={close} />
      </App>
    </ConfigProvider>,
  );
  fireEvent.change(screen.getByLabelText('名称'), {
    target: { value: '未保存' },
  });
  await waitFor(() => expect(mocks.block).toHaveBeenCalled());
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  expect(
    await screen.findByRole('button', { name: '继续编辑' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));
  expect(close).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: '继续编辑' })).toBeNull(),
  );
  const retry = vi.fn();
  mocks.block.mock.calls.at(-1)?.[0]({ retry });
  fireEvent.click(await screen.findByRole('button', { name: '放弃修改' }));
  await waitFor(() => expect(retry).toHaveBeenCalledTimes(1));
  expect(mocks.unblock).toHaveBeenCalled();
  view.unmount();
});

it('保存双击只执行一次、busy不可关闭、失败保留输入与错误', async () => {
  let reject: (error: Error) => void = () => {};
  const save = vi.fn(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  const close = vi.fn();
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <AOEForm mode="create" record={null} onSave={save} onClose={close} />
      </App>
    </ConfigProvider>,
  );
  fireEvent.change(screen.getByLabelText('名称'), {
    target: { value: '测试名称' },
  });
  fireEvent.change(screen.getByLabelText('编码'), {
    target: { value: 'TEST_CODE' },
  });
  const button = screen.getByRole('button', { name: /保\s*存/ });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  expect(close).not.toHaveBeenCalled();
  reject(new Error('模拟保存失败'));
  expect(await screen.findByText('模拟保存失败')).toBeInTheDocument();
  const errorNotice = within(screen.getByRole('dialog')).getByRole('alert');
  expect(errorNotice).toHaveClass('eva-view-notice');
  expect(errorNotice.style.marginBottom).toBe('');
  expect(screen.getByLabelText('名称')).toHaveValue('测试名称');
  expect(screen.getByRole('button', { name: 'Close' })).toHaveClass(
    'ant-drawer-close-end',
  );
});

it('view沿原560 Drawer和字段顺序，四审计缺—，Enter/submit/控件与关闭不保存或拦离开', async () => {
  const save = vi.fn();
  const close = vi.fn();
  const record = {
    id: '1234567890123456789',
    name: '本地查看',
    code: 'LOCAL_VIEW',
    status: 'enabled' as const,
    remark: '原备注',
  };
  const snapshot = structuredClone(record);
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <AOEForm mode="view" record={record} onSave={save} onClose={close} />
      </App>
    </ConfigProvider>,
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog.parentElement).toHaveStyle({ width: '560px' });
  expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(8);
  expect(dialog.querySelector('.eva-view-value-multiline')).toBeInTheDocument();
  expect(dialog.querySelector('.ant-skeleton-node')).toBeNull();
  const labels = Array.from(dialog.querySelectorAll('label')).map(
    (label) => label.textContent,
  );
  expect(labels).toEqual([
    '名称',
    '编码',
    '状态',
    '备注',
    '创建人',
    '创建时间',
    '修改人',
    '修改时间',
  ]);
  expect(textField(dialog, '名称')).toHaveTextContent('本地查看');
  expect(
    dialog.querySelector('form,input,textarea,select,[role="combobox"]'),
  ).toBeNull();
  for (const label of ['创建人', '创建时间', '修改人', '修改时间'])
    expect(textField(dialog, label)).toHaveTextContent('—');
  expect(within(dialog).queryByRole('button', { name: /保\s*存/ })).toBeNull();
  expect(within(dialog).queryByText('审计信息')).toBeNull();
  fireEvent.submit(dialog);
  fireEvent.keyDown(dialog, { key: 'Enter' });
  expect(textField(dialog, '名称')).toHaveTextContent('本地查看');
  expect(save).not.toHaveBeenCalled();
  expect(mocks.block).not.toHaveBeenCalled();
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  fireEvent.click(within(dialog).getByRole('button', { name: /关\s*闭/ }));
  expect(close).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: '放弃修改' })).toBeNull();
  expect(record).toEqual(snapshot);
});

it('view关闭后原记录edit与create重新挂载，输入和保存恢复且无审计载荷', async () => {
  const record = {
    id: '1234567890123456789',
    name: '原名称',
    code: 'LOCAL_EDIT',
    status: 'disabled' as const,
    remark: '备注',
  };
  const save = vi.fn().mockResolvedValue(undefined);
  const close = vi.fn();
  const form = (mode: 'create' | 'edit' | 'view') => (
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <AOEForm
          key={mode}
          mode={mode}
          record={mode === 'create' ? null : record}
          onSave={save}
          onClose={close}
        />
      </App>
    </ConfigProvider>
  );
  const view = render(form('view'));
  view.rerender(form('edit'));
  expect(screen.getByLabelText('名称')).toBeEnabled();
  expect(screen.queryByLabelText('创建人')).toBeNull();
  fireEvent.change(screen.getByLabelText('名称'), {
    target: { value: '修改名称' },
  });
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(save.mock.calls[0][0]).toEqual({
    name: '修改名称',
    code: 'LOCAL_EDIT',
    status: 'disabled',
    remark: '备注',
  });
  view.rerender(form('create'));
  expect(screen.getByLabelText('名称')).toHaveValue('');
  expect(screen.getByLabelText('编码')).toHaveValue('');
  expect(screen.queryByLabelText('创建人')).toBeNull();
});
