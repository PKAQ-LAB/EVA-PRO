import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider, Popconfirm, Table, Alert } from 'antd';

@connect(state => ({
  waybill: state.waybill,
}))
export default class PurchasingList extends PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    this.props.dispatch({
      type: 'waybill/fetch',
    });
  }

  // 新增
  handleCreateClick = () => {
    this.props.dispatch({
      type:'waybill/updateState',
      payload: {
        editTab: true,
        activeKey: 'edit',
        operateType: 'create',
      }
    })
  }

  // 编辑
  handleEditClick = (r, e) => {
    this.props.dispatch({
      type:'waybill/updateState',
      payload: {
        editTab: true,
        activeKey: 'edit',
        operateType: 'edit',
      }
    })
  }

  // 查看
  handleViewClick = (r, e) => {
    this.props.dispatch({
      type:'waybill/updateState',
      payload: {
        viewTab: true,
        activeKey: "view"
      }
    })
  }

  // 删除
  handleDeleteClick = (r) => {

  }

  // 清除选择
  cleanSelectedKeys = () => {
    this.handleSelectRows([]);
  };

  // 行选事件
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'waybill/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  render() {
    const { pagination, selectedRowKeys, loading, listData } = this.props.waybill;

    const columns = [
      {
        render: (t, r, i) => i + 1,
        width: 30,
        fixed: 'left',
      },{
        title: '企业简称',
        align: 'left',
        dataIndex: 'companyAbbreviation',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>
              { text }
            </div>
          )
        },
        sorter: (a, b) =>
          a.companyAbbreviation && a.companyAbbreviation.localeCompare(b.companyAbbreviation),
      },{
        title: '通知单/运单号',
        align: 'left',
        dataIndex: 'waybillNum',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>
              { text }
            </div>
          )
        },
        sorter: (a, b) => a.waybillNum && a.waybillNum.localeCompare(b.waybillNum),
      },{
        title: '车牌号',
        align: 'center',
        dataIndex: 'carNum',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 90 }}>
              { text }
            </div>
          )
        },
        sorter: (a, b) => a.carNum && a.carNum.localeCompare(b.carNum),
      },{
        title: '货品名称',
        align: 'left',
        dataIndex: 'goodsName',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>
              { text }
            </div>
          )
        }
      },{
        title: '计划量',
        align: 'left',
        dataIndex: 'planAmount',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
              { text }
            </div>
          )
        }
      },{
        title: '单位',
        align: 'center',
        dataIndex: 'unit',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 60 }}>
              { text }
            </div>
          )
        }
      },{
        title: '储罐编号',
        align: 'left',
        dataIndex: 'tankNumber',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
              { text }
            </div>
          )
        }
      },{
        title: '业务类型',
        align: 'center',
        dataIndex: 'businessType',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 90 }}>
              { text }
            </div>
          )
        }
      },{
        title: '更新时间',
        align: 'left',
        render: (text) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
              { text }
            </div>
          )
        },
        dataIndex: 'gmtModify',
        sorter: (a, b) => a.gmtModify && a.gmtModify.localeCompare(b.gmtModify),
      },{
        fixed: 'right',
        width: 120,
        render: (text, record) => (
          <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
            <a onClick={e => this.handleEditClick(record, e)}>修改</a>
            <Divider type="vertical" />
            <a onClick={e => this.handleViewClick(record, e)}>查看</a>
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
      fixed: true,
      columnWidth: 30,
      selectedRowKeys,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
    };

    return (
      <div className="standardTable">
        <div className="tableAlert">
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
          bordered
          size="small"
          scroll={{ x: 1024, }}
          rowKey={record => record.id}
          rowSelection={rowSelectionProps}
          rowClassName={record => (record.locked === '0002' ? "disabled" : "enabled")}
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
