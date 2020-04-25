import React, { useState } from 'react';
import { useRequest } from '@umijs/hooks';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
import { list } from './services/errorSvc';

export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps, loading } = useRequest(list, {
    paginated: true,
    formatResult: (res) => {
      return res.data;
    }
  })

  const formProps = {
    currentItem, operateType, setOperateType,
  }

  // 列表属性
  const listProps = {
    loading,
    fetch: run,
    setCurrentItem,
    operateType,
    setOperateType,
    tableProps,
  }

  return (
    <PageHeaderWrapper>
      <List {...listProps}/>
      {operateType !== '' && <AOEForm {...formProps} />}
    </PageHeaderWrapper>
  );
}
