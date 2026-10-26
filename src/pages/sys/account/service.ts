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
    ...Object.fromEntries(
      Object.entries(data).filter(
        ([key]) =>
          ![
            'assignedRoles',
            'createBy',
            'utcCreate',
            'modifyBy',
            'utcModify',
            'createId',
            'modifyId',
            'deptName',
          ].includes(key),
      ),
    ),
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
  http.list<OrgListResponse>(APIS.ORG_LIST).then((res) => {
    if (res.success === false || !Array.isArray(res.data))
      throw new Error('部门列表加载失败');
    return {
      ...res,
      data: normalizeTree(res.data).map((row) =>
        normalizeOrgNode(row as Partial<OrgNode> & Record<string, unknown>),
      ),
    };
  });

export const queryRoles = () =>
  http
    .list<{ data?: unknown; success?: boolean }>(
      APIS.ROLE_LIST,
      normalizePageParams({ current: 1, pageSize: 200 }),
    )
    .then((res) => {
      const data = res.data as
        | { records?: unknown; list?: unknown }
        | undefined;
      if (
        res.success === false ||
        !(
          Array.isArray(data) ||
          Array.isArray(data?.records) ||
          Array.isArray(data?.list)
        )
      ) {
        throw new Error('角色列表加载失败');
      }
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
  if (Object.hasOwn(record, 'roleIds') && !Array.isArray(record.roleIds))
    throw new Error('已分配角色数据格式错误');
  const refs = new Map(
    (row.roles ?? []).map((role) => [String(role.id), role]),
  );
  const roles = Array.isArray(record.roleIds)
    ? record.roleIds.map((id: string | number) => ({
        ...refs.get(String(id)),
        id: String(id),
      }))
    : (row.roles ?? []).map((role) => ({ ...role, id: String(role.id) }));
  return {
    ...row,
    id: row.id != null ? String(row.id) : row.id,
    frozen: normalizeFrozen(record.frozen),
    locked: row.locked ?? frozenToEnabledStatus(record.frozen as never),
    roleIds: Array.isArray(record.roleIds)
      ? record.roleIds.map(String)
      : undefined,
    assignedRoles: Array.isArray(record.assignedRoles)
      ? record.assignedRoles.map((role) => ({ ...role, id: String(role.id) }))
      : undefined,
    roles,
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
