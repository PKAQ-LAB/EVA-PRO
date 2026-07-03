/** 账号锁定状态：0000 正常、0001 锁定、9999 系统用户 */
export type AccountLockStatus = '0000' | '0001' | '9999';

export interface AccountRoleRef {
  id: string;
  name?: string;
}

export interface AccountItem {
  id?: string;
  account: string;
  name: string;
  tel?: string;
  email?: string;
  deptId?: string;
  deptName?: string;
  avatar?: string;
  password?: string;
  repassword?: string;
  remark?: string;
  frozen?: 0 | 1 | 9999;
  locked?: AccountLockStatus;
  roles?: AccountRoleRef[];
}

export interface OrgNode {
  id: string;
  title: string;
  parentId?: string;
  children?: OrgNode[];
}

export interface RoleItem {
  id: string;
  name: string;
}
