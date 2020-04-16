import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useSelector } from 'umi';
import { useRequest } from '@umijs/hooks';
import List from './list';
import AOEForm from './aoeform';
import { list } from './services/goodsSvc';

export default () => {
  // 初始化数据
  const [operateType, setOperateType] = useState("");
  const [currentItem, setCurrentItem] = useState({});
  const [listData, setListData] = useState({});
  const dict = useSelector(state => state.global.dict);

  const { run } = useRequest(list, {
    onSuccess: (res) => {
      setListData(res.data);
    }
  })

  // 状态更改
  useEffect(() => {
    setOperateType(operateType);
  }, [operateType]);

  // 列表属性
  const listProps = {
    fetch: run,
    dict,
    setCurrentItem,
    setOperateType,
    listData,
    setListData,
  }

  // 表单数据
  const formPorps = {
    fetch: run,
    dict,
    operateType,
    currentItem,
    setListData,
    setOperateType
  }

  return (
      <PageHeaderWrapper title="产品管理" subTitle="维护产品基础信息">
        <List {...listProps} />
        {operateType !== '' && <AOEForm {...formPorps} /> }
      </PageHeaderWrapper>
    );
}


