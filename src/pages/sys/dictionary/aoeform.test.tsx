import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import DictAOEForm from './aoeform';

const mocks = vi.hoisted(() => ({ editDict: vi.fn() }));
vi.mock('./service', () => ({ editDict: mocks.editDict }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.editDict.mockResolvedValue({ success: true });
});

it.each([{ frozen: 9999 }, { status: '9999' as const }])(
  '真实只读标识禁用主项和全部明细写操作：%j',
  async (marker) => {
    const view = render(
      <App>
        <DictAOEForm
          operateType="edit"
          setOperateType={vi.fn()}
          onSuccess={vi.fn()}
          currentItem={{
            id: 'system',
            code: 'REAL',
            name: '真实字典',
            ...marker,
            lines: [{ keyName: 'a', keyValue: 'A' }],
          }}
        />
      </App>,
    );
    expect(await screen.findByLabelText('字典编码')).toBeDisabled();
    expect(screen.getByRole('button', { name: /保\s*存/u })).toBeDisabled();
    expect(screen.getByRole('button', { name: '新增明细' })).toBeDisabled();
    expect(screen.queryByText('编辑')).not.toBeInTheDocument();
    expect(screen.queryByText('删除')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/u }));
    expect(mocks.editDict).not.toHaveBeenCalled();
    view.rerender(
      <App>
        <DictAOEForm
          operateType="edit"
          setOperateType={vi.fn()}
          onSuccess={vi.fn()}
          currentItem={{ id: 'business', code: 'EDITABLE', name: '可编辑字典' }}
        />
      </App>,
    );
    expect(await screen.findByLabelText('字典编码')).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/u }));
    await waitFor(() =>
      expect(mocks.editDict).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'business',
          code: 'EDITABLE',
          name: '可编辑字典',
          lines: [],
        }),
      ),
    );
  },
);

it('切换只读对象关闭已经打开的明细编辑弹窗', async () => {
  const props = {
    operateType: 'edit' as const,
    setOperateType: vi.fn(),
    onSuccess: vi.fn(),
  };
  const view = render(
    <App>
      <DictAOEForm
        {...props}
        currentItem={{ id: 'business', code: 'EDITABLE', name: '可编辑字典' }}
      />
    </App>,
  );
  fireEvent.click(screen.getByRole('button', { name: '新增明细' }));
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  view.rerender(
    <App>
      <DictAOEForm
        {...props}
        currentItem={{
          id: 'system',
          code: 'READONLY',
          name: '只读字典',
          frozen: 9999,
        }}
      />
    </App>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '新增明细' })).toBeDisabled();
  view.rerender(
    <App>
      <DictAOEForm
        {...props}
        currentItem={{
          id: 'business-2',
          code: 'EDITABLE2',
          name: '可编辑字典2',
        }}
      />
    </App>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
