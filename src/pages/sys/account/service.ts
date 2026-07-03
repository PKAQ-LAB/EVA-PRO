import APIS from '@/apis';
import http from '@/utils/http';
import {
  frozenToEnabledStatus,
  normalizePageData,
  normalizePageParams,
  normalizeTree,
} from '../adapter';
import { normalizeFrozen } from '../status';
import type {
  AccountItem,
  AccountLockStatus,
  AccountRoleRef,
  OrgNode,
  RoleItem,
} from './data.d';

export interface AccountListResponse {
  data?: AccountItem[];
  total?: number;
  success?: boolean;
}

export interface OrgListResponse {
  data?: OrgNode[];
  success?: boolean;
}

export interface RoleListResponse {
  data?: { list?: RoleItem[]; total?: number };
  success?: boolean;
}

export interface MutationResult {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export const queryAccountList = (params: Record<string, unknown>) =>
  http
    .list<{ data?: unknown; success?: boolean }>(
      APIS.ACCOUNT_LIST,
      normalizePageParams(params),
    )
    .then((res) => {
      const page = normalizePageData<AccountItem>(res.data);
      return {
        ...res,
        data: page.list.map((row) => normalizeAccount(row)),
        total: page.total,
      };
    });

export const getAccount = (id: string) =>
  http
    .get<{ data?: AccountItem; success?: boolean }>(APIS.ACCOUNT_GET, id)
    .then((res) => ({ ...res, data: res.data && normalizeAccount(res.data) }));

export const editAccount = (data: Partial<AccountItem>) =>
  http.post<MutationResult>(APIS.ACCOUNT_EDIT, {
    ...data,
    code: data.account,
    frozen: data.locked === '0001' ? 1 : 0,
    roleIds: data.roles?.map((role) => role.id),
  });

export const deleteAccounts = (ids: string[]) =>
  http.post<MutationResult>(APIS.ACCOUNT_DEL, { param: ids });

export const lockAccounts = (ids: string[], _status: AccountLockStatus) =>
  http.post<MutationResult>(APIS.ACCOUNT_LOCK, { param: ids });

export const grantAccountRoles = (id: string, roles: AccountRoleRef[]) =>
  http.post<MutationResult>(APIS.ACCOUNT_GRANT, {
    userId: id,
    roleIds: roles.map((role) => role.id),
  });

export const checkAccountUnique = (account: string, id?: string) =>
  http.post<MutationResult>(APIS.ACCOUNT_CHECKUNIQUE, { account, id });

export const queryOrgs = () =>
  http.list<OrgListResponse>(APIS.ORG_LIST).then((res) => ({
    ...res,
    data: normalizeTree(res.data).map((row) =>
      normalizeOrgNode(row as Partial<OrgNode> & Record<string, unknown>),
    ),
  }));

export const queryRoles = () =>
  http
    .list<{ data?: unknown; success?: boolean }>(
      APIS.ROLE_LIST,
      normalizePageParams({ current: 1, pageSize: 200 }),
    )
    .then((res) => {
      const page = normalizePageData<RoleItem>(res.data);
      return {
        ...res,
        data: {
          list: page.list.map((role) => ({
            ...role,
            id: role.id != null ? String(role.id) : role.id,
          })),
          total: page.total,
        },
      };
    });

function normalizeAccount(row: AccountItem) {
  const record = row as AccountItem & Record<string, unknown>;
  return {
    ...row,
    id: row.id != null ? String(row.id) : row.id,
    frozen: normalizeFrozen(record.frozen),
    locked: row.locked ?? frozenToEnabledStatus(record.frozen as never),
    roles:
      row.roles ??
      ((record.roleIds as Array<string | number> | undefined)?.map((id) => ({
        id: String(id),
      })) ||
        []),
  } as AccountItem;
}

function normalizeOrgNode(
  row: Partial<OrgNode> & Record<string, unknown>,
): OrgNode {
  return {
    ...row,
    id: String(row.id ?? ''),
    title: row.title ?? (row.name as string) ?? '',
    children: row.children?.map((child) =>
      normalizeOrgNode(child as Partial<OrgNode> & Record<string, unknown>),
    ),
  };
}
