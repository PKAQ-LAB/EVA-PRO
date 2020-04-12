import React, { Component } from 'react';
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Table,
  Switch,
  Alert,
  Popconfirm,
  Divider,
  Button,
  Card,
  Input,
  Row,
  Col,
  message,
  notification,
} from 'antd';
import cx from 'classnames';
import { hasChildren } from '@/utils/DataHelper';
import { connect } from 'umi';

const { Search } = { ...Input };

// 部门管理列表
@connect(({ loading, category }) => ({
  category,
  loading: loading.models.category,
}))
export default class List extends Component {
  // 加载模块列表
  componentDidMount() {
    this.props.dispatch({
      type: 'category/list',
    });
  }

  // 新增
  handleAdd = record => {
    const parentId = record.status === '0001'? { parentId: record.id,} : {};

    this.props.dispatch({
      type: 'category/create',
      payload: {
        modalType: 'create',
        currentItem: parentId,
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
      type: 'category/edit',
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
      type: 'category/changeStatus',
      payload: {
        id: record.id,
        status: checked ? '0000' : '0001',
        record,
      },
    });
  };

  // 删除
  handleDelete = record => {

    const { selectedRowKeys, data } = this.props.category;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);

    if (!!record.isLeaf || blockItem) {
      message.error(`错误： [${record.name}] 存在子节点,无法删除.`);
    } else {
      this.props.dispatch({
        type: 'category/delete',
        payload: {
          param: [record.id],
        },
      });
    }
  };

  // 批量删除
  handleBatchDelete = () => {
    const { selectedRowKeys, data } = this.props.category;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);
    if (blockItem) {
      message.error(`错误： [${blockItem}] 存在子节点,无法删除.`);
    } else {
      this.props.dispatch({
        type: 'category/delete',
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
      type: 'category/list',
      payload: val,
    });
  };

  // 行选
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'category/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  render() {
    const { data, selectedRowKeys } = this.props.category;
    const { loading } = this.props;

    const column = [
      {
        title: '分类编码',
        width: 120,
        dataIndex: 'code',
      },
      {
        title: '分类名称',
        dataIndex: 'name',
      },
      {
        title: '状态',
        width: 120,
        dataIndex: 'status',
        render: (text, record) => (
          <Switch
            onChange={checked => this.handleEnable(record, checked)}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={text === '0000'}
          />
        ),
      },
      {
        title: '',
        width: 150,
        render: (text, record) => (
          <div>
            <a onClick={() => this.handleEdit(record)}>编辑</a>
            <Divider type="vertical" />

            <Popconfirm
                title="确定要删除吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleDelete(record)}
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
    };

    return (
      <Card bordered={false}>
        <Row gutter={24} type="flex" justify="space-between">
          <Col xl={6} lg={6} md={6} sm={6} xs={6}>
            <div>
              <Button icon={<PlusOutlined />} type="primary" onClick={() => this.handleAdd('')}>
                新增分类
              </Button>
              {selectedRowKeys.length > 0 && (
                <span>
                  <Popconfirm
                    title="确定要删除选中的条目吗?"
                    placement="top"
                    onConfirm={() => this.handleBatchDelete()}
                  >
                    <Divider type="vertical" />
                    <Button icon={<DeleteOutlined />} type="danger">
                      删除分类
                    </Button>
                  </Popconfirm>
                </span>
              )}
            </div>
          </Col>
          <Col xl={6} lg={6} md={6} sm={6} xs={6} offset={12}>
            <Search
              placeholder="输入分类名称以搜索"
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
          rowClassName={record =>
            cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' })
          }
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </Card>
    );
  }
}
