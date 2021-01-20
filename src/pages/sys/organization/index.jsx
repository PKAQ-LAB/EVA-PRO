import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useRequest } from 'umi';
import List from './list';
import AOEForm from './aoeform';

import Service from '@/services/service';
import API from '@/apis';

/**
 * 组织（部门）管理 主界面
 */
export default () => {
  const [ operateType, setOperateType ] = useState("");
  const [ currentItem, setCurrentItem ] = useState({});

  const { run, data, loading } = useRequest(() => Service.list(API.ORG_LIST), {
    formatResult: (res) => {
      return res.data;
    }
  })

  const formProps = { fetch: run,
                      data,
                      operateType,
                      currentItem,
                      setOperateType };

  const listProps = { fetch: run,
                      data,
                      loading,
                      operateType,
                      setOperateType,
                      currentItem,
                      setCurrentItem };

  return (
    <PageContainer title="组织（部门）管理" subTitle="系统组织架构管理维护">
      <List {...listProps}/>
      {operateType !== '' && <AOEForm {...formProps}/>}
    </PageContainer>
  );
}
