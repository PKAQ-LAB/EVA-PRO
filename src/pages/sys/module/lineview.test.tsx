import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { expect, it, vi } from 'vitest';
import type { ModuleResource } from './data.d';
import ModuleLines from './linelist';

function footer(dialog: HTMLElement) {
  const node = dialog.querySelector<HTMLElement>('.ant-modal-footer');
  if (!node) throw new Error('缺少对话框底部');
  return within(node);
}
function textField(dialog: HTMLElement, label: string) {
  const node = within(dialog)
    .getByText(label, { selector: 'label' })
    .closest('.ant-form-item')
    ?.querySelector<HTMLElement>('.ant-form-item-control');
  if (!node) throw new Error(`缺少字段：${label}`);
  return node;
}

vi.mock('@umijs/max', () => ({
  useModel: () => ({
    initialState: { dict: { RESOURCE_TYPE: { GET: '读取' } } },
  }),
}));
const line = {
  id: '1234567890123456789',
  resourceDesc: '合法资源快照',
  resourceUrl: '/safe',
  resourceType: 'GET',
};
function rows(readOnly: boolean, setLines: (lines: ModuleResource[]) => void) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <ModuleLines lines={[line]} setLines={setLines} readOnly={readOnly} />
      </App>
    </ConfigProvider>
  );
}

it('只读父资源行沿原500 Modal仅查看三个真实业务字段，控件/Enter/submit/关闭无写入', async () => {
  const setLines = vi.fn();
  render(rows(true, setLines));
  expect(screen.queryByRole('button', { name: /新增资源/ })).toBeNull();
  expect(screen.queryByText('编辑')).toBeNull();
  expect(screen.queryByText('删除')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /查\s*看/ }));
  const dialog = await screen.findByRole('dialog', { name: '查看资源' });
  expect(dialog).toHaveStyle({ width: '500px' });
  expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(3);
  expect(dialog.querySelector('.ant-skeleton-node')).toBeNull();
  expect(textField(dialog, '资源描述')).toHaveTextContent(line.resourceDesc);
  expect(textField(dialog, '资源路径')).toHaveTextContent('/safe');
  expect(textField(dialog, '资源类型')).toHaveTextContent('读取');
  for (const label of ['创建人', '创建时间', '修改人', '修改时间']) {
    expect(within(dialog).queryByText(label, { selector: 'label' })).toBeNull();
  }
  expect(
    dialog.querySelector('form,input,textarea,select,[role="combobox"]'),
  ).toBeNull();
  expect(
    within(dialog).queryByRole('button', { name: /提\s*交|确\s*定/ }),
  ).toBeNull();
  fireEvent.submit(dialog);
  fireEvent.keyDown(dialog, { key: 'Enter' });
  fireEvent.click(footer(dialog).getByRole('button', { name: /关\s*闭/ }));
  expect(setLines).not.toHaveBeenCalled();
});

it('删除确认已打开后父模式改readonly，旧确认回调不能写', async () => {
  const setLines = vi.fn();
  const view = render(rows(false, setLines));
  fireEvent.click(screen.getByText('删除'));
  const confirmation = await screen.findByRole('dialog');
  view.rerender(rows(true, setLines));
  await act(async () =>
    fireEvent.click(
      within(confirmation).getByRole('button', { name: /确\s*定/ }),
    ),
  );
  expect(setLines).not.toHaveBeenCalled();
});

it('资源查看切回原编辑恢复字段和提交，原快照不变', async () => {
  const setLines = vi.fn();
  render(rows(false, setLines));
  fireEvent.doubleClick(screen.getByText(line.resourceDesc));
  const dialog = await screen.findByRole('dialog', { name: '查看资源' });
  fireEvent.click(footer(dialog).getByRole('button', { name: /关\s*闭/ }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(screen.getByText('编辑'));
  expect(screen.getByLabelText('资源描述')).toBeEnabled();
  expect(screen.queryByLabelText('创建人')).toBeNull();
  fireEvent.change(screen.getByLabelText('资源描述'), {
    target: { value: '编辑资源' },
  });
  fireEvent.click(screen.getByRole('button', { name: /提\s*交/ }));
  await waitFor(() => expect(setLines).toHaveBeenCalledOnce());
  expect(setLines.mock.calls[0][0][0]).toMatchObject({
    id: line.id,
    resourceDesc: '编辑资源',
    resourceType: 'GET',
    resourceUrl: '/safe',
  });
  expect(line.resourceDesc).toBe('合法资源快照');
});
