import { request } from '@umijs/max';
import { Select, type SelectProps } from 'antd';
import React, { useEffect, useState } from 'react';

type DictOption = { value: string; label: string };

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
  const [options, setOptions] = useState<DictOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setOptions([]);
    setFailed(false);
    setLoading(Boolean(!data && code));
    const load = async () => {
      try {
        let parsed: unknown;
        if (data) {
          parsed = typeof data === 'string' ? JSON.parse(data) : data;
        } else if (code) {
          const response = await request<{
            success?: boolean;
            data?: Record<string, string> | Array<Record<string, unknown>>;
          }>(`/api/sys/dictionary/query/${code}`);
          if (!active) return;
          if (response?.success === false) {
            throw new Error();
          }
          parsed = response?.data;
        } else {
          return;
        }
        let next: DictOption[];
        if (Array.isArray(parsed)) {
          // 保留已有数组兼容，不扩展到详情 lines 或其它包装结构。
          next = parsed.map((item) => {
            if (!item || typeof item !== 'object') throw new Error();
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
          next = Object.entries(parsed).map(([value, label]) => ({
            value,
            label: label as string,
          }));
        } else {
          throw new Error();
        }
        if (active) {
          setOptions(next);
        }
      } catch {
        if (!active) return;
        setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [code, data]);

  const finalOptions =
    failed || loading
      ? []
      : showall
        ? [{ value: '0000', label: '全部' }, ...options]
        : options;

  return (
    <Select
      {...rest}
      options={finalOptions}
      loading={loading || rest.loading}
      status={failed ? 'error' : rest.status}
      notFoundContent={
        failed
          ? '字典加载失败，请稍后重试'
          : loading
            ? '加载中...'
            : rest.notFoundContent
      }
    />
  );
};

export default DictSelector;
