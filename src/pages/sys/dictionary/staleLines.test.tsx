import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, Form } from 'antd';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import DictAOEForm from './aoeform';
import type { DictItem, DictLine } from './data.d';

const mocks = vi.hoisted(() => ({ editDict: vi.fn() }));
vi.mock('./service', () => ({ editDict: mocks.editDict }));
beforeEach(() => {
  mocks.editDict.mockReset();
  mocks.editDict.mockResolvedValue({ success: true });
});
afterEach(() => vi.restoreAllMocks());

function items() {
  const first: DictItem = {
    id: 'A',
    code: 'A',
    name: '字典A',
    lines: [
      { id: 'A1', keyName: 'a1', keyValue: 'A一' },
      { id: 'A2', keyName: 'a2', keyValue: 'A二' },
    ],
  };
  const second: DictItem = {
    id: 'B',
    code: 'B',
    name: '字典B',
    lines: [{ id: 'B1', keyName: 'b1', keyValue: 'B一' }],
  };
  const readonly: DictItem = {
    id: 'R',
    code: 'R',
    name: '只读字典',
    frozen: 9999,
    lines: [{ keyName: 'r1', keyValue: '只读一' }],
  };
  return { first, second, readonly };
}
function editor(item: DictItem) {
  return (
    <App>
      <DictAOEForm
        operateType="edit"
        setOperateType={vi.fn()}
        onSuccess={vi.fn()}
        currentItem={item}
      />
    </App>
  );
}

it.each(['readonly', 'readonly-B', 'A-B-A', 'unmount'] as const)(
  '旧明细延迟校验期间%s，原对象和当前对象均不被旧结果修改',
  async (scenario) => {
    const { first, second, readonly } = items();
    const snapshot = structuredClone(first);
    const originalUseForm = Form.useForm;
    const useForm = vi
      .spyOn(Form, 'useForm')
      .mockImplementation(originalUseForm);
    const view = render(editor(first));
    fireEvent.click(screen.getAllByText('编辑')[0]);
    const dialog = await screen.findByRole('dialog');
    const lineForm = useForm.mock.results.at(-1)?.value[0];
    expect(lineForm).toBeDefined();
    let finish: (line: DictLine) => void = () => {};
    const pending = new Promise<DictLine>((resolve) => {
      finish = resolve;
    });
    vi.spyOn(lineForm, 'validateFields').mockReturnValue(pending);
    fireEvent.click(within(dialog).getByRole('button', { name: /提\s*交/u }));
    if (scenario === 'unmount') view.unmount();
    else if (scenario === 'A-B-A') {
      view.rerender(editor(second));
      view.rerender(editor(first));
    } else {
      view.rerender(editor(readonly));
      if (scenario === 'readonly-B') view.rerender(editor(second));
    }
    await act(async () => {
      finish({ keyName: 'a1', keyValue: '旧结果污染' });
      await pending;
    });
    expect(first).toEqual(snapshot);
    expect(second.lines).toEqual([
      { id: 'B1', keyName: 'b1', keyValue: 'B一' },
    ]);
    expect(mocks.editDict).not.toHaveBeenCalled();
    if (scenario !== 'unmount') {
      expect(screen.queryByText('旧结果污染')).not.toBeInTheDocument();
      if (scenario === 'readonly-B') {
        expect(screen.getByText('B一')).toBeInTheDocument();
        expect(screen.queryByText('A二')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /保\s*存/u }));
        await waitFor(() =>
          expect(mocks.editDict).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'B', lines: second.lines }),
          ),
        );
      }
    }
  },
);

type Confirmation = Parameters<
  ReturnType<typeof App.useApp>['modal']['confirm']
>[0];
it.each(['readonly', 'readonly-B', 'A-B-A', 'unmount'] as const)(
  '旧删除确认期间%s，确认销毁且旧onOk不能写入当前字典',
  async (scenario) => {
    const { first, second, readonly } = items();
    const snapshot = structuredClone(first);
    const captured: Confirmation[] = [];
    const destroyed = vi.fn();
    const originalUseApp = App.useApp;
    vi.spyOn(App, 'useApp').mockImplementation(() => {
      const context = originalUseApp();
      return {
        ...context,
        modal: {
          ...context.modal,
          confirm: (config) => {
            captured.push(config);
            const confirmation = context.modal.confirm(config);
            const destroy = confirmation.destroy;
            confirmation.destroy = () => {
              destroyed();
              destroy();
            };
            return confirmation;
          },
        },
      };
    });
    const view = render(editor(first));
    fireEvent.click(screen.getAllByText('删除')[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(captured).toHaveLength(1);
    if (scenario === 'unmount') view.unmount();
    else if (scenario === 'A-B-A') {
      view.rerender(editor(second));
      view.rerender(editor(first));
    } else {
      view.rerender(editor(readonly));
      if (scenario === 'readonly-B') view.rerender(editor(second));
    }
    expect(destroyed).toHaveBeenCalled();
    await act(async () => {
      await captured[0].onOk?.();
    });
    if (scenario === 'A-B-A') {
      expect(screen.getByText('A一')).toBeInTheDocument();
      expect(screen.getByText('A二')).toBeInTheDocument();
    }
    expect(first).toEqual(snapshot);
    expect(second.lines).toEqual([
      { id: 'B1', keyName: 'b1', keyValue: 'B一' },
    ]);
    expect(mocks.editDict).not.toHaveBeenCalled();
    if (scenario === 'readonly-B') {
      expect(screen.getByText('B一')).toBeInTheDocument();
      expect(screen.queryByText('A二')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /保\s*存/u }));
      await waitFor(() =>
        expect(mocks.editDict).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'B', lines: second.lines }),
        ),
      );
    }
  },
);

it('正常明细新增编辑删除及主项保存仍有效，编辑不改变原currentItem.lines', async () => {
  const { first } = items();
  const snapshot = structuredClone(first);
  render(editor(first));
  fireEvent.click(screen.getAllByText('编辑')[0]);
  let dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('描述'), {
    target: { value: '编辑后的A一' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: /提\s*交/u }));
  await screen.findByText('编辑后的A一');
  expect(first).toEqual(snapshot);
  fireEvent.click(screen.getByRole('button', { name: '新增明细' }));
  dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('编码'), {
    target: { value: 'a3' },
  });
  fireEvent.change(within(dialog).getByLabelText('描述'), {
    target: { value: 'A三' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: /提\s*交/u }));
  await screen.findByText('A三');
  fireEvent.click(screen.getAllByText('删除')[1]);
  dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: /确\s*定/u }));
  await waitFor(() =>
    expect(screen.queryByText('A二')).not.toBeInTheDocument(),
  );
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/u }));
  await waitFor(() =>
    expect(mocks.editDict).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'A',
        lines: [
          { id: 'A1', keyName: 'a1', keyValue: '编辑后的A一' },
          { keyName: 'a3', keyValue: 'A三', orders: undefined },
        ],
      }),
    ),
  );
  expect(first).toEqual(snapshot);
});
