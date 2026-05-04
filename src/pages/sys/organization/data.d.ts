/** 组织（部门）状态：0000 停用、0001 启用、9999 系统部门 */
export type OrgStatus = '0000' | '0001' | '9999';

export interface OrgItem {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
  parentName?: string;
  orders?: number;
  status?: OrgStatus;
  remark?: string;
  isLeaf?: boolean;
  children?: OrgItem[];
}
