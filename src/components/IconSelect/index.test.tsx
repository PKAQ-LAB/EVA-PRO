import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ConfigProvider, Form } from 'antd';
import { afterEach, expect, it, vi } from 'vitest';
import IconSelect from './index';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('真实右侧图标按钮展开原面板并回填Form、关闭；面板外宽跟随整体输入宽度变化', async () => {
  let measuredWidth = 440;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () => new DOMRect(0, 0, measuredWidth, 32),
  );
  const observers: Array<{
    callback: ResizeObserverCallback;
    target?: Element;
    disconnect: () => void;
  }> = [];
  class Observer {
    record: (typeof observers)[number];
    constructor(callback: ResizeObserverCallback) {
      this.record = { callback, disconnect: vi.fn() };
      observers.push(this.record);
    }
    observe(target: Element) {
      this.record.target = target;
    }
    unobserve() {}
    disconnect() {
      this.record.disconnect();
    }
  }
  vi.stubGlobal('ResizeObserver', Observer);
  const view = render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <Form initialValues={{ icon: 'setting' }}>
        <Form.Item label="图标" name="icon">
          <IconSelect />
        </Form.Item>
      </Form>
    </ConfigProvider>,
  );
  const input = screen.getByLabelText('图标');
  const button = screen.getByRole('button', { name: '选择图标' });
  expect(input).toHaveValue('setting');
  expect(button.tagName).toBe('BUTTON');
  expect(input.closest('.ant-space-compact')?.lastElementChild).toBe(button);
  button.focus();
  expect(button).toHaveFocus();
  fireEvent.click(button);
  const panel = await screen.findByRole('group', { name: '图标面板' });
  expect(button).toHaveAttribute('aria-expanded', 'true');
  const popup = panel.closest<HTMLElement>('.ant-popover');
  expect(popup?.style.width).toBe('440px');
  const anchor = input.closest('.ant-space-compact')?.parentElement;
  const ownObserver = observers.find((observer) => observer.target === anchor);
  expect(ownObserver).toBeDefined();
  measuredWidth = 280;
  act(() => {
    ownObserver?.callback([], {} as ResizeObserver);
  });
  await waitFor(() => expect(popup?.style.width).toBe('280px'));
  fireEvent.click(within(panel).getByRole('button', { name: 'step-backward' }));
  expect(input).toHaveValue('step-backward');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  await waitFor(() => expect(popup).toHaveClass('ant-popover-hidden'));
  view.unmount();
  expect(ownObserver?.disconnect).toHaveBeenCalled();
});

it('禁用时输入和右侧按钮不接受选择，恢复后仍能取消面板', async () => {
  const onChange = vi.fn();
  const view = render(
    <IconSelect
      id="disabled-icon"
      disabled
      value="setting"
      onChange={onChange}
    />,
  );
  expect(document.getElementById('disabled-icon')).toBeDisabled();
  expect(screen.getByRole('button', { name: '选择图标' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '选择图标' }));
  expect(
    screen.queryByRole('group', { name: '图标面板' }),
  ).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
  view.rerender(
    <IconSelect id="disabled-icon" value="setting" onChange={onChange} />,
  );
  fireEvent.click(screen.getByRole('button', { name: '选择图标' }));
  const panel = await screen.findByRole('group', { name: '图标面板' });
  fireEvent.keyDown(panel, { key: 'Escape' });
  expect(screen.getByRole('button', { name: '选择图标' })).toHaveFocus();
  expect(screen.getByRole('button', { name: '选择图标' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});
