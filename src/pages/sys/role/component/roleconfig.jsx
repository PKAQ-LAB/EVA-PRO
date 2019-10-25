import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import building from '@src/assets/building.png';

@connect(state => ({
  role: state.role,
}))
export default class RoleConfig extends Component {
  // 关闭窗口
  handleCancel = () => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        operateType: '',
      },
    });
  };

  render() {
    const { operateType } = this.props.role;
    return (
      <Modal
        visible={operateType === 'Config'}
        maskClosable={false}
        title="选择授权配置"
        okText="确定"
        cancelText="关闭"
        onOk={() => this.handleCancel()}
        onCancel={() => this.handleCancel()}
        bodyStyle={{ backgroundColor: '#F9F9F9' }}
      >
        <div style={{ textAlign: 'center' }}>
          <img alt="" src={building} />
          <h1>建设中</h1>
          <h3>敬请期待</h3>
        </div>
      </Modal>
    );
  }
}
