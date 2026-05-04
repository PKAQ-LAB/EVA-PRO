import APIS from '@/apis';
import http from '@/utils/http';
import type {
  RoleItem,
  RoleListResponse,
  RoleLocked,
  RoleModuleResponse,
  RoleUserResponse,
} from './data.d';

export interface MutationResult {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export const queryRoles = (params: Record<string, unknown>) =>
  http.list<RoleListResponse>(APIS.ROLE_LIST, params);

export const getRole = (id: string) =>
  http.get<{ data?: RoleItem; success?: boolean }>(APIS.ROLE_GET, id);

export const saveRole = (data: Partial<RoleItem>) =>
  http.post<MutationResult>(APIS.ROLE_SAVE, data);

export const deleteRoles = (ids: string[]) =>
  http.post<MutationResult>(APIS.ROLE_DEL, { param: ids });

export const lockRoles = (ids: string[], status: RoleLocked) =>
  http.post<MutationResult>(APIS.ROLE_LOCK, { param: ids, status });

export const checkRoleUnique = (code: string) =>
  http.post<MutationResult>(APIS.ROLE_CHECKUNIQUE, { code });

export const listRoleModules = (roleId: string) =>
  http.list<RoleModuleResponse>(APIS.ROLE_LISTMOUDLE, { roleId });

export const saveRoleModules = (
  id: string,
  modules: Array<{ moduleId: string }>,
  resources: Record<string, string[]>,
) =>
  http.post<MutationResult>(APIS.ROLE_SAVEMODULE, {
    id,
    modules,
    resources,
  });

export const listRoleUsers = (roleId: string, deptId?: string) =>
  http.list<RoleUserResponse>(APIS.ROLE_LISTUSER, { roleId, deptId });

export const saveRoleUsers = (id: string, users: Array<{ userId: string }>) =>
  http.post<MutationResult>(APIS.ROLE_SAVEUSER, { id, users });
