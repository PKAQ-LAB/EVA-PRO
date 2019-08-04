import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Icon } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import PurchasingList from './list';

const { TabPane } = Tabs;

@connect(state => ({
  waybill: state.waybill,
}))
export default class purchasingIndex extends PureComponent {

  // tab 切换
  handleTabChange = (activeKey) => {
    this.props.dispatch({
      type:'waybill/updateState',
      payload: {
        activeKey
      }
    })
  }

  render() {
    const { editTab, viewTab, activeKey, operateType } = this.props.waybill;

    return (
      <PageHeaderWrapper title="采购入库单">
        <Card>
          <Tabs activeKey={activeKey} onChange={this.handleTabChange}>
            {/* 列表界面 */}
            <TabPane
              tab={
                <span>
                  <Icon type="unordered-list" />列表
                </span>
              }
              key="list"
            >
              <PurchasingList />
            </TabPane>
            {/* 编辑界面 */}
            {
              editTab &&
              <TabPane
                closable
                tab={
                  <span>
                    <Icon type="edit" />{operateType==='create'?'新增':'编辑'}
                  </span>
                }
                key="edit"
              >
                AOE FORM
              </TabPane>
            }
            {/* 查看界面 */}
            {
              viewTab &&
              <TabPane
                closable
                tab={
                  <span>
                    <Icon type="eye" />查看
                  </span>
                }
                key="view"
              >
                AOE FORM
              </TabPane>
            }
          </Tabs>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
