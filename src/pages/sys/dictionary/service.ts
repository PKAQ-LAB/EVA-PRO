import APIS from '@/apis';
import http from '@/utils/http';
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
  http.list<DictListResponse>(APIS.DICT_LIST, params);

export const getDict = (id: string) =>
  http.get<{ data?: DictItem; success?: boolean }>(APIS.DICT_GET, id);

export const editDict = (data: Partial<DictItem>) =>
  http.post<MutationResult>(APIS.DICT_EDIT, data);

export const deleteDict = (id: string) =>
  http.get<MutationResult>(APIS.DICT_DEL, id);
