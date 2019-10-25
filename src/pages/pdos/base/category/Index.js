import React from 'react';
import Page from '@src/components/Page';
import { connect } from 'dva';
import PageHeaderWrapper from '@src/components/PageHeaderWrapper';
import List from './List';
import AOEForm from './AOEForm';

@connect(state => ({
  category: state.category,
}))
export default class Category extends React.PureComponent {
  render() {
    const { dispatch } = this.props;

    const { data, selectedRowKeys, modalType, currentItem } = this.props.category;

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
      <PageHeaderWrapper title="商品分类编码">
        <Page>
          <List key="category_list" {...listProps} />
          {modalType !== '' && <AOEForm key="category_aoeform" {...aoeProps} />}
        </Page>
      </PageHeaderWrapper>
    );
  }
}
