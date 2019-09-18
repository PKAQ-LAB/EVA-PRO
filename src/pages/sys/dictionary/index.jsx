import React from 'react';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import SideLayout from '@/components/SideLayout';
import List from './list';
import AOEForm from './aoeform';

@connect(state => ({
  dict: state.dict,
  loading: state.loading.effects['dict/listDict'],
}))
export default class Dict extends React.PureComponent {
  render() {
    return (
      <PageHeaderWrapper>
        <div style={{ padding: 15 }}>
          <SideLayout title="字典管理" width={400} bodyStyle={{ padding: 0 }} body={<List />}>
            <AOEForm />
          </SideLayout>
        </div>
      </PageHeaderWrapper>
    );
  }
}
