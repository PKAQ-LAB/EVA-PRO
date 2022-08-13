import React, { PureComponent } from 'react';
import { connect } from 'umi';
import '@ant-design/compatible/assets/index.css';
import { Divider } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import AOEForm from './aoeform';
import List from './list';

@connect(state => ({
  item: state.item,
}))
export default class Item extends PureComponent {
  componentDidMount() {
    // this.props.dispatch({
    //   type: 'item/fetch',
    // })
  }

  render() {
    return (
      <PageContainer>
        <AOEForm />
        <Divider>数据库配置</Divider>
        <List />
      </PageContainer>
    );
  }
}
