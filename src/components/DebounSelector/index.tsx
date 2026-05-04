import { Select, type SelectProps, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface DebounSelectorOption {
  label: React.ReactNode;
  value: string | number;
  [k: string]: unknown;
}

export interface DebounSelectorProps<V = unknown>
  extends Omit<SelectProps<V>, 'options' | 'onSearch'> {
  /** 远程拉取选项的方法，参数是当前用户输入 */
  fetchOptions: (keyword: string) => Promise<DebounSelectorOption[]>;
  /** 防抖时长，单位 ms，默认 500 */
  debounceTimeout?: number;
}

/**
 * 远程数据 + 防抖搜索的 Select 组件。
 * 改写自 EVA-PRO V5 src/components/DebounSelector，去掉 lodash 依赖，
 * 用原生 setTimeout 做防抖；竞态保护用 useRef 计数器。
 */
function DebounSelector<V = unknown>({
  fetchOptions,
  debounceTimeout = 500,
  ...rest
}: DebounSelectorProps<V>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<DebounSelectorOption[]>([]);
  const fetchRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 卸载时清理悬挂的 timer，避免在 unmount 后触发 setState
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const debounceFetcher = useMemo(() => {
    return (keyword: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fetchRef.current += 1;
        const fetchId = fetchRef.current;
        setOptions([]);
        setFetching(true);
        fetchOptions(keyword)
          .then((newOptions) => {
            // 竞态：只有最新一次的请求结果会落到 state
            if (fetchId !== fetchRef.current) return;
            setOptions(newOptions);
          })
          .finally(() => {
            if (fetchId === fetchRef.current) setFetching(false);
          });
      }, debounceTimeout);
    };
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select<V>
      labelInValue
      showSearch
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...rest}
      options={options}
    />
  );
}

export default DebounSelector;
