import APIS from '@/apis';
import http from '@/utils/http';
import {
  frozenToOrgStatus,
  normalizeTree,
  orgStatusToFrozen,
  toBackendTreePayload,
} from '../adapter';
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
  http.list<OrgListResponse>(APIS.ORG_LIST, params).then((res) => ({
    ...res,
    data: normalizeTree(res.data, frozenToOrgStatus) as OrgItem[],
  }));

export const getOrg = (id: string) =>
  http
    .get<{ data?: OrgItem; success?: boolean }>(APIS.ORG_GET, id)
    .then((res) => ({
      ...res,
      data: res.data
        ? (normalizeTree([res.data], frozenToOrgStatus)[0] as OrgItem)
        : res.data,
    }));

export const editOrg = (data: Partial<OrgItem>) =>
  http.post<MutationResult>(
    APIS.ORG_EDIT,
    toBackendTreePayload(data as OrgItem),
  );

export const deleteOrgs = (ids: string[]) =>
  http.post<MutationResult>(APIS.ORG_DEL, { param: ids });

export const switchOrgStatus = (id: string, status: OrgStatus) =>
  http.post<MutationResult>(APIS.ORG_STATUS, {
    param: [id],
    frozen: orgStatusToFrozen(status),
  });

export const sortOrgs = (row: {
  id: string;
  oldSort?: number | string;
  newSort?: number | string;
}) => http.post<MutationResult>(APIS.ORG_SORT, row);

export const checkOrgUnique = (code: string) =>
  http.post<MutationResult>(APIS.ORG_CHECKUNIQUE, { code });
