import React, { useState } from 'react';
import { useRequest } from 'umi';
import { PageContainer } from '@ant-design/pro-components';
import List from './list';
import AOEForm from './aoeform';

import Http from '@/utils/http';
import API from '@/apis';

export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps, loading } = useRequest(
    (param) =>Http.list(API.ERROR_LIST, param), {
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
    <PageContainer>
      <List {...listProps}/>
      {operateType !== '' && <AOEForm {...formProps} />}
    </PageContainer>
  );
}
