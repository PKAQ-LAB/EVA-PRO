import APIS from '@/apis';
import http from '@/utils/http';
import {
  enabledStatusToFrozen,
  frozenToEnabledStatus,
  normalizeTree,
  toBackendTreePayload,
} from '../adapter';
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
  http.list<ModuleListResponse>(APIS.MODULE_LIST, params).then((res) => ({
    ...res,
    data: normalizeTree(res.data, frozenToEnabledStatus),
  }));

export const getModule = (id: string) =>
  http
    .get<{ data?: ModuleItem; success?: boolean }>(APIS.MODULE_GET, id)
    .then((res) => ({
      ...res,
      data: res.data
        ? normalizeTree([res.data], frozenToEnabledStatus)[0]
        : undefined,
    }));

export const editModule = (data: Partial<ModuleItem>) =>
  http.post<MutationResult>(
    APIS.MODULE_EDIT,
    toBackendTreePayload(data as ModuleItem, 'status', enabledStatusToFrozen),
  );

export const deleteModules = (ids: string[]) =>
  http.post<MutationResult>(APIS.MODULE_DEL, { param: ids });

export const switchModuleStatus = (id: string, status: ModuleStatus) =>
  http.post<MutationResult>(APIS.MODULE_STATUS, {
    param: [id],
    frozen: enabledStatusToFrozen(status),
  });

export const sortModules = (rows: Array<{ id: string; orders: number }>) =>
  http.post<MutationResult>(APIS.MODULE_SORT, rows);

export const checkModuleUnique = (
  path: string,
  parentId?: string,
  id?: string,
) => http.post<MutationResult>(APIS.MODULE_CHECKUNIQUE, { path, parentId, id });
