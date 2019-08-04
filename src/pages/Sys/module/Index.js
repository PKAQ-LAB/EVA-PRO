import React from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import List from './List';
import AOEForm from './AOEForm';

@connect(state => ({
  module: state.module,
  submitting: state.loading.effects['module/save'],
}))
export default class Module extends React.PureComponent {
  // 组件加载完成后加载数据
  render() {
    const { dispatch, submitting } = this.props;
    const { data, selectedRowKeys, modalType, currentItem } = this.props.module;

    const tableProps = {
      dispatch,
      selectedRowKeys,
      data,
    };

    const modalProps = {
      data,
      dispatch,
      currentItem,
      modalType,
      submitting
    };

    return (
      <PageHeaderWrapper title="模块管理">
        <List {...tableProps} />
        {modalType !== '' && <AOEForm {...modalProps} />}
      </PageHeaderWrapper>
    );
  }
}
