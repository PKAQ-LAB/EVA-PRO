import type { DictItem } from './data.d';

export const isReadonlyDict = (item: Partial<DictItem>) =>
  item.category !== 'BUSINESS' ||
  item.readOnly !== false ||
  item.status === '9999' ||
  item.frozen === 9999;

export const dictIdentity = (item: Partial<DictItem>) =>
  `${item.category ?? 'unclassified'}:${item.id ?? ''}`;

export const hasCategory = (item: Partial<DictItem>) =>
  item.category === 'SYSTEM' || item.category === 'BUSINESS';

export const completeContract = (data: DictItem[], capability: unknown) =>
  typeof capability === 'boolean' &&
  data.every(
    (item) => hasCategory(item) && typeof item.readOnly === 'boolean',
  ) &&
  new Set(data.map(dictIdentity)).size === data.length;

export interface DictRow extends Partial<DictItem> {
  id: string;
  virtual?: true;
  children?: DictRow[];
}

/** 展示树从平数组复制生成，虚根从不作为业务记录提交。 */
export function dictionaryRows(
  data: DictItem[],
  grouped: boolean,
  search = '',
): DictRow[] {
  const filtered = data.filter(
    (item) =>
      !search || item.name?.includes(search) || item.code?.includes(search),
  );
  if (!grouped) return filtered.map((item) => ({ ...item }));
  return (['SYSTEM', 'BUSINESS'] as const).map((category) => ({
    id: `category:${category}`,
    category,
    virtual: true,
    name: category === 'SYSTEM' ? '系统字典' : '业务字典',
    children: filtered
      .filter((item) => item.category === category)
      .map((item) => ({ ...item })),
  }));
}
