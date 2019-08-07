import React, { Component } from 'react';
import {
  Table,
  Switch,
  Icon,
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
import { connect } from 'dva';
import { hasChildren, getNodeBorther } from '@/utils/DataHelper';
import styles from './index.less';
import tableStyle from '@/common/style/Table.less';
import BizIcon from '@/components/BizIcon';

const { Search } = { ...Input };

// 部门管理列表
@connect(({ loading }) => ({
  loading: loading.models.module,
}))
export default class List extends Component {
  // 加载模块列表
  componentDidMount() {
    this.props.dispatch({
      type: 'module/listModule',
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
      type: 'module/create',
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
      type: 'module/edit',
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
      type: 'module/changeStatus',
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
        type: 'module/delete',
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
        type: 'module/delete',
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
      type: 'module/listModule',
      payload: val,
    });
  };

  // 行选
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'module/updateState',
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
      type: 'module/sortModule',
      payload: switchObj,
    });
  };

  render() {
    const { data, selectedRowKeys, loading } = this.props;

    const column = [
      {
        title: '模块名称',
        dataIndex: 'name',
      },
      {
        title: '图标',
        dataIndex: 'icon',
        render: text => <Icon type={text} />,
      },
      {
        title: 'Path',
        dataIndex: 'path',
      },
      {
        title: '上级模块',
        dataIndex: 'parentName',
      },
      {
        title: '排序',
        dataIndex: 'orders',
        render: (text, record, index) => {
          const brother = getNodeBorther(data, record.parentId);
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
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => (
          <Switch
            onChange={checked => this.handleEnable(record, checked)}
            checkedChildren={<Icon type="check" />}
            unCheckedChildren={<Icon type="close" />}
            checked={text === '0001'}
          />
        ),
      },
      {
        title: '操作',
        render: (text, record) =>
          record.status === '0001' && (
            <div>
              <a onClick={() => this.handleAdd(record)}>添加下级</a>
              <Divider type="vertical" />
              <a onClick={e => this.handleDelete(record, e)}>删除</a>
              <Divider type="vertical" />
              <a onClick={() => this.handleEdit(record)}>编辑</a>
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
                新增
              </Button>
              {selectedRowKeys.length > 0 && (
                <span>
                  <Popconfirm
                    title="确定要删除选中的条目吗?"
                    placement="top"
                    onConfirm={() => this.handleBatchDelete()}
                  >
                    <Button style={{ marginLeft: 8 }} type="danger">
                      删除菜单
                    </Button>
                  </Popconfirm>
                </span>
              )}
            </div>
          </Col>
          <Col xl={6} lg={6} md={6} sm={6} xs={6} offset={12}>
            <Search
              placeholder="输入模块名称以搜索"
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
          locale={{ emptyText: '暂无数据' }}
          rowClassName={record => (record.status === '0000' ? styles.disabled : {})}
          pagination={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </Card>
    );
  }
}
