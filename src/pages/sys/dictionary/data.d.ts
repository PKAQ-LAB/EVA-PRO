import type { FrontStatus } from '../adapter';

export interface DictLine {
  id?: string;
  keyName: string;
  keyValue: string;
  orders?: string | number;
  frozen?: number;
  remark?: string;
}

export interface DictItem {
  category?: 'SYSTEM' | 'BUSINESS' | null;
  readOnly?: boolean;
  revision?: number;
  id: string;
  type?: string;
  code?: string;
  name?: string;
  remark?: string;
  status?: FrontStatus;
  frozen?: number;
  sort?: string | number;
  lines?: DictLine[];
}
