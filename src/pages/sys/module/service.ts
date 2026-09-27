import APIS from '@/apis';
import http from '@/utils/http';
import {
  enabledStatusToFrozen,
  frozenToEnabledStatus,
  normalizeTree,
  toBackendTreePayload,
} from '../adapter';
import type { ModuleItem, ModuleStatus } from './data.d';

type BackendModuleItem = ModuleItem & Record<string, unknown>;

export interface ModuleListResponse {
  data?: ModuleItem[];
  success?: boolean;
}

export interface MutationResult {
  success?: boolean;
  message?: string;
}

const firstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && !!value);

const normalizeIconName = (icon?: string) =>
  icon
    ?.replace(/(Outlined|Filled|TwoTone)$/u, '')
    .replace(/[_\s]+/gu, '-')
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/gu, '$1-$2')
    .toLowerCase();

const normalizeModuleFields = (
  rows: ModuleItem[] | undefined,
  parent?: ModuleItem,
): ModuleItem[] =>
  (rows ?? []).map((row) => {
    const record = row as BackendModuleItem;
    const name = firstString(
      record.name,
      record.title,
      record.moduleName,
      record.menuName,
      record.resourceName,
    );
    const code = firstString(record.code);
    const routeUrl = firstString(
      record.routeUrl,
      record.routeurl,
      record.url,
      record.router,
    );
    const icon = normalizeIconName(
      firstString(
        record.icon,
        record.iconCls,
        record.iconcls,
        record.iconFont,
        record.iconfont,
      ),
    );
    const parentName = firstString(
      record.parentName,
      record.pname,
      record.pName,
      record.parentTitle,
      record.parentModuleName,
      parent?.name,
    );
    const next: ModuleItem = {
      ...row,
      ...(name ? { name } : {}),
      ...(code ? { code } : {}),
      ...(routeUrl ? { routeUrl } : {}),
      ...(icon ? { icon } : {}),
      ...(parentName ? { parentName } : {}),
    };

    if (Array.isArray(row.children) && row.children.length > 0) {
      next.children = normalizeModuleFields(row.children, next);
    }

    return next;
  });

const normalizeModules = (rows: ModuleItem[] | undefined) =>
  normalizeModuleFields(normalizeTree(rows, frozenToEnabledStatus));

export const queryModules = (params?: Record<string, unknown>) =>
  http.list<ModuleListResponse>(APIS.MODULE_LIST, params).then((res) => ({
    ...res,
    data: normalizeModules(res.data),
  }));

export const getModule = (id: string) =>
  http
    .get<{ data?: ModuleItem; success?: boolean }>(APIS.MODULE_GET, id)
    .then((res) => ({
      ...res,
      data: res.data ? normalizeModules([res.data])[0] : undefined,
    }));

export const editModule = (data: Partial<ModuleItem>) => {
  const { path: _path, ...editableData } = data;
  return http.post<MutationResult>(
    APIS.MODULE_EDIT,
    toBackendTreePayload(
      editableData as ModuleItem,
      'status',
      enabledStatusToFrozen,
    ),
  );
};

export const deleteModules = (ids: string[]) =>
  http.post<MutationResult>(APIS.MODULE_DEL, { param: ids });

export const switchModuleStatus = (id: string, status: ModuleStatus) =>
  http.post<MutationResult>(APIS.MODULE_STATUS, {
    param: [id],
    frozen: enabledStatusToFrozen(status),
  });

export const sortModules = (row: {
  id: string;
  oldSort?: number | string;
  newSort?: number | string;
}) => http.post<MutationResult>(APIS.MODULE_SORT, row);

export const checkModuleUnique = (
  code: string,
  parentId?: string,
  id?: string,
) =>
  http.post<MutationResult>(APIS.MODULE_CHECKUNIQUE, {
    id,
    pid: parentId,
    code,
  });
