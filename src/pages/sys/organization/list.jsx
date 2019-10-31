import React, { Component } from 'react';
import {
  Table,
  Switch,
  Icon,
  Alert,
  Popconfirm,
  Divider,
  Button,
  Input,
  message,
  notification,
} from 'antd';
import { connect } from 'dva';
import cx from 'classnames';
import css from './list.less';

import { hasChildren, getNodeBorther } from '@src/utils/DataHelper';
import BizIcon from '@src/components/BizIcon';

const { Search } = { ...Input };

// 部门管理列表
@connect(state => ({
  organization: state.organization,
  loading: state.loading.organization,
}))
export default class List extends Component {
  // 加载组织列表
  componentDidMount() {
    this.props.dispatch({
      type: 'organization/listOrg',
    });
  }

  handleAdd = record => {
    const id = typeof record === 'object' ? record.parent : '';

    this.props.dispatch({
      type: 'organization/create',
      payload: {
        modalType: 'create',
        currentItem: {
          parentId: record.id,
        },
        parent: id,
      },
    });
  };

  // 编辑
  handleEdit = record => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    this.props.dispatch({
      type: 'organization/edit',
      payload: {
        modalType: 'edit',
        id: record.id,
      },
    });
  };

  // 启用/停用
  handleEnable = (record, checked) => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    this.props.dispatch({
      type: 'organization/changeStatus',
      payload: {
        id: record.id,
        status: checked ? '0000' : '0001',
      },
    });
  };

  // 删除
  handleDelete = record => {
    const { selectedRowKeys, data } = this.props.organization;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);

    if (record.isLeaf || blockItem) {
      message.error(`错误： [${record.name}] 存在子节点,无法删除.`);
    } else {
      this.props.dispatch({
        type: 'organization/delete',
        payload: {
          param: [record.id],
        },
        callback: () => {
          message.success('操作成功.');
        },
      });
    }
  };

  // 批量删除
  handleBatchDelete = () => {
    const { selectedRowKeys, data } = this.props.organization;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);
    if (blockItem) {
      message.error(`错误： [${blockItem}] 存在子节点,无法删除.`);
    } else {
      this.props.dispatch({
        type: 'organization/delete',
        payload: {
          param: selectedRowKeys,
        },
      });
    }
    // end if/else
  };

  // 搜索
  handleSearch = val => {
    this.props.dispatch({
      type: 'organization/listOrg',
      payload: {
        name: val,
      },
    });
  };

  // 行选
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'organization/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  // 排序操作
  handleSort = (nodes, index, upOrDown) => {
    const orginOrders = index;
    const targetID = upOrDown === 'up' ? nodes[index - 1].id : nodes[index + 1].id;
    const targetOrders = upOrDown === 'up' ? index - 1 : index + 1;
    const switchObj = [
      {
        id: nodes[index].id,
        orders: targetOrders,
      },
      {
        id: targetID,
        orders: orginOrders,
      },
    ];
    this.props.dispatch({
      type: 'organization/sortOrg',
      payload: switchObj,
    });
  };

  render() {
    const { loading } = this.props;
    const { data, selectedRowKeys } = this.props.organization;

    const column = [
      {
        title: '单位/部门名称',
        dataIndex: 'name',
      },
      {
        title: '所属单位/部门',
        dataIndex: 'parentName',
      },
      {
        title: '排序',
        dataIndex: 'orders',
        render: (text, record, index) => {
          if (record.status === '0000') {
            const brother = getNodeBorther(this.props.organization.data, record.parentId);
            const size = brother.length;
            return (
              <div>
                {text}
                <Divider type="vertical" />
                {size !== 0 && index !== size - 1 ? (
                  <BizIcon
                    onClick={() => this.handleSort(brother, index, 'down')}
                    type="descending"
                    style={{ color: '#098FFF', cursor: 'pointer' }}
                  />
                ) : (
                  <BizIcon type="descending" />
                )}
                {size !== 0 && index !== 0 ? (
                  <BizIcon
                    onClick={() => this.handleSort(brother, index, 'up')}
                    style={{ color: '#098FFF', cursor: 'pointer' }}
                    type="ascending"
                  />
                ) : (
                  <BizIcon type="ascending" />
                )}
              </div>
            );
          }
          return '';
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) =>
          record.status !== '9999' && (
            <Switch
              onChange={checked => this.handleEnable(record, checked)}
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
              checked={text === '0000'}
            />
          ),
      },
      {
        title: '操作',
        render: (text, record) =>
          record.status === '0000' && (
            <div>
              <a onClick={() => this.handleAdd(record)}>添加下级</a>
              <Divider type="vertical" />
              <a onClick={() => this.handleEdit(record)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm
                title="确定要删除吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={e => this.handleDelete(record, e)}
              >
                <a>删除</a>
              </Popconfirm>
            </div>
          ),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
      getCheckboxProps: record => ({
        disabled: record.status === '9999',
      }),
    };

    return (
      <div style={{ padding: 15 }}>
        <div className={css.ribbon}>
          <div>
            <Button icon="plus" type="primary" onClick={() => this.handleAdd('')}>
              新增部门
            </Button>
            {selectedRowKeys.length > 0 && (
              <span>
                <Popconfirm
                  title="确定要删除选中的条目吗?"
                  placement="top"
                  onConfirm={() => this.handleBatchDelete()}
                >
                  <Button style={{ marginLeft: 8 }} type="danger">
                    删除部门
                  </Button>
                </Popconfirm>
              </span>
            )}
          </div>
          <div>
            <Search
              placeholder="输入组织名称以搜索"
              onSearch={value => this.handleSearch(value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        {/* 已选提示 */}
        {selectedRowKeys.length > 0 && (
          <Alert
            style={{ marginTop: 8, marginBottom: 8 }}
            message={
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                <a style={{ marginLeft: 24 }} onClick={() => this.handleSelectRows([])}>
                  清空选择
                </a>
              </div>
            }
            type="info"
            showIcon
          />
        )}

        {/* 列表 */}
        <Table
          size="small"
          columns={column}
          dataSource={data}
          defaultExpandAllRows
          loading={loading}
          rowClassName={record =>
            cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' })
          }
          pagination={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </div>
    );
  }
}
