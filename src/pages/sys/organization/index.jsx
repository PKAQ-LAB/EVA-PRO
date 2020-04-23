import React, { useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useRequest } from '@umijs/hooks';
import List from './list';
import AOEForm from './aoeform';
import { listOrg } from './services/orgSvc';
/**
 * 组织（部门）管理 主界面
 */

export default () => {
  const [ operateType, setOperateType ] = useState("");
  const [ currentItem, setCurrentItem ] = useState({});

  const { run, data, loading } = useRequest(listOrg, {
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
    <PageHeaderWrapper title="组织（部门）管理" subTitle="系统组织架构管理维护">
      <List {...listProps}/>
      {operateType !== '' && <AOEForm {...formProps}/>}
    </PageHeaderWrapper>
  );
}
