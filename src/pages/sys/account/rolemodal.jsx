import React, { Component } from 'react';
import { Modal } from 'antd';
import { Transfer } from 'antx';
import { connect } from 'dva';

@connect(state => ({
  account: state.account,
  loading: state.loading.account,
}))
export default class RoleModal extends Component {
  // 关闭窗口
  handleCancel = () => {
    this.props.dispatch({
      type: 'account/updateState',
      payload: {
        roleModal: '',
      },
    });
  };

  // 保存权限关系
  handleSubmit = () => {
    const { currentItem } = this.props.account;

    const { id } = currentItem;
    let { roles } = currentItem;

    roles = roles.map(item => {
      const obj = { id: item };
      return obj;
    });

    this.props.dispatch({
      type: 'account/grant',
      payload: {
        id,
        roles,
      },
    });
  };

  // 暂存已选
  handleSelectRows = checkedKeys => {
    const { currentItem } = this.props.account;
    currentItem.roles = checkedKeys;

    this.props.dispatch({
      type: 'account/updateState',
      payload: {
        currentItem,
      },
    });
  };

  render() {
    const { loading } = this.props;
    const { roleModal, roles, currentItem } = this.props.account;

    // 转换成符合穿梭框格式的数据
    const rolesData = roles.map(item => {
      const obj = {
        key: item.id,
        title: item.name,
      };
      return obj;
    });

    return (
      <Modal
        visible={roleModal !== ''}
        title="选择授权角色"
        okText="确定"
        cancelText="关闭"
        maskClosable={false}
        width="45%"
        confirmLoading={loading}
        onOk={() => this.handleSubmit()}
        onCancel={() => this.handleCancel()}
        bodyStyle={{ height: 456, maxHeight: 456, padding: 0, overflowY: 'auto' }}
      >
        <Transfer
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          listStyle={{ width: '45%', height: '90%' }}
          data={rolesData}
          targetKeys={currentItem.roles}
          onChange={this.handleSelectRows}
          title="角色"
          unit="个"
          searchMsg="搜索角色"
        />
      </Modal>
    );
  }
}
