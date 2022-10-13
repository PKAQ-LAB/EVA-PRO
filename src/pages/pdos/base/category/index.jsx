import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useRequest } from 'umi';
import List from './list';
import AOEForm from './aoeform';

import Http from '@/utils/http';
import API from '@/services/apis';

/**
 * 商品管理 主界面
 */
export default () => {
  const [ operateType, setOperateType ] = useState("");
  const [ currentItem, setCurrentItem ] = useState({});

  const { run, data, loading } = useRequest(
    (param) => Http.list(API.CATEGORY_LIST, param), {
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
    <PageContainer title="商品分类编码">
      <List {...listProps}/>
      {operateType !== '' && <AOEForm {...formProps}/>}
    </PageContainer>
  );
}
