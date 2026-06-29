import { request } from '@umijs/max';
import { Select, type SelectProps } from 'antd';
import React, { useEffect, useState } from 'react';

export interface DictSelectorProps extends Omit<SelectProps, 'options'> {
  /** 字典编码，用于走 /api/sys/dictionary/query/{code} 远程拉取 */
  code?: string;
  /** 直接传入的字典数据，优先于 code */
  data?: Record<string, string> | string;
  /** 是否显示 "全部" 选项 */
  showall?: boolean;
}

/**
 * 字典选择器：优先使用 data prop 的字典数据，否则按 code 远程加载。
 */
const DictSelector: React.FC<DictSelectorProps> = ({
  code,
  data,
  showall = true,
  ...rest
}) => {
  const [options, setOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    if (data) {
      const parsed: Record<string, string> =
        typeof data === 'string' ? JSON.parse(data) : data;
      setOptions(
        Object.keys(parsed).map((value) => ({ value, label: parsed[value] })),
      );
      return;
    }
    if (code) {
      request<{
        data?: Record<string, string> | Array<Record<string, unknown>>;
      }>(`/api/sys/dictionary/query/${code}`)
        .then((response) => {
          if (response?.data) {
            if (Array.isArray(response.data)) {
              setOptions(
                response.data.map((item) => ({
                  value: String(item.value ?? item.code ?? item.id ?? ''),
                  label: String(item.name ?? item.label ?? item.value ?? ''),
                })),
              );
            } else {
              setOptions(
                Object.keys(response.data).map((value) => ({
                  value,
                  label: (response.data as Record<string, string>)[value],
                })),
              );
            }
          }
        })
        .catch(() => {
          /* swallow: caller can decide to retry */
        });
    }
  }, [code, data]);

  const finalOptions = showall
    ? [{ value: '0000', label: '全部' }, ...options]
    : options;

  return <Select {...rest} options={finalOptions} />;
};

export default DictSelector;
