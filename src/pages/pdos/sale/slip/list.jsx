import React from 'react';
import { connect } from 'umi';
import { Divider, Popconfirm } from 'antd';
import DataTable from '@/components/DataTable';

@connect(({ global, loading, saleSlip }) => ({
  loading: loading.models.saleSlip,
  saleSlip,
  global,
}))
export default class SlipList extends React.PureComponent{
  componentDidMount() {
    this.props.dispatch({
      type: 'saleSlip/fetch',
    });
  }

  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'saleSlip/updateState',
      payload: { selectedRowKeys: rows },
    });
  }

  // 单条删除
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'saleSlip/remove',
      payload: {
        param: [record.id],
      },
    });
  };

  // 编辑/查看
  handleEditClick = (record, operateType) => {
    if (record.id) {
      this.props.dispatch({
        type: 'saleSlip/get',
        payload: {
          operateType,
          id: record.id,
        },
      });
    }
  };

  render() {
    const { slips, selectedRowKeys } = this.props.saleSlip;
    const { loading } = this.props;
    const { dict } = this.props.global;


    const columns = [
      {
        title: '商品名称',
        name: 'goodsName',
        tableItem: {},
      }, {
        title: '来源平台',
        name: 'sourcePlatform',
        tableItem: {
          render: text => dict.online_platform && dict.online_platform[`${text}`]
        },
      }, {
        title: '订单号',
        name: 'orderCode',
        tableItem: {},
      }, {
        title: '快递费用',
        name: 'shipPrice',
        tableItem: {},
      },  {
        title: '下单价格',
        name: 'price',
        tableItem: {},
      }, {
        title: '下单数量',
        name: 'nummer',
        tableItem: {},
      }, {
        title: '总成交额',
        name: 'totalPrice',
        tableItem: {},
      },{
        title: '成本价',
        name: 'costPrice',
        tableItem: {},
      }, {
        title: '成本总计',
        name: 'totalCost',
        tableItem: {},
      }, {
        title: '利润',
        name: 'profit',
        tableItem: {},
      }, {
        title: '下单时间',
        name: 'dealTime',
        tableItem: {},
      }, {
        title: '供应商姓名',
        name: 'supplierName',
        tableItem: {},
      },{
        tableItem: {
          width: 180,
          render: (text, record) =>
              <DataTable.Oper style={{ textAlign: 'center' }}>
                <a onClick={() => this.handleEditClick(record, 'view')}>查看详情</a>
                <Divider type="vertical" />
                <a onClick={() => this.handleEditClick(record, 'edit')}>编辑</a>
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
        },
      },
    ];

    const dataTableProps = {
      columns,
      rowKey: 'id',
      showNum: true,
      loading,
      isScroll: true,
      alternateColor: true,
      dataItems: slips,
      selectType: 'checkbox',
      // rowClassName: record =>
      //   cx({ 'eva-locked': record.locked === '0001', 'eva-disabled': record.locked === '9999' }),
      selectedRowKeys,
      // onChange: this.pageChange,
      onSelect: this.handleSelectRows,
      // disabled: { locked: ['9999', '0001'] },
    };

    return <DataTable {...dataTableProps} bordered pagination />;
  }
}
