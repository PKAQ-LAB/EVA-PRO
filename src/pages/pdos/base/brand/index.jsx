import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useModel, useRequest } from 'umi';
import { useAntdTable } from 'ahooks';
import List from './list';
import AOEForm from './aoeform';
import Svc from '@/utils/http';
import API from '@/services/apis'

export default () => {

  // 初始化数据
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});

  const { initialState, setInitialState } = useModel('@@initialState');

  const { dict } = initialState;

  const { run, tableProps } = useAntdTable(async (args) => {
    const res = await Svc.list(API.BRAND_LIST, args);
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
      <PageContainer title="品牌管理" subTitle="品牌信息管理">
        <List {...listProps} />
        {operateType !== '' && <AOEForm {...formPorps} /> }
      </PageContainer>
    );
}


