import APIS from '@/apis';
import http from '@/utils/http';
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
  http.list<AccountListResponse>(APIS.ACCOUNT_LIST, params);

export const getAccount = (id: string) =>
  http.get<{ data?: AccountItem; success?: boolean }>(APIS.ACCOUNT_GET, id);

export const editAccount = (data: Partial<AccountItem>) =>
  http.post<MutationResult>(APIS.ACCOUNT_EDIT, data);

export const deleteAccounts = (ids: string[]) =>
  http.post<MutationResult>(APIS.ACCOUNT_DEL, { param: ids });

export const lockAccounts = (ids: string[], status: AccountLockStatus) =>
  http.post<MutationResult>(APIS.ACCOUNT_LOCK, { param: ids, status });

export const grantAccountRoles = (id: string, roles: AccountRoleRef[]) =>
  http.post<MutationResult>(APIS.ACCOUNT_GRANT, { id, roles });

export const checkAccountUnique = (account: string, id?: string) =>
  http.post<MutationResult>(APIS.ACCOUNT_CHECKUNIQUE, { account, id });

export const queryOrgs = () => http.list<OrgListResponse>(APIS.ORG_LIST);

export const queryRoles = () => http.list<RoleListResponse>(APIS.ROLE_LIST);
