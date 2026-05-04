export interface DictLine {
  id?: string;
  keyName: string;
  keyValue: string;
  orders?: string | number;
}

export interface DictItem {
  id: string;
  parentId?: string;
  code?: string;
  name?: string;
  remark?: string;
  status?: string;
  parent?: boolean;
  lines?: DictLine[];
  children?: DictItem[];
}
