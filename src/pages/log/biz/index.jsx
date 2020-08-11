import React, { useState } from 'react';
import '@ant-design/compatible/assets/index.css';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useRequest } from 'umi';
import WorkList from './list';
import AOEForm from './aoeform';
import { list } from './service/bizSvc';


export default () => {
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { run, tableProps } = useRequest(list, {
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
    <PageHeaderWrapper>
      <WorkList {...listProps} />
      {operateType !== '' && <AOEForm {...formProps} />}
    </PageHeaderWrapper>
  );
}
