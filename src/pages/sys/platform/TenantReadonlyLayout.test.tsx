import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TenantReadonlyLayout from './TenantReadonlyLayout';

const mocks = vi.hoisted(() => ({
  queryPlatformTenantOptions: vi.fn(),
}));

vi.mock('@/components/SideLayout', () => ({
  default: ({ body, children }: { body: ReactNode; children: ReactNode }) => (
    <div>
      <aside>{body}</aside>
      <main>{children}</main>
    </div>
  ),
}));

vi.mock('./service', () => ({
  platformTenantOptionsQueryKey: ['sys', 'platform', 'tenants', 'options'],
  queryPlatformTenantOptions: mocks.queryPlatformTenantOptions,
}));

describe('TenantReadonlyLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects the first tenant and falls back when the selection expires', async () => {
    mocks.queryPlatformTenantOptions.mockResolvedValueOnce([
      { id: 'tenant-1', name: '租户一' },
      { id: 'tenant-2', name: '租户二' },
    ]);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TenantReadonlyLayout>
          {(tenantId) => <div>当前租户：{tenantId}</div>}
        </TenantReadonlyLayout>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('当前租户：tenant-1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('租户二'));
    expect(await screen.findByText('当前租户：tenant-2')).toBeInTheDocument();

    mocks.queryPlatformTenantOptions.mockResolvedValueOnce([
      { id: 'tenant-3', name: '租户三' },
    ]);
    await queryClient.invalidateQueries({
      queryKey: ['sys', 'platform', 'tenants', 'options'],
    });

    expect(await screen.findByText('当前租户：tenant-3')).toBeInTheDocument();
  });
});
