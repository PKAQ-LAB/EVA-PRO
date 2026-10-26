import type { LocalRecordValues } from './data.d';

export function validateValues(values: LocalRecordValues) {
  const fields: Partial<Record<keyof LocalRecordValues, string>> = {};
  if (!values.name.trim() || values.name.trim().length > 50)
    fields.name = '请输入 1–50 个字符的名称';
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(values.code.trim()))
    fields.code = '编码限 1–32 位字母、数字、下划线或短横线';
  if (!['enabled', 'disabled'].includes(values.status))
    fields.status = '请选择状态';
  if (values.remark.length > 200) fields.remark = '备注不能超过 200 个字符';
  return fields;
}
