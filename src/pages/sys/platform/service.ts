import APIS from '@/apis';
import http from '@/utils/http';
import {
  frozenToOrgStatus,
  normalizePageData,
  normalizeTree,
} from '../adapter';
import type { OrgItem } from '../organization/data';
import type { RoleFrozen, RoleItem } from '../role/data';
import type { TenantOption } from './data';

export const platformTenantOptionsQueryKey = [
  'sys',
  'platform',
  'tenants',
  'options',
] as const;

export const platformOrganizationsQueryKey = (tenantId: string) =>
  ['sys', 'platform', 'organizations', tenantId] as const;

export const platformRolesQueryKey = (tenantId: string) =>
  ['sys', 'platform', 'roles', tenantId] as const;

const tenantEndpoint = (template: string, tenantId: string) =>
  template.replace('{tenantId}', encodeURIComponent(tenantId));

export const queryPlatformTenantOptions = () =>
  http
    .list<{ data?: unknown }>(APIS.PLATFORM_TENANT_OPTIONS)
    .then((res) => normalizeTenantOptions(res.data));

export const queryPlatformOrganizations = (tenantId: string) =>
  http
    .list<{ data?: OrgItem[] }>(
      tenantEndpoint(APIS.PLATFORM_TENANT_ORGANIZATIONS, tenantId),
    )
    .then((res) => normalizeTree(res.data, frozenToOrgStatus) as OrgItem[]);

export const queryPlatformRoles = (tenantId: string) =>
  http
    .list<{ data?: unknown }>(
      tenantEndpoint(APIS.PLATFORM_TENANT_ROLES, tenantId),
    )
    .then((res) => {
      const page = normalizePageData<RoleItem>(res.data);
      return page.list.map(normalizePlatformRole);
    });

function normalizeTenantOptions(data: unknown): TenantOption[] {
  const page = normalizePageData<Record<string, unknown>>(data);
  return page.list.flatMap((row) => {
    const id = row.id ?? row.tenantId;
    const name = row.name ?? row.tenantName;
    if (id == null || name == null) return [];
    return [
      {
        id: String(id),
        name: String(name),
        code: row.code == null ? undefined : String(row.code),
      },
    ];
  });
}

function normalizePlatformRole(row: RoleItem): RoleItem {
  const frozen = normalizeFrozen(row.frozen);
  return {
    ...row,
    id: String(row.id),
    frozen,
    status:
      row.status ?? (frozen === 9999 ? '9999' : frozen === 1 ? '0001' : '0000'),
  };
}

function normalizeFrozen(value: unknown): RoleFrozen {
  if (value === 9999 || value === '9999') return 9999;
  if (value === 1 || value === '1') return 1;
  return 0;
}
