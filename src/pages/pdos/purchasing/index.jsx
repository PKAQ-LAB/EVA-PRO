import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { EditOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Card, Tabs } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PurchasingList from './list';
import PurchasingAOEForm from './aoeform';
import PurchasingViewForm from './viewform';

const { TabPane } = Tabs;

@connect(state => ({
  purchasing: state.purchasing,
}))
export default class Purchasing extends PureComponent {
  // tab 切换
  handleTabChange = activeKey => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        activeKey,
      },
    });
  };

  render() {
    const { editTab, activeKey, operateType, viewTab } = this.props.purchasing;

    return (
      <PageHeaderWrapper title="采购入库单" content="用于管理采购入库单信息">
        <Card bordered={false}>
          <Tabs activeKey={activeKey} onChange={this.handleTabChange}>
            {/* 列表界面 */}
            <TabPane
              tab={
                <span>
                  <UnorderedListOutlined />
                  采购入库单列表
                </span>
              }
              key="list"
            >
              <PurchasingList />
            </TabPane>

            {/* 编辑界面 */}
            {editTab && (
              <TabPane
                closable
                tab={
                  <span>
                    <EditOutlined />
                    {operateType === 'create' ? '新增采购入库单' : '编辑采购入库单'}
                  </span>
                }
                key="edit"
              >
                <PurchasingAOEForm />
              </TabPane>
            )}

            {/* 查看界面 */}
            {viewTab && (
              <TabPane
                closable
                tab={
                  <span>
                    <EditOutlined />
                    查看采购入库单
                  </span>
                }
                key="view"
              >
                <PurchasingViewForm />
              </TabPane>
            )}
          </Tabs>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
