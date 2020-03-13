import React from 'react';
import { CheckOutlined, CloseOutlined, PlusOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { Divider, Popconfirm, Switch, notification, Button } from 'antd';
import { connect } from 'dva';
import cx from 'classnames';
import ProTable from '@ant-design/pro-table';
import { fetchRoles } from './services/roleSvc';

@connect(state => ({
  role: state.role,
  loading: state.loading.effects['role/fetchRoles'],
}))
export default class List extends React.PureComponent {

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


  // 解锁/锁定
  handleLockSwitch = status => {
    const { selectedRowKeys } = this.props.role;
    this.props.dispatch({
      type: 'role/lockSwitch',
      payload: {
        param: selectedRowKeys,
        status,
      },
    });
  };

  // 批量删除
  handleRemoveClick = () => {
    const { selectedRowKeys } = this.props.role;

    if (!selectedRowKeys) return;

    this.props.dispatch({
      type: 'role/remove',
      payload: {
        param: selectedRowKeys,
      },
    });
  };

   // 新增窗口
   handlAddClick = () => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        modalType: 'create',
        currentItem: {},
      },
    });
  };

  render() {
    const { loading } = this.props;

    const columns = [
      {
        title: '角色名称',
        width: 240,
        ellipsis: true,
        dataIndex: 'name',
      },
      {
        title: '角色编码',
        width: 240,
        dataIndex: 'code',
      },
      {
        title: '角色描述',
        width: 240,
        dataIndex: 'remark',
        hideInSearch: true,
        ellipsis: true,
      },
      {
        title: '状态',
        width: 150,
        render: (text, record) =>
          record.locked !== '9999' && (
            <Switch
              onChange={checked => this.handleEnable(record, checked)}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              checked={record.locked === '0000'}
            />
          ),
      },
      {
        title: '备注',
        width: 360,
        ellipsis: true,
        hideInSearch: true,
        dataIndex: 'remark',
      },
      {
        title: '模块授权',
        align: 'center',
        fixed: 'right',
        width: 120,
        render: (text, record) =>
          record.locked === '0000' && (
            <a onClick={() => this.handleModuleClick(record, 'Module')}>模块授权</a>
        ),
      },
      {
        title: '用户授权',
        align: 'center',
        fixed: 'right',
        width: 120,
        render: (text, record) =>
          record.locked === '0000' && (
            <a onClick={() => this.handleUserClick(record, 'User')}>用户授权</a>
          ),
    },
      {
        title: '配置授权',
        align: 'center',
        fixed: 'right',
        width: 120,
        render: (text, record) =>
          record.locked === '0000' && (
            <a onClick={() => this.handleConfigClick(record, 'Config')}>配置授权</a>
          ),
      },
      {
        width: 180,
        fixed: 'right',
        render: (text, record) =>
          record.locked === '0000' && (
            <>
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
            </>
          ),
      },
    ];

    const that = this;

    const dataTableProps = {
      columns,
      rowKey: 'id',
      loading,
      bordered: true,
      scroll: {
        x: 'max-content'
      },
      request: async params => {
        const res = await fetchRoles(params);
        return res.data;
      },
      rowClassName: record =>
        cx({ 'eva-locked': record.locked === '0001', 'eva-disabled': record.locked === '9999' }),
      // onChange: this.pageChange,
      disabled: { locked: ['9999', '0001'] },
      rowSelection: {
        onChange: selectedKeys => {
          this.handleSelectRows(selectedKeys);
        },
        // 系统内置分组不可选择
        getCheckboxProps: record => ({
          disabled: record.locked === '9999',
          name: record.name,
        }),
      },
      toolBarRender: (action, {selectedRowKeys}) => [
        <>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => that.handlAddClick('create')}
          loading={loading}
        >
          新增角色
        </Button>
        {selectedRowKeys.length > 0 && (
          <>
            <Divider type="vertical" />
            <span>
              <Popconfirm
                title="确定要删除所选角色吗?"
                placement="top"
                onConfirm={that.handleRemoveClick}
              >
                <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />} loading={loading}>
                  删除角色
                </Button>
              </Popconfirm>
            </span>
          </>
        )}
        {selectedRowKeys.length > 0 && (
          <>
            <Divider type="vertical" />
            <Button
              icon={<LockOutlined />}
              style={{ marginLeft: 8 }}
              onClick={() => that.handleLockSwitch('0001')}
              loading={loading}
            >
              停用角色
            </Button>
          </>
        )}
        {selectedRowKeys.length > 0 && (
          <>
            <Divider type="vertical" />
            <Button
              icon={<UnlockOutlined />}
              style={{ marginLeft: 8 }}
              onClick={() => that.handleLockSwitch('0000')}
              loading={loading}
            >
              启用角色
            </Button>
          </>
        )}
       </>
      ]
    };

    return <ProTable {...dataTableProps} />;
  }
}
