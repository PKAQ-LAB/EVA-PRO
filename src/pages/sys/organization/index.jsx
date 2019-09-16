import React from 'react';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
/**
 * 组织（部门）管理 主界面
 */
@connect(state => ({
  organization: state.organization,
}))
export default class Module extends React.PureComponent {
  render() {
    const { modalType } = this.props.organization;

    return (
      <PageHeaderWrapper>
        <List />
        {modalType !== '' && <AOEForm />}
      </PageHeaderWrapper>
    );
  }
}
