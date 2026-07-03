import APIS from '@/apis';
import http from '@/utils/http';
import { enabledStatusToFrozen, frozenToEnabledStatus } from '../adapter';
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
    data: (res.data ?? []).map((row) =>
      normalizeDict(row as DictItem & Record<string, unknown>),
    ),
  }));

export const getDict = (id: string) =>
  http
    .get<{ data?: DictItem; success?: boolean }>(APIS.DICT_GET, id)
    .then((res) => ({
      ...res,
      data: res.data
        ? normalizeDict(res.data as DictItem & Record<string, unknown>)
        : undefined,
    }));

export const editDict = (data: Partial<DictItem>) =>
  http.post<MutationResult>(APIS.DICT_EDIT, {
    ...data,
    frozen: enabledStatusToFrozen(data.status),
  });

export const deleteDict = (id: string) =>
  http.get<MutationResult>(APIS.DICT_DEL, id);

function normalizeDict(row: DictItem & Record<string, unknown>): DictItem {
  return {
    ...row,
    id: row.id != null ? String(row.id) : row.id,
    status: row.status ?? frozenToEnabledStatus(row.frozen as never),
    lines: (row.lines ?? []).map((line) => ({
      ...line,
      id: line.id != null ? String(line.id) : line.id,
    })),
  };
}
