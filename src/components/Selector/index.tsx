import { request } from '@umijs/max';
import { Select, type SelectProps } from 'antd';
import React, { useEffect, useState } from 'react';

export interface SelectorProps<T = Record<string, unknown>>
  extends Omit<SelectProps, 'options'> {
  /** 远程数据 URL；若提供则忽略 data */
  url?: string;
  /** 直接提供的列表数据 */
  data?: T[] | string;
  /** 用作 value 的字段名 */
  k: keyof T;
  /** 用作 label 的字段名 */
  v: keyof T;
  /** 是否显示 "全部" 选项 */
  showall?: boolean;
}

/**
 * 通用远程下拉选择器：优先使用 data prop，否则走 url 拉取。
 */
function Selector<T extends Record<string, unknown>>({
  url,
  data,
  k,
  v,
  showall = true,
  ...rest
}: SelectorProps<T>) {
  const [options, setOptions] = useState<
    Array<{ value: string | number; label: React.ReactNode }>
  >([]);

  useEffect(() => {
    const toOptions = (rows: T[]) =>
      rows.map((row) => ({
        value: row[k] as string | number,
        label: row[v] as React.ReactNode,
      }));

    if (data) {
      const parsed: T[] = typeof data === 'string' ? JSON.parse(data) : data;
      setOptions(toOptions(parsed));
      return;
    }
    if (url) {
      request<{ data?: T[] }>(url)
        .then((response) => {
          if (response?.data) setOptions(toOptions(response.data));
        })
        .catch(() => {
          /* swallow */
        });
    }
  }, [url, data, k, v]);

  const finalOptions = showall
    ? [{ value: '0000', label: '全部' }, ...options]
    : options;

  return <Select {...rest} options={finalOptions} />;
}

export default Selector;
