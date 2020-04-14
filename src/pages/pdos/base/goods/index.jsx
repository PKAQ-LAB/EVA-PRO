import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';
import List from './list';
import AOEForm from './aoeform';

@connect(({ loading, goods }) => ({
  loading: loading.models.goods,
  goods,
}))
export default class Goods extends React.PureComponent{

  formRef = React.createRef();

  render() {
    const { operateType } = this.props.goods;
    return (
      <PageHeaderWrapper title="产品管理" subTitle="维护产品基础信息">
        <List/>
        { operateType !== '' && <AOEForm/> }
      </PageHeaderWrapper>
    );
  }
}
