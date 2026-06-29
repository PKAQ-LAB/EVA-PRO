import APIS from '@/apis';
import http from '@/utils/http';
import {
  enabledStatusToFrozen,
  frozenToEnabledStatus,
  normalizeTree,
  toBackendTreePayload,
} from '../adapter';
import type { DictItem } from './data.d';

export interface DictListResponse {
  data?: DictItem[];
  success?: boolean;
}

export interface MutationResult {
  success?: boolean;
  message?: string;
}

export const queryDicts = (params?: Record<string, unknown>) =>
  http.list<DictListResponse>(APIS.DICT_LIST, params).then((res) => ({
    ...res,
    data: normalizeTree(res.data, frozenToEnabledStatus).map((row) =>
      normalizeDict(row as DictItem & Record<string, unknown>),
    ),
  }));

export const getDict = (id: string) =>
  http
    .get<{ data?: DictItem; success?: boolean }>(APIS.DICT_GET, id)
    .then((res) => ({
      ...res,
      data: res.data
        ? normalizeDict(
            normalizeTree([res.data])[0] as DictItem & Record<string, unknown>,
          )
        : undefined,
    }));

export const editDict = (data: Partial<DictItem>) =>
  http.post<MutationResult>(
    APIS.DICT_EDIT,
    toBackendTreePayload(data as DictItem, 'status', enabledStatusToFrozen),
  );

export const deleteDict = (id: string) =>
  http.get<MutationResult>(APIS.DICT_DEL, id);

function normalizeDict(row: DictItem & Record<string, unknown>): DictItem {
  const children = row.children?.map((child) =>
    normalizeDict(child as DictItem & Record<string, unknown>),
  );
  const lines =
    row.lines ??
    children?.map((child) => ({
      id: child.id,
      keyName:
        ((child as DictItem & Record<string, unknown>).value as string) ??
        child.code ??
        '',
      keyValue: child.name ?? '',
      orders: (child as DictItem & Record<string, unknown>).orders as
        | string
        | number
        | undefined,
    }));
  return {
    ...row,
    children,
    lines,
  };
}
