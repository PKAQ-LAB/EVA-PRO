import React, { PureComponent } from 'react';
import { Modal, Tree } from 'antd';

const Node = Tree.TreeNode;
//  授权模块窗口
export default class RoleModule extends PureComponent {
  // 保存模块关系
  handleSubmit = () => {
    const { roleId } = this.props;
    const { allCheckedKeys } = { ...this.props.data };
    const modules = allCheckedKeys.map(item => ({ moduleId: item }));

    this.props.dispatch({
      type: 'role/saveModule',
      payload: {
        id: roleId,
        modules,
      },
    });
  };

  // 保存已选
  onCheck = (checkedKeys, info) => {
    const { data } = { ...this.props.data };
    const allCheckedKeys = checkedKeys.concat(info.halfCheckedKeys);
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        moduleData: {
          data,
          checked: checkedKeys,
          allCheckedKeys,
        },
      },
    });
  };

  // 渲染树节点
  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <Node title={item.name} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </Node>
        );
      }
      return <Node title={item.name} key={item.id} />;
    });

  render() {
    const { operateType, loading } = this.props;
    const { data, checked } = { ...this.props.data };
    return (
      <Modal
        maskClosable={false}
        confirmLoading={loading}
        title="选择授权模块"
        okText="保存"
        cancelText="关闭"
        onOk={() => this.handleSubmit()}
        onCancel={() => this.props.handleCancel()}
        visible={operateType === 'Module'}
        width={360}
        bodyStyle={{ height: 480, overflowY: 'auto', overflowX: 'auto' }}
      >
        <Tree checkable onCheck={this.onCheck} checkedKeys={checked}>
          {this.renderTreeNodes(data)}
        </Tree>
      </Modal>
    );
  }
}
