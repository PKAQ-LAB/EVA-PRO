import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Icon } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import WaybillMgtList from './list';
import WayBillMgtAOEForm from './aoeform';

const { TabPane } = Tabs;

@connect(state => ({
  waybillMgt: state.waybillMgt,
}))
export default class WayBillMgt extends PureComponent {
  // tab 切换
  handleTabChange = activeKey => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: {
        activeKey,
      },
    });
  };

  render() {
    const { editTab, activeKey, operateType } = this.props.waybillMgt;

    return (
      <PageHeaderWrapper title="运单管理" content="用于管理进出封闭区的物流运输运单信息">
        <Card>
          <Tabs activeKey={activeKey} onChange={this.handleTabChange}>
            {/* 列表界面 */}
            <TabPane
              tab={
                <span>
                  <Icon type="unordered-list" />
                  运单列表
                </span>
              }
              key="list"
            >
              <WaybillMgtList />
            </TabPane>

            {/* 编辑界面 */}
            {editTab && (
              <TabPane
                closable
                tab={
                  <span>
                    <Icon type="edit" />
                    {operateType === 'create' ? '新增运单' : '编辑运单'}
                  </span>
                }
                key="edit"
              >
                <WayBillMgtAOEForm />
              </TabPane>
            )}
          </Tabs>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
