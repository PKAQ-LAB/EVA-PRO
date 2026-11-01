import { useModel } from '@umijs/max';
import { Select, type SelectProps } from 'antd';
import React from 'react';
import { ownedDictionary } from '@/utils/dictionaryState';

export interface DictSelectorProps extends Omit<SelectProps, 'options'> {
  code?: string;
  data?: Record<string, string> | string;
  showall?: boolean;
}

/** 字典选择只读取当前身份快照，显式数据优先，不发起逐字段请求。 */
const DictSelector: React.FC<DictSelectorProps> = ({
  code,
  data,
  showall = true,
  ...rest
}) => {
  const { initialState } = useModel('@@initialState');
  const snapshot = ownedDictionary(initialState);
  const explicit = data !== undefined;
  const loading =
    !explicit && !snapshot && initialState?.dictStatus !== 'error';
  let failed = false;
  let options: Array<{ value: string; label: string }> = [];
  try {
    const parsed: unknown = explicit
      ? typeof data === 'string'
        ? JSON.parse(data)
        : data
      : snapshot?.[code ?? ''];
    if (Array.isArray(parsed)) {
      options = parsed.map((item) => {
        if (!item || typeof item !== 'object') throw new Error('字典结构无效');
        return {
          value: String(item.value ?? item.code ?? item.id ?? ''),
          label: String(item.name ?? item.label ?? item.value ?? ''),
        };
      });
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      Object.values(parsed).every((label) => typeof label === 'string')
    ) {
      options = Object.entries(parsed).map(([value, label]) => ({
        value,
        label: label as string,
      }));
    } else if (!loading) throw new Error('字典暂不可用');
  } catch {
    failed = true;
  }
  const finalOptions =
    failed || loading
      ? []
      : showall
        ? [{ value: '0000', label: '全部' }, ...options]
        : options;
  return (
    <Select
      {...rest}
      labelRender={
        rest.labelRender ??
        ((item) =>
          finalOptions.findLast((option) => option.value === String(item.value))
            ?.label ?? String(item.value))
      }
      options={finalOptions}
      loading={loading || rest.loading}
      status={
        failed
          ? 'error'
          : !explicit && initialState?.dictStatus === 'stale'
            ? 'warning'
            : rest.status
      }
      notFoundContent={
        failed
          ? '字典暂不可用，请重试'
          : loading
            ? '加载中...'
            : rest.notFoundContent
      }
    />
  );
};
export default DictSelector;
