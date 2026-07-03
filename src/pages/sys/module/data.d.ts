/** 模块状态：0000 启用、0001 停用、9999 系统模块 */
export type ModuleStatus = '0000' | '0001' | '9999';

export interface ModuleResource {
  id?: string;
  resourceDesc: string;
  resourceUrl: string;
  resourceType?: string;
}

export interface ModuleItem {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  parentId?: string;
  parentName?: string;
  orders?: number | string;
  frozen?: 0 | 1 | 9999;
  status?: ModuleStatus;
  remark?: string;
  isLeaf?: boolean;
  resources?: ModuleResource[];
  children?: ModuleItem[];
}
