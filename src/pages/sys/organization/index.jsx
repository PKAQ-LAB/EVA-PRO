import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'umi';
import List from './list';
import AOEForm from './aoeform';

import Http from '@/utils/http';
import API from '@/apis';

/**
 * 组织（部门）管理 主界面
 */
export default () => {
  const [ operateType, setOperateType ] = useState("");
  const [ currentItem, setCurrentItem ] = useState({});

  const { run, data, loading } = useRequest(
    (param) => Http.list(API.ORG_LIST, param), {
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
