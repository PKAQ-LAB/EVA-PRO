import React from 'react';
import { connect } from 'dva';
import { Divider, Popconfirm, notification } from 'antd';
import cx from 'classnames';

import DataTable from '@src/components/DataTable';

@connect(state => ({
  account: state.account,
  loading: state.loading.effects['account/fetch'],
}))
export default class AccountList extends React.PureComponent {
  // 行选事件
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'account/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  // 单条删除
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'account/remove',
      payload: {
        param: [record.id],
      },
    });
  };

  // 编辑
  handleEditClick = record => {
    if (record.id) {
      this.props.dispatch({
        type: 'account/edit',
        payload: {
          modalType: 'edit',
          id: record.id,
        },
      });
    } else {
      notification.error('没有选择记录');
    }
  };

  // 权限选择
  handleRoleClick = record => {
    this.props.dispatch({
      type: 'account/edit',
      payload: {
        roleModal: 'edit',
        id: record.id,
      },
    });
  };

  // 翻页
  pageChange = pg => {
    const { dispatch, searchForm } = this.props;
    const { pageNum, pageSize } = pg;

    const params = {
      pageNo: pageNum,
      pageSize,
      ...searchForm.getFieldsValue(),
    };

    dispatch({
      type: 'account/fetch',
      payload: params,
    });
  };

  render() {
    const { loading } = this.props;
    const { users, selectedRowKeys } = this.props.account;

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
      {
        title: '账号状态',
        name: 'locked',
        dict: [
          { code: '0000', codeName: '正常' },
          { code: '0001', codeName: '已锁定' },
          { code: '0009', codeName: '系统账号' },
        ],
        tableItem: {},
      },
      {
        title: '操作',
        tableItem: {
          width: 180,
          render: (text, record) =>
            record.locked === '0000' && (
              <DataTable.Oper>
                <a onClick={e => this.handleRoleClick(record, e)}>角色授权</a>
                <Divider type="vertical" />
                <a onClick={e => this.handleEditClick(record, e)}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm
                  title="确定要删除吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleDeleteClick(record)}
                >
                  <a>删除</a>
                </Popconfirm>
              </DataTable.Oper>
            ),
        },
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
      dataItems: users,
      rowClassName: record =>
        cx({ 'eva-locked': record.locked === '0001', 'eva-disabled': record.locked === '9999' }),
      selectedRowKeys,
      onChange: this.pageChange,
      onSelect: this.handleSelectRows,
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: record.locked === '9999' || record.locked === '0001',
          name: record.name,
        }),
      },
    };

    return <DataTable pagination {...dataTableProps} />;
  }
}
