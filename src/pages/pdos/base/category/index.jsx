import React from 'react';
import { connect } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';

@connect(state => ({
  category: state.category,
}))
export default class Category extends React.PureComponent {
  render() {

    const { modalType } = this.props.category;

    return (
      <PageHeaderWrapper title="商品分类编码">
          <List />
          {modalType !== '' && <AOEForm key="category_aoeform" />}
      </PageHeaderWrapper>
    );
  }
}
