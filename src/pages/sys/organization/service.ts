import APIS from '@/apis';
import http from '@/utils/http';
import type { OrgItem, OrgStatus } from './data.d';

export interface OrgListResponse {
  data?: OrgItem[];
  success?: boolean;
}

export interface MutationResult {
  success?: boolean;
  message?: string;
}

export const queryOrgs = (params?: Record<string, unknown>) =>
  http.list<OrgListResponse>(APIS.ORG_LIST, params);

export const getOrg = (id: string) =>
  http.get<{ data?: OrgItem; success?: boolean }>(APIS.ORG_GET, id);

export const editOrg = (data: Partial<OrgItem>) =>
  http.post<MutationResult>(APIS.ORG_EDIT, data);

export const deleteOrgs = (ids: string[]) =>
  http.post<MutationResult>(APIS.ORG_DEL, { param: ids });

export const switchOrgStatus = (id: string, status: OrgStatus) =>
  http.post<MutationResult>(APIS.ORG_STATUS, { id, status });

export const sortOrgs = (rows: Array<{ id: string; orders: number }>) =>
  http.post<MutationResult>(APIS.ORG_SORT, rows);

export const checkOrgUnique = (code: string) =>
  http.post<MutationResult>(APIS.ORG_CHECKUNIQUE, { code });
