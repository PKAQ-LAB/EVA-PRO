import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Divider,
  Popconfirm,
  Table,
  Alert,
  Row,
  Col,
  Input,
  Button,
  Form,
  DatePicker,
  Modal,
} from 'antd';
import moment from 'moment';
import { getValue } from '@/utils/utils';

const { RangePicker } = DatePicker;

@Form.create()
@connect(state => ({
  waybillMgt: state.waybillMgt,
  loading: state.loading.models.waybillMgt,
}))
export default class WayBillMgtList extends PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    this.props.dispatch({
      type: 'waybillMgt/fetch',
    });
  }

  // 新增
  handleCreateClick = () => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
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
      type: 'waybillMgt/getWaybill',
      payload: {
        id: r.mainId,
      },
    });
  };

  // 结束操作
  handleOverClick = r => {
    const that = this;
    Modal.confirm({
      content: '结束操作后，整个运单都将被结束，不允许进出场预约操作，请确认是否继续？',
      onOk() {
        let { sr } = that.props.waybillMgt;
        if (sr) {
          sr = sr.map(item => {
            return item.mainId;
          });
        }

        const keys = r ? [r.mainId] : sr;

        if (keys.length < 1) return;

        that.props.dispatch({
          type: 'waybillMgt/gameOver',
          payload: {
            param: keys,
          },
        });
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  // 删除
  handleDeleteClick = r => {
    const { selectedRowKeys } = this.props.waybillMgt;

    const keys = r ? [r.id] : selectedRowKeys;

    if (keys.length < 1) return;

    this.props.dispatch({
      type: 'waybillMgt/remove',
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
  handleSelectRows = (rows, sr) => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: {
        selectedRowKeys: rows,
        sr,
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
        beginDate:
          fieldsValue.plannedDate && fieldsValue.plannedDate[0].format('YYYY-MM-DD HH:mm:ss'),
        endDate:
          fieldsValue.plannedDate && fieldsValue.plannedDate[1].format('YYYY-MM-DD HH:mm:ss'),
        ...fieldsValue,
      };
      delete values.plannedDate;

      this.props.dispatch({
        type: 'waybillMgt/fetch',
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
      type: 'waybillMgt/fetch',
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
      type: 'waybillMgt/fetch',
      payload: params,
    });
  };

  // 简单搜索条件
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSearch} layout="inline" style={{ marginBottom: 10 }}>
        <Row type="flex" justify="space-between">
          <Col>
            <Form.Item label="通知单/运单号">
              {getFieldDecorator('waybillNum')(
                <Input id="account-search" placeholder="请输入通知单/运单号" />
              )}
            </Form.Item>
            <Form.Item label="作业任务名称">
              {getFieldDecorator('taskName')(
                <Input id="account-search" placeholder="请输入作业任务名称" />
              )}
            </Form.Item>
            <Form.Item label="计划日期">
              {getFieldDecorator('plannedDate')(
                <RangePicker
                  ranges={{ 默认: [moment().startOf('day'), moment().add('days', 90)] }}
                />
              )}
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { pagination, selectedRowKeys, listData } = this.props.waybillMgt;
    const { loading } = this.props;

    const columns = [
      {
        render: (t, r, i) => i + 1,
        width: 30,
        fixed: 'left',
      },
      {
        title: '作业任务名称',
        dataIndex: 'taskName',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 200 }}>
              {text || '-'}
            </div>
          );
        },
        sorter: (a, b) =>
          a.companyAbbreviation && a.companyAbbreviation.localeCompare(b.companyAbbreviation),
      },
      {
        title: '通知单/运单号',
        dataIndex: 'waybillNum',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>
              {text || '-'}
            </div>
          );
        },
        sorter: (a, b) => a.waybillNum && a.waybillNum.localeCompare(b.waybillNum),
      },
      {
        title: '车牌号',
        align: 'center',
        dataIndex: 'carNum',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 90 }}>
              {text || '-'}
            </div>
          );
        },
        sorter: (a, b) => a.carNum && a.carNum.localeCompare(b.carNum),
      },
      {
        title: '货品名称',
        dataIndex: 'goodsName',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '计划量',
        dataIndex: 'planAmount',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '单位',
        align: 'center',
        dataIndex: 'unit',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 60 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '储罐编号',
        dataIndex: 'tankNumber',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '业务类型',
        align: 'center',
        dataIndex: 'businessType',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 90 }}>
              {text || '-'}
            </div>
          );
        },
      },
      {
        title: '状态',
        align: 'center',
        dataIndex: 'status',
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
        sorter: (a, b) => a.gmtModify && a.gmtModify.localeCompare(b.gmtModify),
      },
      {
        title: '操作',
        align: 'center',
        width: 120,
        fixed: 'right',
        render: (text, record) => (
          <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
            <a onClick={e => this.handleEditClick(record, e)}>修改</a>
            <Divider type="vertical" />
            {record.status !== '0008' && <a onClick={e => this.handleOverClick(record, e)}>结束</a>}
            {record.status !== '0008' && <Divider type="vertical" />}
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
      fixed: true,
      columnWidth: 30,
      selectedRowKeys,
      onChange: (selectedKeys, sr) => {
        this.handleSelectRows(selectedKeys, sr);
      },
    };

    return (
      <div>
        {this.renderSimpleForm()}
        <div style={{ marginBottom: 10 }}>
          <Button icon="plus" type="primary" onClick={() => this.handleCreateClick()}>
            创建运单
          </Button>
          {selectedRowKeys.length > 0 && (
            <span>
              <Popconfirm
                title="确定要删除选中的条目吗?"
                placement="top"
                onConfirm={() => this.handleDeleteClick()}
              >
                <Button style={{ marginLeft: 8 }} type="danger">
                  删除运单
                </Button>
              </Popconfirm>
            </span>
          )}
          {selectedRowKeys.length > 0 && (
            <Button style={{ marginLeft: 8 }} type="danger" onClick={() => this.handleOverClick()}>
              批量结束
            </Button>
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
          scroll={{ x: 1024 }}
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
