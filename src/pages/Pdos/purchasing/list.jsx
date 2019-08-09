import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider, Popconfirm, Table, Alert, Row, Col, Input, Button, Form, DatePicker } from 'antd';
import moment from 'moment';
import { getValue } from '@/utils/utils';

const { RangePicker } = DatePicker;

@Form.create()
@connect(state => ({
  purchasing: state.purchasing,
  loading: state.loading.models.purchasing,
}))
export default class PurchasingList extends PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    this.props.dispatch({
      type: 'purchasing/fetch',
    });
  }

  // 新增
  handleCreateClick = () => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        editTab: true,
        activeKey: 'edit',
        operateType: 'create',
        // 清空编辑时留存的数据
        currentItem: {},
        lineData: [],
        selectedLineRowKeys: [],
      },
    });
  };

  // 编辑
  handleEditClick = r => {
    this.props.dispatch({
      type: 'purchasing/getPurchasing',
      payload: {
        id: r.id,
      },
    });
  };

  // 查看
  handleViewClick = r => {
    this.props.dispatch({
      type: 'purchasing/viewPurchasing',
      payload: {
        id: r.id,
      },
    });
  };

  // 删除
  handleDeleteClick = r => {
    const { selectedRowKeys } = this.props.purchasing;

    const keys = r ? [r.id] : selectedRowKeys;

    if (keys.length < 1) return;

    this.props.dispatch({
      type: 'purchasing/remove',
      payload: {
        param: keys,
      },
    });
  };

  // 清除选择
  cleanSelectedKeys = () => {
    this.handleSelectRows([]);
  };

  // 行选事件
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        selectedRowKeys: rows,
      },
    });
  };

  // 搜索事件
  handleSearch = e => {
    e.preventDefault();

    const { validateFields } = this.props.form;

    // 表单验证
    validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        beginDate: fieldsValue.orderDate && fieldsValue.orderDate[0].format('YYYY-MM-DD HH:mm:ss'),
        endDate: fieldsValue.orderDate && fieldsValue.orderDate[1].format('YYYY-MM-DD HH:mm:ss'),
        ...fieldsValue,
      };
      // 删除orderdate日期数组
      delete values.orderDate;

      this.props.dispatch({
        type: 'purchasing/fetch',
        payload: values,
      });
    });
  };

  // 重置事件
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    // 重置后重新查询数据
    this.props.dispatch({
      type: 'purchasing/fetch',
    });
  };

  // 表格动作触发事件
  handleListChange = (pagination, filtersArg, sorter) => {
    const { getFieldsValue } = this.props.form;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...getFieldsValue(),
      ...filters,
    };
    if (sorter.field) {
      return;
    }

    this.props.dispatch({
      type: 'purchasing/fetch',
      payload: params,
    });
  };

  // 简单搜索条件
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline" style={{ marginBottom: 10 }}>
        <Row type="flex" justify="space-between">
          <Col>
            <Form.Item label="采购入库单号">
              {getFieldDecorator('code')(
                <Input id="account-search" placeholder="请输入采购入库单号" />
              )}
            </Form.Item>
            <Form.Item label="入库日期">
              {getFieldDecorator('orderDate')(
                <RangePicker
                  ranges={{ 默认: [moment().startOf('day'), moment().add('days', 90)] }}
                />
              )}
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                查询
              </Button>
              <Divider type="vertical" />
              <Button onClick={this.handleFormReset} loading={loading}>
                重置
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { pagination, selectedRowKeys, listData } = this.props.purchasing;
    const { loading } = this.props;

    const columns = [
      {
        render: (t, r, i) => i + 1,
        width: 30,
        fixed: 'left',
      },
      {
        title: '入库单号',
        dataIndex: 'code',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 200 }}>
              {text || '-'}
            </div>
          );
        },
        sorter: (a, b) => a.code && a.code.localeCompare(b.code),
      },
      {
        title: '入库日期',
        dataIndex: 'orderDate',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '仓库',
        dataIndex: 'stock',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 90 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '采购类型',
        dataIndex: 'purchasingType',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '制单人名称',
        dataIndex: 'operatorNm',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 60 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '采购人名称',
        dataIndex: 'purchaserNm',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '供应商名称',
        dataIndex: 'supplierNm',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 90 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '更新时间',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 145 }}>
              {text || '-'}
            </div>
          );
        },
        dataIndex: 'gmtModify',
      },
      {
        title: '操作',
        align: 'center',
        width: 120,
        fixed: 'right',
        render: (text, record) => (
          <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
            <a onClick={e => this.handleViewClick(record, e)}>查看</a>
            <Divider type="vertical" />
            <a onClick={e => this.handleEditClick(record, e)}>修改</a>
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

    // 分页
    const paginationProps = {
      ...pagination,
    };

    // 复选框
    const rowSelectionProps = {
      fixed: true,
      columnWidth: 30,
      selectedRowKeys,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
    };

    return (
      <div>
        {/* 查询条件渲染 */}
        {this.renderSimpleForm()}
        {/* 提示条幅 */}
        <div style={{ marginBottom: 10 }}>
          <Button icon="plus" type="primary" onClick={() => this.handleCreateClick()}>
            创建采购入库单
          </Button>
          {selectedRowKeys.length > 0 && (
            <span>
              <Popconfirm
                title="确定要删除选中的条目吗?"
                placement="top"
                onConfirm={() => this.handleDeleteClick()}
              >
                <Button style={{ marginLeft: 8 }} type="danger">
                  删除采购入库单
                </Button>
              </Popconfirm>
            </span>
          )}
        </div>
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
          style={{ marginBottom: 10 }}
          showIcon
        />
        <Table
          loading={loading}
          bordered
          size="small"
          rowKey={record => record.id}
          rowSelection={rowSelectionProps}
          rowClassName={record => (record.status === '0008' ? 'disabled' : 'enabled')}
          pagination={paginationProps}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleListChange}
          dataSource={listData}
          columns={columns}
        />
      </div>
    );
  }
}
