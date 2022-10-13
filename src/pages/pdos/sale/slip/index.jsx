import React, { useState } from 'react';
import { useRequest } from 'umi';
import { useAntdTable } from 'ahooks';
import { PageContainer } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';

import Http from '@/utils/http';
import API from '@/services/apis';

export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps } = useAntdTable(async () => {
    const res = await Http.list(API.ORDER_LIST);
    return res.data;
  }, {pageSize: 15});

  const listProps = {
    fetch: run,
    setCurrentItem,
    setOperateType,
    tableProps,
  }

  const formProps = {
    operateType, setOperateType, currentItem, fetch: run
  }

  return (
    <PageContainer title="线上销售单" subTitle="各线上平台销售单统计">
      <List {...listProps}/>
      {/* 新增/编辑界面 */}
      {
        operateType !== '' && <AOEForm {...formProps} />
      }
    </PageContainer>
  );
}
