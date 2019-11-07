import React from 'react';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import SideLayout from '@src/components/SideLayout';
import List from './list';
import AOEForm from './aoeform';

@connect(state => ({
  dict: state.dict,
  loading: state.loading.effects['dict/listDict'],
}))
export default class Dict extends React.PureComponent {
  render() {
    return (
      <PageHeaderWrapper title="字典管理" subTitle="系统字典（码表）管理维护">
        <div style={{ padding: 15 }}>
          <SideLayout title="字典管理" width={400} bodyStyle={{ padding: 0 }} body={<List />}>
            <AOEForm />
          </SideLayout>
        </div>
      </PageHeaderWrapper>
    );
  }
}
