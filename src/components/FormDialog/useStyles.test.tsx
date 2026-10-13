import { render } from '@testing-library/react';
import { Button, ConfigProvider, Drawer, Modal, theme } from 'antd';
import { expect, it } from 'vitest';
import useFormDialogStyles from './useStyles';

function Dialogs({ noFooter = false }: { noFooter?: boolean }) {
  const styles = useFormDialogStyles();
  return (
    <>
      <Modal
        open
        title="新增表单"
        styles={styles}
        footer={noFooter ? null : undefined}
      >
        <div>内容</div>
      </Modal>
      <Drawer
        open
        title="新增抽屉"
        styles={styles}
        footer={noFooter ? undefined : <Button>提交</Button>}
      >
        <div>内容</div>
      </Drawer>
    </>
  );
}

it.each(['light', 'realDark'] as const)(
  '%s真实Modal/Drawer使用单条主题灰线并留出标题下方和按钮上方间距',
  (mode) => {
    const algorithm =
      mode === 'realDark' ? theme.darkAlgorithm : theme.defaultAlgorithm;
    const token = theme.getDesignToken({ algorithm });
    const border = `1px solid ${token.colorBorderSecondary}`;
    const view = render(
      <ConfigProvider theme={{ algorithm }}>
        <Dialogs />
      </ConfigProvider>,
    );
    for (const selector of ['.ant-modal-header', '.ant-drawer-header']) {
      const header = document.querySelector<HTMLElement>(selector);
      expect(header?.style.borderBlockEnd).toBe(border);
      expect(header?.style.paddingBlockEnd).toBe(`${token.padding}px`);
      expect(header?.style.paddingBlockStart).toBe('');
      expect(header?.style.paddingInline).toBe('');
      expect(header?.style.padding).toBe('');
    }
    for (const selector of ['.ant-modal-footer', '.ant-drawer-footer']) {
      const footer = document.querySelector<HTMLElement>(selector);
      expect(footer?.style.borderBlockStart).toBe(border);
      expect(footer?.style.paddingBlockStart).toBe(`${token.padding}px`);
      expect(footer?.style.paddingBlockEnd).toBe('');
      expect(footer?.style.paddingInline).toBe('');
      expect(footer?.style.padding).toBe('');
    }
    for (const selector of ['.ant-modal-body', '.ant-drawer-body']) {
      expect(document.querySelector<HTMLElement>(selector)?.style.cssText).toBe(
        '',
      );
    }
    view.unmount();
  },
);

it('局部主题间距定制由真实语义区域消费，不叠加原生padding或设置边框margin', () => {
  const view = render(
    <ConfigProvider theme={{ token: { padding: 20 } }}>
      <Dialogs />
    </ConfigProvider>,
  );
  for (const selector of ['.ant-modal-header', '.ant-drawer-header']) {
    const header = document.querySelector<HTMLElement>(selector);
    expect(header?.style.paddingBlockEnd).toBe('20px');
    expect(header?.style.margin).toBe('');
  }
  for (const selector of ['.ant-modal-footer', '.ant-drawer-footer']) {
    const footer = document.querySelector<HTMLElement>(selector);
    expect(footer?.style.paddingBlockStart).toBe('20px');
    expect(footer?.style.margin).toBe('');
  }
  view.unmount();
});

it('没有原footer时不凭空增加提交区域', () => {
  const view = render(<Dialogs noFooter />);
  expect(document.querySelector('.ant-modal-footer')).toBeNull();
  expect(document.querySelector('.ant-drawer-footer')).toBeNull();
  view.unmount();
});
