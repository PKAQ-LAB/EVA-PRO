import React from 'react';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
import RoleUser from './component/roleuser';
import RoleConfig from './component/roleconfig';
import RoleModule from './component/rolemodule';
/**
 * 角色（权限）管理 主界面
 */

@connect(state => ({
  role: state.role,
  loading: state.loading.role,
}))
export default class Role extends React.PureComponent {
  render() {
    const { modalType, operateType } = this.props.role;
    return (
      <PageHeaderWrapper title="角色管理" subTitle="系统用户角色权限管理维护">
        <div className="eva-body">
          <List />
        </div>
        {/* 新增窗口 */}
        {modalType !== '' && <AOEForm />}
        {/* 用户授权 */}
        {operateType === 'User' && <RoleUser />}
        {/* 配置授权 */}
        {operateType === 'Config' && <RoleConfig />}
        {/* 模块授权 */}
        {operateType === 'Module' && <RoleModule />}
      </PageHeaderWrapper>
    );
  }
}
