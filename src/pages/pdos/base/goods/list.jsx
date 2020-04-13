import React from 'react';
import { connect } from 'umi';
import cx from 'classnames';
import { Divider, Popconfirm } from 'antd';
import DataTable from '@/components/DataTable';

@connect(({ global, loading, goods }) => ({
  loading: loading.models.goods,
  goods,
  global,
}))
export default class SlipList extends React.PureComponent{
  componentDidMount() {
    this.props.dispatch({
      type: 'goods/fetch',
    });
  }

  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'goods/updateState',
      payload: { selectedRowKeys: rows },
    });
  }

  // 单条删除
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'goods/remove',
      payload: {
        param: [record.id],
      },
    });
  };

  // 编辑/查看
  handleEditClick = (record, operateType) => {
    if (record.id) {
      this.props.dispatch({
        type: 'goods/get',
        payload: {
          operateType,
          id: record.id,
        },
      });
    }
  };

  render() {
    const { goods, selectedRowKeys } = this.props.goods;
    const { loading } = this.props;
    const { dict } = this.props. global;


    const columns = [
      {
        title: '品名',
        name: 'name',
        tableItem: {},
      }, {
        title: '品类',
        name: 'name',
        tableItem: {},
      }, {
        title: '货号',
        name: 'itemNo',
        tableItem: {},
      }, {
        title: '助记码',
        name: 'mnemonic',
        tableItem: {},
      }, {
        title: '单位',
        name: 'unit',
        tableItem: {
          render: text => dict.unit && dict.unit[`${text}`]
        },
      },  {
        title: '装箱规格',
        name: 'boxunit',
        tableItem: {},
      }, {
        title: '生产厂家',
        name: 'factory',
        tableItem: {},
      },{
        title: '条码',
        name: 'barcode',
        tableItem: {},
      }, {
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
      dataItems: goods,
      selectType: 'checkbox',
      rowClassName: record =>
        cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' }),
      selectedRowKeys,
      // onChange: this.pageChange,
      onSelect: this.handleSelectRows,
      disabled: { status: ['9999', '0001'] },
    };

    return <DataTable {...dataTableProps} bordered pagination />;
  }
}
