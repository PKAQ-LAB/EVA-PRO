import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from 'umi';
import { useAntdTable } from 'ahooks';
import List from './list';
import AOEForm from './aoeform';
import Svc from '@/services/service';
import API from '@/apis'

export default () => {

  // 初始化数据
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { initialState, setInitialState } = useModel('@@initialState');

  const { dict } = initialState;

  const { run, tableProps } = useAntdTable(async () => {
    const res = await Svc.list(API.SHOP_LIST);
    return res.data;
  }, {pageSize: 15})

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
      <PageContainer title="店铺管理" subTitle="店铺基础信息管理">
        <List {...listProps} />
        {operateType !== '' && <AOEForm {...formPorps} /> }
      </PageContainer>
    );
}


