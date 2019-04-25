import React, { Component } from 'react';
import {
  Table,
  Switch,
  Icon,
  Alert,
  Popconfirm,
  Divider,
  Badge,
  Button,
  Card,
  Input,
  Row,
  Col,
  message,
  notification,
} from 'antd';
import tableStyle from '@/common/style/Table.less';
import { connect } from 'dva';

const { Search } = { ...Input };

// 部门管理列表
@connect(({ loading }) => ({
  loading: loading.models.purchasingOrder,
}))
export default class List extends Component {
  // 加载模块列表
  componentDidMount() {
    // this.props.dispatch({
    //   type: 'purchasingOrder/list',
    // });
  }

  // 新增
  handleAdd = () => {
    this.props.dispatch({
      type: 'purchasingOrder/create',
      payload: {
        modalType: 'create'
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
      type: 'purchasingOrder/edit',
      payload: {
        modalType: 'edit',
        id: record.id,
      },
    });
  };
  // 删除
  handleDelete = record => {
    const { dispatch } = this.props;

    dispatch({
      type: 'purchasingOrder/delete',
      payload: {
        param: [record.id],
      },
      callback: () => {
        message.success('操作成功.');
      },
    });
  };

  // 批量删除
  handleBatchDelete = () => {
    const { dispatch, selectedRowKeys } = this.props;

    dispatch({
      type: 'purchasingOrder/delete',
      payload: {
        param: selectedRowKeys,
      },
    });
  };

  // 搜索
  handleSearch = val => {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchasingOrder/list',
      payload: val,
    });
  };

  // 行选
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'purchasingOrder/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  render() {
    const { data, selectedRowKeys, loading } = this.props;

    const column = [
      {
        title: '入库单号',
        dataIndex: 'code',
      },
      {
        title: '入库日期',
        dataIndex: 'name',
      },
      {
        title: '仓库',
        dataIndex: 'name',
      },
      {
        title: '供应商',
        dataIndex: 'name',
      },
      {
        title: '采购类型',
        dataIndex: 'name',
      },
      {
        title: '采购人',
        dataIndex: 'name',
      },
      {
        title: '',
        width: 150,
        render: (text, record) => (
          <div>
            <a onClick={() => this.handleEdit(record)}>查看</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={e => this.handleDelete(record, e)}>删除</a>
          </div>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
    };

    return (
      <Card bordered={false}>
        <Row gutter={24} type="flex" justify="space-between" className={tableStyle.tableActionBtn}>
          <Col xl={6} lg={6} md={6} sm={6} xs={6}>
            <div>
              <Button icon="plus" type="primary" onClick={() => this.handleAdd('')}>
                新增采购单
              </Button>
              {selectedRowKeys.length > 0 && (
                <span>
                  <Popconfirm
                    title="确定要删除选中的条目吗?"
                    placement="top"
                    onConfirm={() => this.handleBatchDelete()}
                  >
                    <Divider type="vertical" />
                    <Button icon="delete" type="danger">删除采购单</Button>
                  </Popconfirm>
                </span>
              )}
            </div>
          </Col>
          <Col xl={6} lg={6} md={6} sm={6} xs={6} offset={12}>
            <Search
              placeholder="输入采购单编号以搜索"
              onSearch={value => this.handleSearch(value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
        {/* 已选提示 */}
        <Alert
          style={{ marginTop: 8, marginBottom: 8 }}
          message={
            <div>
              已选择 已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{' '}
              项&nbsp;&nbsp;
              <a style={{ marginLeft: 24 }} onClick={() => this.handleSelectRows([])}>
                清空选择
              </a>
            </div>
          }
          type="info"
          showIcon
        />
        {/* 列表 */}
        <Table
          columns={column}
          dataSource={data}
          loading={loading}
          defaultExpandAllRows
          pagination={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </Card>
    );
  }
}
