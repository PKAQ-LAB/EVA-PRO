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
import { hasChildren, getNodeBorther } from '@src/utils/DataHelper';
import styles from './Index.less';
import tableStyle from '@src/common/style/Table.less';
import { connect } from 'dva';

const { Search } = { ...Input };

// 部门管理列表
@connect(({ loading }) => ({
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
    const parentId =
      record.status === '0001'
        ? {
            parentId: record.id,
          }
        : {};

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
        status: checked ? '0001' : '0000',
        record,
      },
    });
  };

  // 删除
  handleDelete = record => {
    const { dispatch, selectedRowKeys, data } = this.props;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);

    if (!!record.isLeaf || blockItem) {
      message.error(`错误： [${record.name}] 存在子节点,无法删除.`);
    } else {
      dispatch({
        type: 'category/delete',
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
    const { dispatch, selectedRowKeys, data } = this.props;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);
    if (blockItem) {
      message.error(`错误： [${blockItem}] 存在子节点,无法删除.`);
    } else {
      dispatch({
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
    const { dispatch } = this.props;
    dispatch({
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
    const { data, selectedRowKeys, loading } = this.props;

    const column = [
      {
        title: '分类编码',
        dataIndex: 'code',
      },
      {
        title: '分类名称',
        dataIndex: 'name',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => (
          <Switch
            onChange={checked => this.handleEnable(record, checked)}
            checkedChildren={<Icon type="check" />}
            unCheckedChildren={<Icon type="close" />}
            checked={'0001' === text}
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
                    <Button icon="delete" type="danger">
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
          rowClassName={record => (record.status === '0000' ? styles.disabled : styles.enabled)}
          pagination={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </Card>
    );
  }
}
