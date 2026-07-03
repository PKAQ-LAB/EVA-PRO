import APIS from '@/apis';
import http from '@/utils/http';
import { normalizePageData, normalizePageParams } from '../adapter';
import type {
  RoleFrozen,
  RoleItem,
  RoleModuleResponse,
  RoleUserResponse,
} from './data.d';

export interface MutationResult {
  success?: boolean;
  message?: string;
  data?: unknown;
}

const normalizeRoleListParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(normalizePageParams(params) ?? {}).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

export const queryRoles = (params: Record<string, unknown>) =>
  http
    .list<{ data?: unknown; success?: boolean }>(
      APIS.ROLE_LIST,
      normalizeRoleListParams(params),
    )
    .then((res) => {
      const page = normalizePageData<RoleItem>(res.data);
      return {
        ...res,
        data: {
          list: page.list.map((row) => normalizeRole(row)),
          total: page.total,
        },
        total: page.total,
      };
    });

export const getRole = (id: string) =>
  http
    .get<{ data?: RoleItem; success?: boolean }>(APIS.ROLE_GET, id)
    .then((res) => ({ ...res, data: res.data && normalizeRole(res.data) }));

export const saveRole = (data: Partial<RoleItem>) =>
  http.post<MutationResult>(APIS.ROLE_SAVE, {
    ...data,
    frozen: normalizeFrozen(data.frozen),
    dataScope: data.dataScope ?? data.dataPermissionType ?? '0000',
    dataOrgIds: Array.isArray(data.dataOrgIds)
      ? data.dataOrgIds.join(',')
      : data.dataOrgIds,
  });

export const deleteRoles = (ids: string[]) =>
  http.post<MutationResult>(APIS.ROLE_DEL, { param: ids });

export const lockRoles = (ids: string[], frozen: Exclude<RoleFrozen, 9999>) =>
  http.post<MutationResult>(APIS.ROLE_LOCK, {
    param: ids,
    frozen,
  });

export const checkRoleUnique = (code: string) =>
  http.post<MutationResult>(APIS.ROLE_CHECKUNIQUE, { code });

export const listRoleModules = (roleId: string) =>
  http
    .list<RoleModuleResponse & { data?: unknown }>(APIS.ROLE_LISTMOUDLE, {
      roleId,
    })
    .then((res) => ({ ...res, data: normalizeRoleModules(res.data) }));

export const saveRoleModules = (
  id: string,
  modules: Array<{ moduleId: string }>,
  resources: Record<string, string[]>,
) =>
  http.post<MutationResult>(APIS.ROLE_SAVEMODULE, {
    roleId: id,
    resourceId: Array.from(
      new Set([
        ...Object.values(resources).flat(),
        ...modules.map((module) => module.moduleId),
      ]),
    ),
  });

export const listRoleUsers = (roleId: string, deptId?: string) =>
  http
    .list<RoleUserResponse & { data?: unknown }>(APIS.ROLE_LISTUSER, {
      roleEntity: roleId,
      deptId,
    })
    .then((res) => ({ ...res, data: normalizeRoleUsers(res.data) }));

export const saveRoleUsers = (id: string, users: Array<{ userId: string }>) =>
  http.post<MutationResult>(APIS.ROLE_SAVEUSER, {
    roleId: id,
    userId: users.map((user) => user.userId),
  });

function normalizeRole(row: RoleItem) {
  const record = row as RoleItem & Record<string, unknown>;
  const frozen = normalizeFrozen(record.frozen);
  const dataScope = String(
    record.dataScope ?? record.dataPermissionType ?? '0000',
  );
  const dataOrgIds = record.dataOrgIds ?? record.dataPermissionDeptid;
  return {
    ...row,
    id: row.id != null ? String(row.id) : row.id,
    frozen,
    status:
      row.status ?? (frozen === 9999 ? '9999' : frozen === 1 ? '0001' : '0000'),
    dataScope,
    dataOrgIds:
      typeof dataOrgIds === 'string' && dataOrgIds
        ? dataOrgIds.split(',')
        : dataOrgIds,
  } as RoleItem;
}

function normalizeFrozen(value: unknown): RoleFrozen {
  if (value === 9999 || value === '9999') return 9999;
  if (value === 1 || value === '1') return 1;
  return 0;
}

function normalizeRoleModules(
  data: unknown,
): NonNullable<RoleModuleResponse['data']> {
  if (Array.isArray(data)) {
    return { modules: data as never[], checked: [], checkedResource: {} };
  }
  const payload = (data || {}) as Record<string, unknown>;
  const modules =
    (payload.modules as never[] | undefined) ??
    (payload.resources as never[] | undefined) ??
    (payload.list as never[] | undefined) ??
    [];
  return {
    modules,
    checked:
      ((payload.checked ?? payload.checkedIds) as string[] | undefined) ?? [],
    checkedResource:
      (payload.checkedResource as Record<string, string[]> | undefined) ?? {},
  };
}

function normalizeRoleUsers(
  data: unknown,
): NonNullable<RoleUserResponse['data']> {
  if (Array.isArray(data)) {
    return { users: data as never[], checked: [] };
  }
  const payload = (data || {}) as Record<string, unknown>;
  return {
    users:
      ((payload.users ?? payload.records ?? payload.list) as
        | never[]
        | undefined) ?? [],
    checked:
      ((payload.checked ?? payload.checkedIds) as string[] | undefined) ?? [],
  };
}
