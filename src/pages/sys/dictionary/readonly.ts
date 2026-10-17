import type { DictItem } from './data.d';

export const isReadonlyDict = (item: Partial<DictItem>) =>
  item.status === '9999' || item.frozen === 9999;
