import React, { PureComponent } from 'react';
import { Table, Alert, Divider, notification, Popconfirm } from 'antd';
import { connect } from 'dva';
import styles from './List.less';
import { getValue } from '@/utils/utils';
// 部门管理列表
@connect(({ loading }) => ({
  loading: loading.models.account,
}))
@connect(state => ({
  account: state.account,
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
    const { account, name, tel, pagination } = this.props.account;
    this.props.dispatch({
      type: 'account/remove',
      payload: {
        param: [record.id],
      },
      callback: () => {
        this.props.dispatch({
          type: 'account/fetch',
          payload: {
            pageNo: pagination.current,
            account,
            name,
            tel,
          },
        });
      },
    });
  };

  // 表格动作触发事件
  handleListChange = (pagination, filtersArg, sorter) => {
    const { account, name, tel } = this.props.account;
    const { dispatch, formValues } = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      ...formValues,
      ...filters,
      pageNo: pagination.current,
      account,
      name,
      tel,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'account/updateState',
      payload: {
        pageNo: pagination.current,
      },
    });
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
        sorter: true,
      },
      {
        title: '帐号',
        align: 'left',
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
          rowClassName={record => (record.locked === '0000' ? styles.disabled : styles.enabled)}
          pagination={paginationProps}
          columns={columns}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleListChange}
        />
      </div>
    );
  }
}
