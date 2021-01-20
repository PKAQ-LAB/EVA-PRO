import React, { useState } from 'react';
import { useRequest } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
import RoleUser from './component/roleuser';
import RoleConfig from './component/roleconfig';
import RoleModule from './component/rolemodule';

import Service from '@/services/service';
import API from '@/apis';
/**
 * 角色（权限）管理 主界面
 */
export default () => {

  const [ roleId, setRoleId ] = useState("");
  const [ operateType, setOperateType ] = useState("");
  const [ modalType, setModalType ] = useState("");
  const [ currentItem, setCurrentItem ] = useState({});
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([]);

  const { run, tableProps, loading } = useRequest(
    () => Service.list(API.ROLE_LIST), {
    paginated: true,
    formatResult: (res) => {
      return { list: res.data };
    }
  })

  // 表格属性
  const listPorps = {
    fetch: run,
    loading,
    selectedRowKeys,
    setSelectedRowKeys,
    tableProps,
    setCurrentItem,
    setOperateType,
    setModalType,
    setRoleId
  }

  const formProps = {
    fetch: run,
    currentItem,
    modalType,
    setModalType
  }

  const configProps = {
    operateType,
    setOperateType,
  }

  const moduleProps = {
    fetch: run,
    operateType,
    setOperateType,
    currentItem,
    roleId,
    setRoleId
  }

  return (
    <PageContainer title="角色管理" subTitle="系统用户角色权限管理维护">
      <List {...listPorps} />
      {/* 新增窗口 */}
      {modalType !== '' && <AOEForm {...formProps} />}
      {/* 用户授权 */}
      {operateType === 'User' && <RoleUser {...moduleProps}/>}
      {/* 配置授权 */}
      {operateType === 'Config' && <RoleConfig {...configProps} />}
      {/* 模块授权 */}
      {operateType === 'Module' && <RoleModule {...moduleProps}/>}
    </PageContainer>
  );
}
