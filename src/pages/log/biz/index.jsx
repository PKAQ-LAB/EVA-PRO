import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'umi';
import WorkList from './list';
import AOEForm from './aoeform';

import Http from '@/utils/http';
import API from '@/services/apis';

export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps } = useRequest(
    (param) => Http.list(API.BIZLOG_LIST, param), {
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
    fetch: run,
    setCurrentItem,
    operateType,
    setOperateType,
    tableProps,
  }
  return (
    <PageContainer>
      <WorkList {...listProps} />
      {operateType !== '' && <AOEForm {...formProps} />}
    </PageContainer>
  );
}
