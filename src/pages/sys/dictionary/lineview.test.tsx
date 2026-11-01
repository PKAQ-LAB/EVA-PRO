import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider, theme } from 'antd';
import { expect, it, vi } from 'vitest';
import type { DictLine } from './data.d';
import LineList from './linelist';

const labels = ['编码', '描述', '排序', '备注'];
const lines: DictLine[] = [
  {
    id: 'line-a',
    keyName: 'KEY_A',
    keyValue: '原描述',
    orders: 0,
    remark: '已有只读备注',
  },
];
const active = () => true;
const inactive = () => false;
function content(
  setLines: (value: DictLine[]) => void,
  readOnly = false,
  dark = false,
  context = active,
) {
  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { motion: false },
      }}
    >
      <App>
        <LineList
          lines={lines}
          setLines={setLines}
          operateType={readOnly ? 'view' : 'edit'}
          isCurrent={context}
        />
      </App>
    </ConfigProvider>
  );
}
function assertLayout(dialog: HTMLElement) {
  expect(dialog).toHaveStyle({ width: '500px' });
  expect(
    Array.from(
      dialog.querySelectorAll('.ant-form-item-label label'),
      (node) => node.textContent,
    ),
  ).toEqual(labels);
  for (const label of dialog.querySelectorAll<HTMLElement>(
    '.ant-form-item-label',
  ))
    expect(label).toHaveStyle({ flex: '0 0 100px' });
}
it.each([false, true])(
  '三模式同500Modal四行布局，查看0控件/提交/审计伪值，暗色=%s',
  async (dark) => {
    const setLines = vi.fn();
    render(content(setLines, false, dark));
    fireEvent.doubleClick(screen.getByText('KEY_A'));
    let dialog = await screen.findByRole('dialog');
    assertLayout(dialog);
    expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(4);
    expect(
      dialog.querySelector(
        'form,input,textarea,select,[role="combobox"],[type="submit"],[name]',
      ),
    ).toBeNull();
    expect(within(dialog).getByText('0')).toBeInTheDocument();
    expect(dialog).toHaveTextContent('已有只读备注');
    for (const label of ['创建人', '创建时间', '修改人', '修改时间'])
      expect(within(dialog).queryByText(label)).toBeNull();
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
    fireEvent.submit(dialog);
    expect(setLines).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: /关\s*闭/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByText('编辑'));
    dialog = await screen.findByRole('dialog');
    assertLayout(dialog);
    expect(dialog.querySelectorAll('input')).toHaveLength(3);
    expect(within(dialog).getByText('已有只读备注')).toBeInTheDocument();
    expect(within(dialog).queryByLabelText('备注')).toBeNull();
    fireEvent.change(within(dialog).getByLabelText('描述'), {
      target: { value: '已修改' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: /提\s*交/ }));
    await waitFor(() =>
      expect(setLines).toHaveBeenCalledWith([
        { ...lines[0], keyValue: '已修改' },
      ]),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByText('新增明细'));
    dialog = await screen.findByRole('dialog');
    assertLayout(dialog);
    expect(dialog.querySelectorAll('input')).toHaveLength(3);
    expect(within(dialog).getByText('—')).toBeInTheDocument();
  },
);

it('父字典只读仍可显式查看和关闭，isCurrent不可写不影响只读关闭', async () => {
  const setLines = vi.fn();
  render(content(setLines, true, false, inactive));
  expect(screen.queryByText('编辑')).toBeNull();
  expect(screen.getByRole('button', { name: '新增明细' })).toBeDisabled();
  const button = screen.getByRole('button', { name: /查\s*看/ });
  button.focus();
  expect(button).toHaveFocus();
  fireEvent.click(button);
  const dialog = await screen.findByRole('dialog');
  assertLayout(dialog);
  fireEvent.keyDown(dialog, { key: 'Enter' });
  fireEvent.click(within(dialog).getByRole('button', { name: /关\s*闭/ }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(setLines).not.toHaveBeenCalled();
});

it('父上下文切换关闭旧查看，返回原对象也不自动恢复', async () => {
  const setLines = vi.fn();
  const view = render(content(setLines));
  fireEvent.click(screen.getByRole('button', { name: /查\s*看/ }));
  await screen.findByRole('dialog');
  view.rerender(content(setLines, true, false, inactive));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  view.rerender(content(setLines));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(setLines).not.toHaveBeenCalled();
});
