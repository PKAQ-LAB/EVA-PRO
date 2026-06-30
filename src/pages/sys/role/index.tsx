import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Alert,
  App,
  Button,
  Divider,
  Form,
  Input,
  Popconfirm,
  Switch,
} from 'antd';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import RoleAOEForm, { type ModalType } from './aoeform';
import RoleConfigModal from './component/roleconfig';
import RoleModuleModal from './component/rolemodule';
import RoleUserModal from './component/roleuser';
import type { RoleItem } from './data.d';
import { deleteRoles, getRole, lockRoles, queryRoles } from './service';

type AuthOperate = '' | 'Module' | 'User' | 'Config';

const SysRolePage: React.FC = () => {
  const { message: msg } = App.useApp();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [searchForm] = Form.useForm<{ name?: string; code?: string }>();

  const [modalType, setModalType] = useState<ModalType>('');
  const [authOperate, setAuthOperate] = useState<AuthOperate>('');
  const [currentItem, setCurrentItem] = useState<Partial<RoleItem>>({});
  const [roleId, setRoleId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [query, setQuery] = useState<Record<string, unknown>>({});

  const refresh = () => actionRef.current?.reload();

  const handleAdd = () => {
    setCurrentItem({});
    setModalType('create');
  };

  const handleEdit = async (record: RoleItem) => {
    const res = await getRole(record.id);
    if (res.data) {
      setCurrentItem(res.data);
      setModalType('edit');
    }
  };

  const handleDelete = async (record: RoleItem) => {
    const res = await deleteRoles([record.id]);
    if (res.success) {
      msg.success('删除成功');
      refresh();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    const res = await deleteRoles(selectedRowKeys);
    if (res.success) {
      msg.success('删除成功');
      setSelectedRowKeys([]);
      refresh();
    }
  };

  const handleLockSwitch = async (status: '0000' | '0001') => {
    if (selectedRowKeys.length === 0) return;
    const res = await lockRoles(selectedRowKeys, status);
    if (res.success) {
      setSelectedRowKeys([]);
      refresh();
    }
  };

  const handleEnable = async (record: RoleItem, checked: boolean) => {
    const res = await lockRoles([record.id], checked ? '0000' : '0001');
    if (res.success) refresh();
  };

  const handleSearch = async () => {
    const values = await searchForm.validateFields();
    setQuery({ ...values });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQuery({});
  };

  const handleAction = (record: RoleItem, op: AuthOperate) => {
    setRoleId(record.id);
    setAuthOperate(op);
  };

  const columns: ProColumns<RoleItem>[] = [
    { title: '角色名称', dataIndex: 'name' },
    { title: '角色编码', dataIndex: 'code' },
    { title: '角色描述', dataIndex: 'remark', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'locked',
      search: false,
      render: (_, record) =>
        record.locked !== '9999' && (
          <Switch
            onChange={(checked) => handleEnable(record, checked)}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={record.locked === '0000'}
          />
        ),
    },
    {
      title: '模块授权',
      align: 'center',
      width: 100,
      search: false,
      render: (_, record) =>
        record.locked === '0000' && (
          <a onClick={() => handleAction(record, 'Module')}>模块授权</a>
        ),
    },
    {
      title: '用户授权',
      align: 'center',
      width: 100,
      search: false,
      render: (_, record) =>
        record.locked === '0000' && (
          <a onClick={() => handleAction(record, 'User')}>用户授权</a>
        ),
    },
    {
      title: '配置授权',
      align: 'center',
      width: 100,
      search: false,
      render: (_, record) =>
        record.locked === '0000' && (
          <a onClick={() => handleAction(record, 'Config')}>配置授权</a>
        ),
    },
    {
      title: '操作',
      width: 140,
      search: false,
      render: (_, record) =>
        record.locked === '0000' && (
          <>
            <a onClick={() => handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDelete(record)}
            >
              <a>删除</a>
            </Popconfirm>
          </>
        ),
    },
  ];

  return (
    <PageContainer title="角色管理" subTitle="系统用户角色权限管理维护">
      <div className="eva-ribbon">
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
          {selectedRowKeys.length > 0 && (
            <>
              <Divider type="vertical" />
              <Popconfirm
                title="确定要删除所选角色吗?"
                placement="top"
                onConfirm={handleBatchDelete}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除角色
                </Button>
              </Popconfirm>
              <Divider type="vertical" />
              <Button
                icon={<LockOutlined />}
                onClick={() => handleLockSwitch('0001')}
              >
                停用角色
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<UnlockOutlined />}
                onClick={() => handleLockSwitch('0000')}
              >
                启用角色
              </Button>
            </>
          )}
        </div>
        <div>
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item label="角色名称" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="角色编码" name="code">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Divider type="vertical" />
              <Button htmlType="button" onClick={handleReset}>
                重置
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {selectedRowKeys.length > 0 && (
        <div className="eva-alert">
          <Alert
            showIcon
            type="info"
            message={
              <div>
                已选择{' '}
                <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
                <a
                  style={{ marginLeft: 24 }}
                  onClick={() => setSelectedRowKeys([])}
                >
                  清空选择
                </a>
              </div>
            }
          />
        </div>
      )}

      <div className="eva-body">
        <ProTable<RoleItem>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          search={false}
          bordered
          params={query}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys.map(String)),
            getCheckboxProps: (record) => ({
              disabled: record.status === '9999',
            }),
          }}
          rowClassName={(record) =>
            clsx({
              'eva-locked': record.status === '0001',
              'eva-disabled': record.status === '9999',
            })
          }
          onRow={(record) => ({
            onDoubleClick: () => handleEdit(record),
          })}
          request={async (params) => {
            const res = await queryRoles({ ...query, ...params });
            const list = res?.data?.list ?? [];
            return {
              data: list,
              total: res?.data?.total ?? res?.total ?? list.length,
              success: res?.success ?? true,
            };
          }}
        />
      </div>

      {modalType !== '' && (
        <RoleAOEForm
          modalType={modalType}
          setModalType={setModalType}
          currentItem={currentItem}
          onSuccess={refresh}
        />
      )}
      <RoleModuleModal
        open={authOperate === 'Module'}
        roleId={roleId}
        onClose={() => {
          setAuthOperate('');
          setRoleId(null);
        }}
        onSuccess={refresh}
      />
      <RoleUserModal
        open={authOperate === 'User'}
        roleId={roleId}
        onClose={() => {
          setAuthOperate('');
          setRoleId(null);
        }}
        onSuccess={refresh}
      />
      <RoleConfigModal
        open={authOperate === 'Config'}
        onClose={() => setAuthOperate('')}
      />
    </PageContainer>
  );
};

export default SysRolePage;
