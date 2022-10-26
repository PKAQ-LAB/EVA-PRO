import React, { useMemo, useState, useRef } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { request } from '@umijs/max';
import { render } from 'react-dom';

/**
 * 结合远程数据的输入提示选择组件（防抖）
 */
export default (props) => {

  const { fetchOptions, debounceTimeout = 800, ...attrs } = props;

  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const [value, setValue] = useState([]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      labelInValue
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
      showSearch={true}
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...attrs}
      options={options}
    />
  );
}

