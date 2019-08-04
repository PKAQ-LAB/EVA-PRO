import React, { PureComponent } from 'react';
import { Table, Alert, Divider, notification, Popconfirm } from 'antd';
import { connect } from 'dva';
import styles from './List.less';
import { getValue } from '@/utils/utils';
// 部门管理列表
@connect(({ loading }) => ({
  loading: loading.models.account,
}))
export default class List extends PureComponent {
  // 清除选择
  cleanSelectedKeys = () => {
    this.handleSelectRows([]);
  };

  // 行选事件
  handleSelectRows = rows => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/updateState',
      payload: { selectedRowKeys: rows },
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

  // 单条删除
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'account/remove',
      payload: {
        param: [record.id],
      },
    });
  };

  // 表格动作触发事件
  handleListChange = (pagination, filtersArg, sorter) => {
    const { dispatch, formValues } = this.props;

    if (sorter.field) {
      return;
    }

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };

    dispatch({
      type: 'account/fetch',
      payload: params,
    });
  };

  render() {
    const { list, pagination, selectedRowKeys, loading } = this.props;

    const columns = [
      {
        render: (t, r, i) => i + 1,
        width: 30,
      },
      {
        title: '姓名',
        align: 'left',
        dataIndex: 'name',
        width: 140,
        sorter: (a, b) => a.name && a.name.localeCompare(b.name),
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: '帐号',
        align: 'left',
        sorter: (a, b) => a.account && a.account.localeCompare(b.account),
        dataIndex: 'account',
        width: 200,
      },
      {
        title: '手机',
        align: 'left',
        width: 180,
        dataIndex: 'tel',
      },
      {
        title: '是否锁定',
        align: 'left',
        width: 180,
        dataIndex: 'locked',
      },
      {
        align: 'center',
        render: (text, record) => (
          <div>
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
          </div>
        ),
      },
    ];

    const paginationProps = {
      ...pagination,
    };

    const rowSelectionProps = {
      selectedRowKeys,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
    };
    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          <Alert
            message={
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  清空选择
                </a>
              </div>
            }
            type="info"
            showIcon
          />
        </div>
        <Table
          loading={loading}
          locale={{ emptyText: '暂无数据' }}
          bordered
          dataSource={list}
          rowKey={record => record.id}
          rowSelection={rowSelectionProps}
          rowClassName={record => (record.locked === '0001' ? styles.disabled : styles.enabled)}
          pagination={paginationProps}
          columns={columns}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleListChange}
        />
      </div>
    );
  }
}
