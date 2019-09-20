import React from 'react';
import { Divider, Popconfirm } from 'antd';
import { connect } from 'dva';
import DataTable from '@/components/DataTable';

@connect(state => ({
  role: state.role,
  loading: state.loading.effects['role/fetchRoles'],
}))
export default class List extends React.PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    this.props.dispatch({
      type: 'role/fetchRoles',
    });
  }

  // 单条删除
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'role/remove',
      payload: {
        param: [record.id],
      },
    });
  };

  render() {
    const { loading } = this.props;

    const { roles } = this.props.role;

    const columns = [
      {
        title: '角色名称',
        name: 'name',
        tableItem: {},
      },
      {
        title: '角色编码',
        name: 'code',
        tableItem: {},
      },
      {
        title: '状态',
        tableItem: {
          render: (text, record) => (
            <DataTable.Oper>
              <a onClick={e => this.handleEditClick(record, e)}>编辑</a>
            </DataTable.Oper>
          ),
        },
      },
      {
        title: '备注',
        name: 'remark',
      },
      {
        title: '模块授权',
        align: 'center',
        tableItem: {
          render: (text, record) => (
            <DataTable.Oper>
              <a onClick={e => this.handleEditClick(record, e)}>模块授权</a>
            </DataTable.Oper>
          ),
        },
      },
      {
        title: '用户授权',
        align: 'center',
        tableItem: {
          render: (text, record) => (
            <DataTable.Oper>
              <a onClick={e => this.handleEditClick(record, e)}>用户授权</a>
            </DataTable.Oper>
          ),
        },
      },
      {
        title: '配置授权',
        align: 'center',
        tableItem: {
          render: (text, record) => (
            <DataTable.Oper>
              <a onClick={e => this.handleEditClick(record, e)}>配置授权</a>
            </DataTable.Oper>
          ),
        },
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
      dataItems: roles,
    };

    return <DataTable {...dataTableProps} bordered />;
  }
}
