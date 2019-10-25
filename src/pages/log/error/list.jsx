import React, { PureComponent } from 'react';
import { connect } from 'dva';

import DataTable from '@src/components/DataTable';

@connect(({ loading, errorLog }) => ({
  loading: loading.models.errorLog,
  error: errorLog,
}))
export default class ErrorList extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'errorLog/fetch',
    });
  }

  // 查看
  handleClick = (record, type) => {
    if (!record.id) {
      return;
    }
    this.props.dispatch({
      type: 'errorLog/updateState',
      payload: {
        modalType: type,
      },
    });
    this.props.dispatch({
      type: 'errorLog/get',
      payload: {
        id: record.id,
      },
    });
  };

  // 分页
  handlePageChange = pg => {
    const { pageNum, pageSize } = pg;
    this.props.dispatch({
      type: 'errorLog/fetch',
      payload: {
        pageNo: pageNum,
        size: pageSize,
      },
    });
  };

  render() {
    const { logs } = this.props.error;
    const { loading } = this.props;

    const columns = [
      {
        title: '类名',
        name: 'nameClass',
        tableItem: {
          width: 180,
          ellipsis: true,
        },
      },
      {
        title: '异常描述',
        name: 'exDesc',
        tableItem: {
          width: 240,
          ellipsis: true,
        },
      },
      {
        title: '请求ip',
        name: 'ip',
        tableItem: {},
      },
      {
        title: '方法名',
        name: 'method',
        tableItem: {},
      },
      {
        title: '方法参数',
        name: 'params',
        tableItem: {
          width: 240,
          ellipsis: true,
        },
      },
      {
        title: '记录时间',
        name: 'requestTime',
        tableItem: {},
      },
      {
        title: '请求耗时',
        name: 'spendTime',
        tableItem: {},
      },
      {
        title: '操作',
        tableItem: {
          render: record => (
            <div>
              <a onClick={() => this.handleClick(record, 'check')}>查看</a>
            </div>
          ),
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
      onChange: this.handlePageChange,
      dataItems: logs || [],
    };
    return <DataTable pagination {...dataTableProps} />;
  }
}
