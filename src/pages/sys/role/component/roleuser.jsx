import React, { PureComponent } from 'react';
import { Modal, Tree, Card, Row, Col } from 'antd';
import { connect } from 'dva';
import DataTable from '@/components/DataTable';
import cs from './roleuser.less';

// 授权用户窗口
@connect(state => ({
  role: state.role,
  loading: state.loading.role,
}))
export default class RoleUser extends PureComponent {
  // 树节点选择
  handleTreeSelect = selectedKeys => {
    const { roleId } = this.props.role;
    const values = {
      roleId,
      deptId: selectedKeys[0],
    };
    this.props.dispatch({
      type: 'role/listUserByDept',
      payload: values,
    });
  };

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
    const { roleId } = this.props;
    const { checked } = { ...this.props.data };

    let users = [];
    if (checked && checked.length > 0) {
      users = checked.map(item => ({ userId: item }));
    }
    this.props.dispatch({
      type: 'role/saveUser',
      payload: {
        id: roleId,
        users,
      },
    });
  };

  // 行选事件
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  // 保存已选
  handleSelectRows = checkedKeys => {
    const { data } = { ...this.props.data };
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        userData: {
          data,
          checked: checkedKeys,
        },
      },
    });
  };

  render() {
    const { loading } = this.props;
    const { operateType, users, orgs } = this.props.role;

    const columns = [
      {
        title: '姓名',
        name: 'name',
        tableItem: {},
      },
      {
        title: '账号',
        name: 'account',
        tableItem: {},
      },
      {
        title: '所属部门',
        name: 'deptName',
        tableItem: {},
      },
      {
        title: '手机',
        name: 'tel',
        tableItem: {},
      },
    ];

    const dataTableProps = {
      columns,
      rowKey: 'id',
      loading,
      showNum: true,
      isScroll: true,
      alternateColor: true,
      selectType: 'checkbox',
      dataItems: users.records,
      onChange: this.pageChange,
      onSelect: this.handleSelectRows,
    };

    return (
      <Modal
        confirmLoading={loading}
        visible={operateType === 'User'}
        title="选择授权用户"
        okText="保存"
        cancelText="关闭"
        onOk={() => this.handleSubmit()}
        onCancel={() => this.handleCancel()}
        width="60%"
        bodyStyle={{ overflowY: 'auto', overflowX: 'auto', padding: 0 }}
      >
        <Row>
          <Col span={6}>
            <Card title="所属部门" className={cs.orgtree}>
              <Tree
                showLine
                blockNode
                onSelect={this.handleTreeSelect}
                treeData={orgs}
                style={{ height: 456, overflowY: 'auto' }}
              />
            </Card>
          </Col>
          <Col span={18}>
            <DataTable
              pagination
              {...dataTableProps}
              style={{ height: 456 }}
              className={cs.table}
            />
          </Col>
        </Row>
      </Modal>
    );
  }
}
