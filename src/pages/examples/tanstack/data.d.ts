export interface LocalRecordValues {
  name: string;
  code: string;
  status: 'enabled' | 'disabled';
  remark: string;
}

export interface LocalRecord extends LocalRecordValues {
  id: string;
}
