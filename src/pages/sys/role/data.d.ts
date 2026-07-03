/** 角色冻结状态：0 启用、1 锁定、9999 系统只读 */
export type RoleFrozen = 0 | 1 | 9999;

export interface RoleItem {
  id: string;
  name: string;
  code?: string;
  remark?: string;
  frozen?: RoleFrozen;
  status?: string;
  /** 数据权限范围，字典类型 DATA_SCOPE */
  dataScope?: string;
  /** 当 dataScope=0003 时，限定的部门 id 列表（后端用逗号串） */
  dataOrgIds?: string | string[];
  /** 兼容旧字段：数据权限类型 */
  dataPermissionType?: string;
  /** 兼容旧字段：当 dataPermissionType=0003 时，限定的部门 id 列表 */
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
