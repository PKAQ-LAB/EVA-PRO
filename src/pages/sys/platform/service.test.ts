import { beforeEach, describe, expect, it, vi } from 'vitest';
import http from '@/utils/http';
import {
  platformOrganizationsQueryKey,
  platformRolesQueryKey,
  queryPlatformOrganizations,
  queryPlatformRoles,
  queryPlatformTenantOptions,
} from './service';

vi.mock('@/utils/http', () => ({
  default: {
    list: vi.fn(),
  },
}));

describe('platform tenant readonly service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the exact platform tenant option endpoint', async () => {
    vi.mocked(http.list).mockResolvedValue({
      data: [{ id: 1, name: '租户一', code: 'tenant-1' }],
    });

    await expect(queryPlatformTenantOptions()).resolves.toEqual([
      { id: '1', name: '租户一', code: 'tenant-1' },
    ]);
    expect(http.list).toHaveBeenCalledWith('/api/sys/platform/tenants/options');
  });

  it('encodes the tenant id in organization and role endpoints', async () => {
    vi.mocked(http.list).mockResolvedValue({ data: [] });

    await queryPlatformOrganizations('tenant/a');
    await queryPlatformRoles('tenant/a');

    expect(http.list).toHaveBeenNthCalledWith(
      1,
      '/api/sys/platform/tenants/tenant%2Fa/organizations',
    );
    expect(http.list).toHaveBeenNthCalledWith(
      2,
      '/api/sys/platform/tenants/tenant%2Fa/roles',
    );
  });

  it('isolates tenant data with tenant-specific query keys', () => {
    expect(platformOrganizationsQueryKey('tenant-1')).not.toEqual(
      platformOrganizationsQueryKey('tenant-2'),
    );
    expect(platformRolesQueryKey('tenant-1')).not.toEqual(
      platformRolesQueryKey('tenant-2'),
    );
    expect(platformOrganizationsQueryKey('tenant-1')).toContain('tenant-1');
    expect(platformRolesQueryKey('tenant-2')).toContain('tenant-2');
  });
});
