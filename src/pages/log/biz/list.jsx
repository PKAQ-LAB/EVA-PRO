import React, { PureComponent } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';

import DataTable from '@src/components/DataTable';

@Form.create()
@connect(state => ({
  bizlog: state.bizlog,
  loading: state.loading.models.bizlog,
}))
export default class WorkList extends PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizlog/fetch',
    });
  }

  // 分页
  handlePageChange = pg => {
    const { pageNum, pageSize } = pg;
    this.props.dispatch({
      type: 'bizlog/fetch',
      payload: {
        pageNo: pageNum,
        size: pageSize,
      },
    });
  };

  // 查看明细
  handleEditClick = records => {
    const { dispatch } = this.props;
    if (!records.id) {
      return;
    }
    dispatch({
      type: 'bizlog/updateState',
      payload: {
        drawerCheck: 'check',
      },
    });
    dispatch({
      type: 'bizlog/check',
      payload: {
        id: records.id,
      },
    });
  };

  render() {
    const { loading } = this.props;
    const { logs } = this.props.bizlog;

    const columns = [
      {
        title: '操作时间',
        name: 'operateDatetime',
        tableItem: {},
      },
      {
        title: '操作类型',
        name: 'operateType',
        tableItem: {},
      },
      {
        title: '操作人',
        name: 'operator',
        tableItem: {},
      },
      {
        title: '描述',
        name: 'description',
        tableItem: {},
      },
      {
        title: '操作',
        tableItem: {
          render: (text, record) => <a onClick={e => this.handleEditClick(record, e)}>查看明细</a>,
        },
      },
    ];

    const dataTableProps = {
      columns,
      rowKey: 'id',
      loading,
      showNum: true,
      isScroll: true,
      alternateColor: true,
      dataItems: logs || [],
    };
    return <DataTable pagination {...dataTableProps} />;
  }
}
