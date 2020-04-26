import React, { useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useRequest } from '@umijs/hooks';
import List from './list';
import AOEForm from './aoeform';
import { listModule } from './services/moduleSvc';
/**
 * 模块（菜单）管理 主界面
 */
export default () => {
 // 初始化数据
 const [operateType, setOperateType] = useState("");
 const [currentItem, setCurrentItem] = useState({});

 const { run, data, loading } = useRequest(listModule, {
  formatResult: (res) => {
    return res.data;
  }
})

// 列表属性
const listProps = {
  fetch: run,
  setCurrentItem,
  setOperateType,
  data,
  loading,
}

const formProps = {
  data,
  fetch: run,
  currentItem,
  setCurrentItem,
  operateType,
  setOperateType,
}

 return (
   <PageHeaderWrapper title="模块管理" subTitle="系统模块（菜单）管理维护">
     <List {...listProps} />
     {operateType !== '' && <AOEForm {...formProps} />}
   </PageHeaderWrapper>
 );
}
