import React from 'react';
import { Divider, Popconfirm, Switch, Icon, notification } from 'antd';
import { connect } from 'dva';
import cx from 'classnames';
import DataTable from '@src/components/DataTable';

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

  // 行选事件
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  // 单条删除
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'role/remove',
      payload: {
        param: [record.id],
      },
    });
  };

  // 编辑
  handleEditClick = record => {
    this.props.dispatch({
      type: 'role/edit',
      payload: {
        modalType: 'edit',
        id: record.id,
      },
    });
  };

  // 模块授权
  handleModuleClick = (record, operate) => {
    this.props.dispatch({
      type: `role/list${operate}`,
      payload: {
        roleId: record.id,
        operateType: operate,
      },
    });
  };

  // 用户授权
  handleUserClick = (record, operate) => {
    this.props.dispatch({
      type: `role/list${operate}`,
      payload: {
        roleId: record.id,
        operateType: operate,
      },
    });
  };

  // 配置授权
  handleConfigClick = (record, operate) => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        operateType: operate,
      },
    });
  };

  // 翻页
  pageChange = pg => {
    const { dispatch, searchForm } = this.props;
    const { pageNum, pageSize } = pg;

    const params = {
      page: pageNum,
      pageSize,
      ...searchForm.getFieldsValue(),
    };

    dispatch({
      type: 'role/fetchRoles',
      payload: params,
    });
  };

  // 启用/停用
  handleEnable = (record, checked) => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    this.props.dispatch({
      type: 'role/lockSwitch',
      payload: {
        param: [record.id],
        status: checked ? '0000' : '0001',
      },
    });
  };

  render() {
    const { loading } = this.props;

    const { roles, selectedRowKeys } = this.props.role;

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
        title: '角色描述',
        name: 'remark',
        tableItem: {
          ellipsis: true,
        },
      },
      {
        title: '状态',
        tableItem: {
          render: (text, record) =>
            record.locked !== '9999' && (
              <DataTable.Oper style={{ textAlign: 'center' }}>
                <Switch
                  onChange={checked => this.handleEnable(record, checked)}
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="close" />}
                  checked={record.locked === '0000'}
                />
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
        tableItem: {
          align: 'center',
          render: (text, record) =>
            record.locked === '0000' && (
              <DataTable.Oper style={{ textAlign: 'center' }}>
                <a onClick={() => this.handleModuleClick(record, 'Module')}>模块授权</a>
              </DataTable.Oper>
            ),
        },
      },
      {
        title: '用户授权',
        tableItem: {
          align: 'center',
          render: (text, record) =>
            record.locked === '0000' && (
              <DataTable.Oper style={{ textAlign: 'center' }}>
                <a onClick={() => this.handleUserClick(record, 'User')}>用户授权</a>
              </DataTable.Oper>
            ),
        },
      },
      {
        title: '配置授权',
        tableItem: {
          align: 'center',
          render: (text, record) =>
            record.locked === '0000' && (
              <DataTable.Oper style={{ textAlign: 'center' }}>
                <a onClick={() => this.handleConfigClick(record, 'Config')}>配置授权</a>
              </DataTable.Oper>
            ),
        },
      },
      {
        tableItem: {
          render: (text, record) =>
            record.locked === '0000' && (
              <DataTable.Oper style={{ textAlign: 'center' }}>
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
      showNum: true,
      loading,
      isScroll: true,
      alternateColor: true,
      dataItems: roles,
      selectType: 'checkbox',
      rowClassName: record =>
        cx({ 'eva-locked': record.locked === '0001', 'eva-disabled': record.locked === '9999' }),
      selectedRowKeys,
      onChange: this.pageChange,
      onSelect: this.handleSelectRows,
      disabled: { locked: ['9999', '0001'] },
      rowSelection: {
        // 系统内置分组不可选择
        getCheckboxProps: record => ({
          disabled: record.locked === '9999',
          name: record.name,
        }),
      },
    };

    return <DataTable {...dataTableProps} bordered pagination />;
  }
}
