import React from 'react';
import { Form, Input, Alert, Button, Divider, Popconfirm, Table, Switch, notification } from 'antd';
import { CheckOutlined, CloseOutlined, PlusOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import cx from 'classnames';
import { delRole, getRole, listModule, listUser, lockRole } from './services/roleSvc';

export default (props) => {
  const [ form ] = Form.useForm();
  const { fetch, loading, selectedRowKeys, setSelectedRowKeys, tableProps, setCurrentItem, setOperateType, setModalType, setRoleId } = props;

  // 单条删除
  const handleDeleteClick = record => {
    delRole({
      param: [record.id],
    }).then( () => fetch() );
  };

  // 编辑
  const handleEditClick = record => {
    getRole({id: record.id}).then((res) => {
      setCurrentItem(res.data);
      setModalType("edit");
    })
  };

  // 新增窗口
  const handlAddClick = () => {
    setCurrentItem({});
    setModalType("create");
  };

  // 重置事件
  const handleFormReset = () => {
    form.resetFields();
    fetch();
  };

  // 搜索事件
  const handleSearch = () => {
    const { validateFields } = form;
    validateFields().then(values => {
      fetch(values);
    })
  };

  // 解锁/锁定
  const handleLockSwitch = status => {
    lockRole({
      param: selectedRowKeys,
      status,
    }).then(() => run());
  };

  // 批量删除
  const handleRemoveClick = () => {

    if (!selectedRowKeys) return;
    delRole({
      param: selectedRowKeys,
    }).then(() => run());

  };

  const handleActionClick = (record, operate) => {
    const param = { roleId: record.id, };

    switch(operate){
      case 'User':   listUser(param)
                        .then(() => {
                          setOperateType(operate);
                          setRoleId(record.id)
                     });
                     break;
      case 'Config': setOperateType(operate);
                     break;
      case 'Module': listModule(param)
                        .then(() => {
                            setOperateType(operate);
                            setRoleId(record.id)
                      });
                     break;
                     default: ;
    }
  };

  // 启用/停用
  const handleEnable = (record, checked) => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }

    lockRole({
      param: [record.id],
      status: checked ? '0000' : '0001',
    }).then(() => fetch() );

  };

  // 操作按钮
  const renderButton = () => {
    return <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handlAddClick()}
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
              onConfirm={() => handleRemoveClick()}
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
            onClick={() => handleLockSwitch('0001')}
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
            onClick={() => handleLockSwitch('0000')}
            loading={loading}
          >
            启用角色
          </Button>
        </>
      )}
    </>;
  }

  // 简单搜索条件
  const renderSearchForm = () => {
    const formItemLayout = {
      labelCol: { flex: '0 0 100px' },
      wrapperCol: { flex: 'auto' },
    };

    return (
      <Form {...formItemLayout} colon layout="inline" onFinish={() => handleSearch()} form={form} >
        <Form.Item label="角色名称" name="name">
          <Input />
        </Form.Item>

        <Form.Item label="角色编码" name="code">
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          查询
        </Button>
        <Divider type="vertical" />
        <Button htmlType="reset" onClick={() => handleFormReset()} loading={loading}>
          重置
        </Button>
      </Form>
    );
  }

  const columns = [{
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
    },
    {
      title: '角色描述',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '状态',
      render: (text, record) =>
        record.locked !== '9999' && (
          <Switch
            onChange={checked => handleEnable(record, checked)}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={record.locked === '0000'}
          />
        ),
    },
    {
      title: '备注',
      ellipsis: true,
      dataIndex: 'remark',
    },
    {
      title: '模块授权',
      align: 'center',
      render: (text, record) =>
        record.locked === '0000' && (
            <a onClick={() => handleActionClick(record, 'Module')}>模块授权</a>
        ),
    },
    {
      title: '用户授权',
      align: 'center',
      render: (text, record) =>
        record.locked === '0000' && (
            <a onClick={() => handleActionClick(record, 'User')}>用户授权</a>
        ),
    },
    {
      title: '配置授权',
      align: 'center',
      render: (text, record) =>
        record.locked === '0000' && (
            <a onClick={() => handleActionClick(record, 'Config')}>配置授权</a>
        ),
    },
    {
      render: (text, record) =>
        record.locked === '0000' && (
          <>
            <a onClick={e => handleEditClick(record, e)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDeleteClick(record)}
            >
              <a>删除</a>
            </Popconfirm>
          </>
        ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: selectedKeys => setSelectedRowKeys(selectedKeys),
    getCheckboxProps: record => ({
      disabled: record.status === '9999',
    }),
  };

  const tbProps = {
    ...tableProps,
    columns,
    bordered: true,
    rowKey: record => record.id,
    rowSelection,
    onRow : (record) => ({ onDoubleClick: () => handleEditClick(record, 'view'),}),
    rowClassName: record =>
      cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' })

  };

  return (<>
            {/* 工具条 */}
            <div className="eva-ribbon">
              {/* 操作按钮 */}
              <div>{renderButton()}</div>
              {/* 查询条件 */}
              <div>{renderSearchForm()}</div>
            </div>
            {/* 删除条幅 */}
            <div className="eva-alert">
              {selectedRowKeys.length > 0 && (
                <Alert
                  message={
                    <div>
                      已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                      {selectedRowKeys.length > 0 && (
                        <a onClick={() => setSelectedRowKeys([])} style={{ marginLeft: 24 }}>
                          清空选择
                        </a>
                      )}
                    </div>
                  }
                  type="info"
                  showIcon
                />
              )}
            </div>
            <div className="eva-body">
              <Table {...tbProps} />
            </div>
          </>)
}
