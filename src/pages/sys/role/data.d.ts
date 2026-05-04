/** 角色锁定状态：0000 启用、0001 停用、9999 系统 */
export type RoleLocked = '0000' | '0001' | '9999';

export interface RoleItem {
  id: string;
  name: string;
  code?: string;
  remark?: string;
  locked?: RoleLocked;
  status?: string;
  /** 数据权限类型 */
  dataPermissionType?: string;
  /** 当 dataPermissionType=0003 时，限定的部门 id 列表（后端用逗号串） */
  dataPermissionDeptid?: string | string[];
}

export interface RoleListResponse {
  data?: { list?: RoleItem[]; total?: number };
  total?: number;
  success?: boolean;
}

export interface RoleResource {
  id: string;
  resourceDesc: string;
  resourceUrl?: string;
}

export interface RoleModuleNode {
  id: string;
  name: string;
  resources?: RoleResource[];
  children?: RoleModuleNode[];
}

export interface RoleModuleResponse {
  data?: {
    modules?: RoleModuleNode[];
    checked?: string[];
    checkedResource?: Record<string, string[]>;
  };
  success?: boolean;
}

export interface RoleUserItem {
  id: string;
  name?: string;
  account?: string;
  deptName?: string;
  tel?: string;
}

export interface RoleUserResponse {
  data?: {
    users?: RoleUserItem[];
    checked?: string[];
  };
  success?: boolean;
}
