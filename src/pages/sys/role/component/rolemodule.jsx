import React, { Component } from 'react';
import { Modal, Table, Checkbox } from 'antd';
import { connect } from 'dva';

@connect(state => ({
  role: state.role,
  loading: state.loading.role,
}))
export default class RoleModule extends Component {
  // 关闭窗口
  handleCancel = () => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        operateType: '',
      },
    });
  };

  // 保存模块关系
  handleSubmit = () => {
    const { roleId } = this.props.role;
    const { checked } = { ...this.props.role.modules };
    const modules = checked.map(item => ({ moduleId: item }));

    this.props.dispatch({
      type: 'role/saveModule',
      payload: {
        id: roleId,
        modules,
      },
    });
  };

  // 暂存已选
  handleSelectRows = checkedKeys => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        modules: {
          ...this.props.role.modules,
          checked: checkedKeys,
        },
      },
    });
  };

  handleResourceClick = (e, rid) => {
    const { selectedResources } = this.props.role;
    selectedResources[rid] = e;
  };

  render() {
    const { loading } = this.props;
    const { operateType, modules } = this.props.role;

    const columns = [
      {
        title: '模块名称',
        dataIndex: 'name',
      },
      {
        title: '资源权限',
        align: 'left',
        dataIndex: 'resources',
        render: (item, record) => {
          const options = item && item.map(r => ({ label: r.resourceDesc, value: r.id }));
          // eslint-disable-next-line max-len
          return (
            <Checkbox.Group
              options={options}
              onChange={e => this.handleResourceClick(e, record.id)}
            />
          );
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys: modules.checked,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
    };

    return (
      <Modal
        visible={operateType === 'Module'}
        title="选择授权模块"
        okText="确定"
        cancelText="关闭"
        width="45%"
        onOk={() => this.handleSubmit()}
        onCancel={() => this.handleCancel()}
        bodyStyle={{ height: 456, maxHeight: 456, padding: 0, overflowY: 'auto' }}
      >
        <Table
          size="small"
          style={{ height: 456, maxHeight: 456 }}
          defaultExpandAllRows
          columns={columns}
          dataSource={modules.records}
          loading={loading}
          pagination={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </Modal>
    );
  }
}
