import React from 'react';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
/**
 * 模块（菜单）管理 主界面
 */
@connect(state => ({
  module: state.module,
}))
export default class Module extends React.PureComponent {
  render() {
    const { modalType } = this.props.module;

    return (
      <PageHeaderWrapper title="模块管理" subTitle="系统模块（菜单）管理维护">
        <List />
        {modalType !== '' && <AOEForm />}
      </PageHeaderWrapper>
    );
  }
}
