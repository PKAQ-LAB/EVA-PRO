import React, { useState } from 'react';
import { useAntdTable } from 'ahooks';
import { PageContainer } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
import Svc from '@/utils/http';
import API from '@/services/apis'

export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps } = useAntdTable(async () => {
    const res = await Svc.list(API.SUPPLIER_LIST);
    return res.data;
  }, { pageSize: 15 })

  const listProps = {
    fetch: run,
    setCurrentItem,
    setOperateType,
    tableProps,
  }

  const formProps = {
    operateType,
    setOperateType,
    initialValues: 'create' === operateType? {} : {...currentItem},
    fetch: run
  }

  return (
    <PageContainer title="供应商管理" subTitle="供应商管理">
      <List {...listProps} />
      {/* 新增/编辑界面 */}
      {
        operateType !== '' && <AOEForm {...formProps} />
      }
    </PageContainer>
  );
}
