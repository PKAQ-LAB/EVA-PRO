export type BackendFrozen = -1 | 0 | 1;
export type FrontStatus = '0000' | '0001' | '9999';

type TreeNode = {
  id?: string | number;
  pid?: string | number;
  parentId?: string | number;
  parentName?: string;
  sort?: number | string;
  orders?: number | string;
  frozen?: BackendFrozen;
  status?: string;
  locked?: string;
  isleaf?: boolean;
  isLeaf?: boolean;
  children?: TreeNode[];
};

export const frozenToEnabledStatus = (frozen?: BackendFrozen): FrontStatus => {
  if (frozen === -1) return '9999';
  return frozen === 1 ? '0001' : '0000';
};

export const frozenToOrgStatus = (frozen?: BackendFrozen): FrontStatus => {
  if (frozen === -1) return '9999';
  return frozen === 1 ? '0000' : '0001';
};

export const lockedToFrozen = (status?: FrontStatus): BackendFrozen =>
  status === '0001' ? 1 : 0;

export const enabledStatusToFrozen = (status?: FrontStatus): BackendFrozen =>
  status === '0001' ? 1 : 0;

export const orgStatusToFrozen = (status?: FrontStatus): BackendFrozen =>
  status === '0000' ? 1 : 0;

export const normalizePageParams = (params?: Record<string, unknown>) => {
  if (!params) return undefined;
  const { current, pageSize, ...rest } = params;
  return {
    ...rest,
    pageNo: current ?? (rest.pageNo as unknown) ?? 1,
    pageSize: pageSize ?? (rest.pageSize as unknown) ?? 20,
  };
};

export const normalizePageData = <T>(data: unknown) => {
  const page = data as
    | { records?: T[]; total?: number; list?: T[] }
    | T[]
    | undefined;
  if (Array.isArray(page)) return { list: page, total: page.length };
  const list = page?.records ?? page?.list ?? [];
  return { list, total: page?.total ?? list.length };
};

export const normalizeTree = <T extends TreeNode>(
  rows: T[] | undefined,
  statusMapper: (frozen?: BackendFrozen) => FrontStatus = frozenToEnabledStatus,
): T[] =>
  (rows ?? []).map((row) => {
    const next = {
      ...row,
      id: row.id != null ? String(row.id) : row.id,
      parentId: row.parentId ?? (row.pid != null ? String(row.pid) : undefined),
      orders: row.orders ?? row.sort,
      status: row.status ?? statusMapper(row.frozen),
      locked: row.locked ?? frozenToEnabledStatus(row.frozen),
      isLeaf: row.isLeaf ?? row.isleaf,
    } as T;
    if (row.children) {
      next.children = normalizeTree(
        row.children,
        statusMapper,
      ) as T['children'];
    }
    return next;
  });

export const toBackendTreePayload = <T extends TreeNode>(
  row: T,
  statusField: 'status' | 'locked' = 'status',
  statusToFrozen: (status?: FrontStatus) => BackendFrozen = orgStatusToFrozen,
) => {
  const { parentId, orders, status, locked, isLeaf, children, ...rest } = row;
  const frontendStatus = (statusField === 'locked' ? locked : status) as
    | FrontStatus
    | undefined;
  return {
    ...rest,
    pid: parentId,
    sort: orders,
    frozen:
      statusField === 'locked'
        ? lockedToFrozen(frontendStatus)
        : statusToFrozen(frontendStatus),
    isleaf: isLeaf,
  };
};
