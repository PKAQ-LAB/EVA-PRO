import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from 'umi';
import { useRequest } from 'umi';
import List from './list';
import AOEForm from './aoeform';
import { list } from './services/goodsSvc';

export default () => {

  // 初始化数据
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { initialState, setInitialState } = useModel('@@initialState');

  const dict = initialState.dict;

  const { run, tableProps } = useRequest(list, {
    paginated: true,
    formatResult: (res) => {
      return res.data;
    }
  })

  // 列表属性
  const listProps = {
    fetch: run,
    dict,
    setCurrentItem,
    setOperateType,
    tableProps,
  }

  // 表单数据
  const formPorps = {
    fetch: run,
    dict,
    operateType,
    currentItem,
    setOperateType
  }

  return (
      <PageContainer title="产品管理" subTitle="维护产品基础信息">
        <List {...listProps} />
        {operateType !== '' && <AOEForm {...formPorps} /> }
      </PageContainer>
    );
}


