import React, { useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import SideLayout from '@/components/SideLayout';
import { useRequest } from 'umi';
import List from './list';
import AOEForm from './aoeform';
import { listDict } from './services/dictSvc';

export default () => {
  // 初始化数据
 const [operateType, setOperateType] = useState("");
 const [currentItem, setCurrentItem] = useState({});

 const { run, data, loading } = useRequest(listDict, {
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
    currentItem
  }
  return (
    <PageHeaderWrapper title="字典管理" subTitle="系统字典（码表）管理维护">
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
    </PageHeaderWrapper>
  );
}
