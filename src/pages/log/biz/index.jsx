import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useRequest } from 'umi';
import WorkList from './list';
import AOEForm from './aoeform';

import Service from '@/services/service';
import API from '@/apis';

export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps } = useRequest(
    (param) => Service.list(API.BIZLOG_LIST, param), {
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
