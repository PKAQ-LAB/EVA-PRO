import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import DictionaryLines from './dictionary/linelist';
import ModuleLines from './module/linelist';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  useModel: () => ({
    initialState: { dict: { RESOURCE_TYPE: { GET: 'GET' } } },
  }),
}));
beforeEach(() => {
  mocks.request.mockReset();
  mocks.request.mockResolvedValue({ success: true, data: {} });
});
function textField(dialog: HTMLElement, label: string) {
  const item = within(dialog)
    .getByText(label, { selector: 'label' })
    .closest('.ant-form-item');
  const value = item?.querySelector<HTMLElement>('.ant-form-item-control');
  if (!value) throw new Error(`缺少资源文本字段：${label}`);
  return value;
}
it.each([
  { kind: 'dictionary', readOnly: false },
  { kind: 'module', readOnly: false },
  { kind: 'module', readOnly: true },
])(
  '$kind明细双击/显式查看和Enter不写，原编辑边界保留（readOnly=$readOnly）',
  async ({ kind, readOnly }) => {
    const setLines = vi.fn();
    render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <App>
          {kind === 'dictionary' ? (
            <DictionaryLines
              lines={[{ id: 'line', keyName: 'QA_KEY', keyValue: '描述A' }]}
              setLines={setLines}
              operateType="edit"
              isCurrent={() => true}
            />
          ) : (
            <ModuleLines
              lines={[
                {
                  id: 'line',
                  resourceDesc: 'QA_RESOURCE',
                  resourceUrl: '/safe',
                  resourceType: 'GET',
                  mainId: 'module-parent',
                  code: 'RESOURCE_CODE',
                },
              ]}
              setLines={setLines}
              readOnly={readOnly}
            />
          )}
        </App>
      </ConfigProvider>,
    );
    fireEvent.doubleClick(
      screen.getByText(kind === 'dictionary' ? 'QA_KEY' : 'QA_RESOURCE'),
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(
      kind === 'dictionary' ? '查看字典明细' : '查看资源',
    );
    if (kind === 'dictionary') {
      expect(
        dialog.querySelector('form,input,textarea,[type="submit"]'),
      ).toBeNull();
      expect(dialog).toHaveTextContent('QA_KEY');
      expect(dialog).toHaveTextContent('描述A');
    } else {
      expect(dialog).toHaveStyle({ width: '500px' });
      expect(textField(dialog, '资源描述')).toHaveTextContent('QA_RESOURCE');
      expect(textField(dialog, '资源路径').textContent).toBe('/safe');
      expect(textField(dialog, '资源类型').textContent).toBe('GET');
      for (const label of ['资源描述', '资源路径', '资源类型']) {
        expect(
          textField(dialog, label).querySelector('.eva-view-value'),
        ).not.toBeNull();
      }
      expect(dialog.querySelectorAll('.eva-view-value')).toHaveLength(3);
      for (const label of ['创建人', '创建时间', '修改人', '修改时间']) {
        expect(
          within(dialog).queryByText(label, { selector: 'label' }),
        ).toBeNull();
      }
      expect(
        within(dialog).queryByRole('button', { name: /提\s*交|保\s*存/ }),
      ).toBeNull();
      expect(
        dialog.querySelector(
          'form,input,textarea,select,[role="combobox"],[name]',
        ),
      ).toBeNull();
      expect(
        textField(dialog, '资源描述').closest('.ant-form-item'),
      ).not.toBeNull();
      fireEvent.submit(dialog);
    }
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
    expect(setLines).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: /关\s*闭/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const viewButton = screen.getByRole('button', { name: /查\s*看/ });
    viewButton.focus();
    expect(viewButton).toHaveFocus();
    fireEvent.click(viewButton);
    const keyboardView = await screen.findByRole('dialog');
    expect(keyboardView).toHaveTextContent(
      kind === 'dictionary' ? '查看字典明细' : '查看资源',
    );
    fireEvent.click(
      within(keyboardView).getByRole('button', { name: /关\s*闭/ }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    if (readOnly) {
      expect(screen.queryByText('编辑')).toBeNull();
      expect(screen.queryByText('删除')).toBeNull();
      expect(screen.queryByRole('button', { name: '新增资源' })).toBeNull();
      expect(setLines).not.toHaveBeenCalled();
      expect(
        mocks.request.mock.calls.every(
          ([, options]) => !options?.method || options.method === 'GET',
        ),
      ).toBe(true);
      return;
    }
    fireEvent.click(screen.getByText('编辑'));
    expect(
      await screen.findByRole('textbox', {
        name: kind === 'dictionary' ? '编码' : '资源描述',
      }),
    ).toBeInTheDocument();
    expect(setLines).not.toHaveBeenCalled();
    if (kind === 'module') {
      expect(screen.getByRole('textbox', { name: '资源路径' })).toHaveValue(
        '/safe',
      );
      expect(
        screen.getByRole('textbox', { name: '资源描述' }),
      ).not.toBeDisabled();
    }
    expect(
      mocks.request.mock.calls.every(
        ([, options]) => !options?.method || options.method === 'GET',
      ),
    ).toBe(true);
  },
);
