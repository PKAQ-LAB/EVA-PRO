import React, { useState } from 'react';
import { useRequest } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
import { list } from './services/slipSvc';

export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps } = useRequest(list, {
    paginated: true,
    formatResult: (res) => {
      return res.data;
    }
  })

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
    <PageHeaderWrapper title="线上销售单" subTitle="各线上平台销售单统计">
      <List {...listProps}/>
      {/* 新增/编辑界面 */}
      {
        operateType !== '' && <AOEForm {...formProps} />
      }
    </PageHeaderWrapper>
  );
}
