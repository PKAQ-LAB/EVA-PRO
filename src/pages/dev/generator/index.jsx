import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Divider } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import AOEForm from './aoeform';
import List from './list';

@connect(state => ({
  item: state.item,
}))
@Form.create()
export default class Item extends PureComponent {
  componentDidMount() {
    // this.props.dispatch({
    //   type: 'item/fetch',
    // })
  }

  render() {
    return (
      <PageHeaderWrapper>
        <AOEForm />
        <Divider>数据库配置</Divider>
        <List />
      </PageHeaderWrapper>
    );
  }
}
