import APIS from '@/apis';
import http from '@/utils/http';
import type { ModuleItem, ModuleStatus } from './data.d';

export interface ModuleListResponse {
  data?: ModuleItem[];
  success?: boolean;
}

export interface MutationResult {
  success?: boolean;
  message?: string;
}

export const queryModules = (params?: Record<string, unknown>) =>
  http.list<ModuleListResponse>(APIS.MODULE_LIST, params);

export const getModule = (id: string) =>
  http.get<{ data?: ModuleItem; success?: boolean }>(APIS.MODULE_GET, id);

export const editModule = (data: Partial<ModuleItem>) =>
  http.post<MutationResult>(APIS.MODULE_EDIT, data);

export const deleteModules = (ids: string[]) =>
  http.post<MutationResult>(APIS.MODULE_DEL, { param: ids });

export const switchModuleStatus = (id: string, status: ModuleStatus) =>
  http.post<MutationResult>(APIS.MODULE_STATUS, { id, status });

export const sortModules = (rows: Array<{ id: string; orders: number }>) =>
  http.post<MutationResult>(APIS.MODULE_SORT, rows);

export const checkModuleUnique = (
  path: string,
  parentId?: string,
  id?: string,
) => http.post<MutationResult>(APIS.MODULE_CHECKUNIQUE, { path, parentId, id });
