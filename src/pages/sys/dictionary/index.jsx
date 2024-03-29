import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import SideLayout from '@/components/SideLayout';
import { useRequest } from 'umi';
import List from './list';
import AOEForm from './aoeform';

import Http from '@/utils/http';
import API from '@/apis';

export default () => {
  // 初始化数据
 const [operateType, setOperateType] = useState("");
 const [currentItem, setCurrentItem] = useState({});

 const { run, data, loading } = useRequest(
    (param) => Http.list(API.DICT_LIST, param), {
    formatResult: (res) => {
      return res.data;
    }
  })

  // 列表属性
  const listProps = {
    operateType,
    currentItem,
    fetch: run,
    setCurrentItem,
    setOperateType,
    data,
    loading,
  }

  const formProps = {
    fetch: run,
    operateType,
    setOperateType,
    currentItem
  }
  return (
    <PageContainer title="字典管理" subTitle="系统字典（码表）管理维护">
      <div className="eva-body">
        <SideLayout
            title="字典管理"
            width={400}
            bodyStyle={{ padding: 0 }}
            layoutStyle={{ minHeight: 'calc(100vh - 215px)' }}
            body={<List {...listProps}/>}>
          <AOEForm {...formProps} />
        </SideLayout>
      </div>
    </PageContainer>
  );
}
