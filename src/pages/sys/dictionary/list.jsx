import React from 'react';
import { Input, Divider, Popconfirm } from 'antd';
import { connect } from 'dva';
import DataTable from '@/components/DataTable';
import css from './list.less';

const { Search } = Input;

@connect(state => ({
  dict: state.dict,
  loading: state.loading.effects['dict/listDict'],
}))
export default class List extends React.PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    this.props.dispatch({
      type: 'dict/listDict',
    });
  }

  // 搜索事件
  handleSearch = e => {};

  // 搜索事件
  handleEditClick = e => {};

  // 搜索事件
  handleDeleteClick = e => {};

  render() {
    const { loading, dicts } = this.props.dict;

    const columns = [
      {
        title: '字典描述',
        name: 'name',
        tableItem: {},
      },
      {
        title: '字典编码',
        name: 'code',
        tableItem: {},
      },
      {
        title: '操作',
        tableItem: {
          render: (text, record) => (
            <DataTable.Oper>
              <a onClick={e => this.handleEditClick(record, e)}>编辑</a>
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
          ),
        },
      },
    ];

    const dataTableProps = {
      columns,
      rowKey: 'id',
      loading,
      isScroll: true,
      alternateColor: true,
      dataItems: { records: dicts },
      pagination: false,
    };

    return (
      <div>
        <Search placeholder="输入编码或名称进行搜索" className={css.search} />
        <DataTable {...dataTableProps} className={css.grid} bordered />
      </div>
    );
  }
}
