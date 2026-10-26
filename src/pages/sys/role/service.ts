import APIS from '@/apis';
import http from '@/utils/http';
import { normalizePageData, normalizePageParams } from '../adapter';
import type {
  RoleFrozen,
  RoleItem,
  RoleModuleNode,
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

export const saveRole = async (data: Partial<RoleItem>) => {
  const dataScope = Object.hasOwn(data, 'dataScope')
    ? data.dataScope
    : data.dataPermissionType;
  if (typeof dataScope !== 'string' || !dataScope.trim()) {
    throw new Error('请选择数据权限');
  }
  return http.post<MutationResult>(APIS.ROLE_SAVE, {
    ...data,
    frozen: normalizeFrozen(data.frozen),
    dataScope,
    dataOrgIds: Array.isArray(data.dataOrgIds)
      ? data.dataOrgIds.join(',')
      : data.dataOrgIds,
  });
};

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
    // 后端授权参数仅接收资源ID，模块ID不能混入同一集合。
    resourceId: Array.from(
      new Set(modules.flatMap((module) => resources[module.moduleId] ?? [])),
    ),
  });

export const listRoleUsers = (roleId: string, deptId?: string) =>
  http
    .list<RoleUserResponse & { data?: unknown }>(APIS.ROLE_LISTUSER, {
      roleId,
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
  const dataScope = Object.hasOwn(record, 'dataScope')
    ? record.dataScope
    : record.dataPermissionType;
  const dataOrgIds = record.dataOrgIds ?? record.dataPermissionDeptid;
  return {
    ...row,
    id: row.id != null ? String(row.id) : row.id,
    frozen,
    status:
      row.status ?? (frozen === 9999 ? '9999' : frozen === 1 ? '0001' : '0000'),
    dataScope: typeof dataScope === 'string' ? dataScope : undefined,
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
    return {
      modules: deduplicateRoleModuleTree(data as RoleModuleNode[]),
      checked: [],
      checkedResource: {},
    };
  }
  const payload = (data || {}) as Record<string, unknown>;
  const modules =
    (payload.modules as RoleModuleNode[] | undefined) ??
    (payload.resources as RoleModuleNode[] | undefined) ??
    (payload.list as RoleModuleNode[] | undefined) ??
    [];
  const normalizedModules = deduplicateRoleModuleTree(modules);
  const selectedResources: Record<string, string[]> = {};
  const collectSelected = (nodes: RoleModuleNode[]) => {
    for (const node of nodes) {
      selectedResources[node.id] = (node.resources ?? [])
        .filter((resource) => resource.checked === 1)
        .map((resource) => resource.id);
      if (node.children) collectSelected(node.children);
    }
  };
  collectSelected(normalizedModules);
  return {
    modules: normalizedModules,
    checked: (
      ((payload.checked ?? payload.checkedModuleIds ?? payload.checkedIds) as
        | Array<string | number>
        | undefined) ?? []
    ).map(String),
    checkedResource:
      (payload.checkedResource as Record<string, string[]> | undefined) ??
      selectedResources,
  };
}

function deduplicateRoleModuleTree(
  modules: RoleModuleNode[],
  seenIds = new Set<string>(),
): RoleModuleNode[] {
  return modules.flatMap((module) => {
    const id = String(module.id);
    if (seenIds.has(id)) return [];
    seenIds.add(id);

    const next = {
      ...module,
      id,
      resources: module.resources?.map((resource) => ({
        ...resource,
        id: String(resource.id),
      })),
    };
    if (module.children) {
      next.children = deduplicateRoleModuleTree(module.children, seenIds);
    }
    return [next];
  });
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
      (
        (payload.checked ?? payload.checkedUser ?? payload.checkedIds) as
          | Array<string | number>
          | undefined
      )?.map(String) ?? [],
  };
}
