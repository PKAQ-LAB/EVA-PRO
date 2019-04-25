import React from 'react';
import Page from '@/components/Page';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import List from './List';
import AOEForm from './AOEForm';

@connect(state => ({
  purchasingOrder: state.purchasingOrder,
}))
export default class Order extends React.PureComponent {

  render() {
    const { dispatch } = this.props;

    const { data, selectedRowKeys, modalType, currentItem } = this.props.purchasingOrder;

    const listProps = {
      dispatch,
      selectedRowKeys,
      data,
    };

    const aoeProps = {
      data,
      dispatch,
      currentItem,
      modalType,
    };

    return (
      <PageHeaderWrapper title="采购入库单">
        <Page>
          <List {...listProps} />
          {modalType !== '' && <AOEForm {...aoeProps} />}
        </Page>
      </PageHeaderWrapper>
    )
  }
}


