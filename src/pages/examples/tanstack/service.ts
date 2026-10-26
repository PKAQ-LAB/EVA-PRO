import type { LocalRecord, LocalRecordValues } from './data.d';
import { validateValues } from './rules';

export const storageKey = 'eva.examples.tanstack.records.v1';
export const recordsQueryKey = [
  'examples',
  'tanstack',
  'local-records',
] as const;

const examples: LocalRecord[] = Array.from({ length: 12 }, (_, index) => ({
  id: `example-${index + 1}`,
  name: `示例记录 ${index + 1}`,
  code: `DEMO_${String(index + 1).padStart(2, '0')}`,
  status: index % 3 === 0 ? 'disabled' : 'enabled',
  remark: '本地示例',
}));

function readRecords(): LocalRecord[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    throw new Error('无法读取本地记录，请检查浏览器存储权限');
  }
  if (raw === null) return examples.map((record) => ({ ...record }));
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error();
    const ids = new Set<string>();
    const codes = new Set<string>();
    return parsed.map((row: unknown) => {
      if (!row || typeof row !== 'object') throw new Error();
      const record = row as Record<string, unknown>;
      if (
        typeof record.id !== 'string' ||
        !record.id ||
        typeof record.name !== 'string' ||
        typeof record.code !== 'string' ||
        typeof record.remark !== 'string' ||
        (record.status !== 'enabled' && record.status !== 'disabled')
      )
        throw new Error();
      const value: LocalRecord = {
        id: record.id,
        name: record.name,
        code: record.code,
        status: record.status,
        remark: record.remark,
      };
      const code = value.code.trim().toLowerCase();
      if (
        Object.keys(validateValues(value)).length ||
        ids.has(value.id) ||
        codes.has(code)
      )
        throw new Error();
      ids.add(value.id);
      codes.add(code);
      return value;
    });
  } catch {
    throw new Error('本地记录格式异常，原数据已保留，请检查后重试');
  }
}

function writeRecords(records: LocalRecord[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
  } catch {
    throw new Error('保存失败，浏览器存储不可用或空间不足');
  }
}

export async function listRecords() {
  return readRecords();
}

// shortcut: localStorage不提供跨窗口事务；需要多人同时编辑时改用事务存储。
export async function saveRecord(values: LocalRecordValues, id?: string) {
  const errors = validateValues(values);
  const firstError = Object.values(errors)[0];
  if (firstError) throw new Error(firstError);
  const records = readRecords();
  if (id && !records.some((record) => record.id === id))
    throw new Error('记录已不存在，请刷新后重试');
  const code = values.code.trim();
  if (
    records.some(
      (record) =>
        record.id !== id &&
        record.code.trim().toLowerCase() === code.toLowerCase(),
    )
  )
    throw new Error('编码已存在，请使用其他编码');
  const next: LocalRecord = {
    id: id ?? crypto.randomUUID(),
    name: values.name.trim(),
    code,
    status: values.status,
    remark: values.remark.trim(),
  };
  const updated = id
    ? records.map((record) => (record.id === id ? next : record))
    : [...records, next];
  writeRecords(updated);
  return updated;
}

export async function deleteRecord(id: string) {
  const records = readRecords();
  if (!records.some((record) => record.id === id))
    throw new Error('记录已不存在，请刷新后重试');
  const updated = records.filter((record) => record.id !== id);
  writeRecords(updated);
  return updated;
}
