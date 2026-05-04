export interface ColumnItem {
  key: string;
  columnName: string;
  comment: string;
  length?: number;
  columnType?: string;
  nullAble?: boolean;
  codeMapping?: string;
  sort?: boolean;
  listShow?: boolean;
  formShow?: boolean;
  searchAble?: boolean;
  componentType?: 'input' | 'button';
  showName?: string;
}

export interface TablePane {
  key: string;
  name: string;
}

export interface ProjectMeta {
  title?: string;
  description?: string;
  projectName?: string;
  moduleName?: string;
  packageName?: string;
  orm?: 'jpa' | 'mybatis';
  pageable?: '0' | '1';
  selection?: '0' | '1';
  ui?: '0' | '1' | '2' | '3' | '4' | '5';
}
