import React, { useState } from 'react';
import { useRequest } from '@umijs/hooks';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
import { listCategory } from './services/categorySvc';

export default () => {

  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, data, loading } = useRequest(listCategory, {
    formatResult: (res) => {
      return res.data;
    }
  })

  // 列表属性
  const listProps = {
    fetch: run,
    setCurrentItem,
    setOperateType,
    data,
    loading
  }

  const formProps = {
    operateType,
    setOperateType,
    currentItem,
    fetch,
    data
  }

  return (
    <PageHeaderWrapper title="商品分类编码">
        <List {...listProps} />
        {operateType !== '' && <AOEForm {...formProps} />}
    </PageHeaderWrapper>
  );
}
