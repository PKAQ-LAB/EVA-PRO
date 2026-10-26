import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import OnlinePage from './index';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));
vi.mock('@ant-design/pro-components', async () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (await import('@ant-design/pro-components/es/table')).default,
}));
it('在线记录双击仅展示已读元数据，token/复制区域不触发查看且无详情请求', async () => {
  mocks.request.mockResolvedValue({
    success: true,
    data: [
      {
        id: 'online-a',
        account: 'QA_ONLINE',
        device: '测试设备',
        version: 'fixture-v1',
        loginTime: '2026-10-01T10:00:00',
        issuedAt: '2026-10-01T09:00:00',
        expireAt: '2026-10-01T12:00:00',
        token: 'SECRET_SENTINEL',
      },
    ],
    total: 1,
  });
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <OnlinePage />
      </App>
    </ConfigProvider>,
  );
  await screen.findByText('QA_ONLINE');
  const secret = screen.getByText('SECRET_SENTINEL');
  fireEvent.mouseEnter(secret);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 180));
  });
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(secret.closest('[title]')).toBeNull();
  fireEvent.doubleClick(secret);
  fireEvent.doubleClick(screen.getByRole('button', { name: '复制到剪贴板' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  const requests = mocks.request.mock.calls.length;
  fireEvent.doubleClick(screen.getByText('QA_ONLINE'));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveTextContent('在线用户明细');
  expect(dialog.closest('.ant-drawer-content-wrapper')).toHaveStyle({
    width: '600px',
  });
  expect(
    dialog.querySelector('.ant-descriptions-bordered.ant-descriptions-small'),
  ).not.toBeNull();
  for (const label of [
    '用户名',
    '设备',
    '版本',
    '登录时间',
    '签发时间',
    '过期时间',
  ])
    expect(within(dialog).getByText(label)).toBeInTheDocument();
  expect(within(dialog).getByText('测试设备')).toBeInTheDocument();
  expect(dialog).not.toHaveTextContent('SECRET_SENTINEL');
  expect(dialog.querySelector('form,input,[type="submit"]')).toBeNull();
  expect(mocks.request.mock.calls).toHaveLength(requests);
});
