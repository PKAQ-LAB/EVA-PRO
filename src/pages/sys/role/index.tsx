import {
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
import { useIntl } from '@umijs/max';
import { Alert, App, Button, Divider, Form, Input } from 'antd';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { useRecordView, viewRow } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  TextCell,
  textColumn,
} from '@/components/TablePresentation';
import { frozenText, sysText } from '../status';
import RoleAOEForm, { type ModalType } from './aoeform';
import RoleConfigModal from './component/roleconfig';
import RoleModuleModal from './component/rolemodule';
import RoleUserModal from './component/roleuser';
import type { RoleItem } from './data.d';
import { deleteRoles, getRole, lockRoles, queryRoles } from './service';

type AuthOperate = '' | 'Module' | 'User' | 'Config';

const isSystemRole = (record: RoleItem) =>
  record.code === '9999' || record.frozen === 9999 || record.status === '9999';

const canOperateRole = (record: RoleItem) => !isSystemRole(record);

const SysRolePage: React.FC = () => {
  const intl = useIntl();
  const view = useRecordView<RoleItem>();
  const handleView = (record: RoleItem) => {
    setCurrentItem({ id: record.id });
    setModalType('view');
    void view.read(record.id, () => getRole(record.id));
  };
  const { message: msg, modal } = App.useApp();
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
    view.close();
    setCurrentItem({});
    setModalType('create');
  };

  const handleEdit = (record: RoleItem) => {
    setCurrentItem({ id: record.id });
    setModalType('edit');
    void view.read(record.id, () => getRole(record.id));
  };

  const handleDelete = async (record: RoleItem) => {
    const res = await deleteRoles([record.id]);
    if (res.success) {
      msg.success(sysText(intl, 'pages.sys.message.deleteSuccess', '删除成功'));
      refresh();
    }
  };

  const confirmDelete = (record: RoleItem) => {
    if (!canOperateRole(record)) return;
    modal.confirm({
      title: sysText(intl, 'pages.sys.action.deleteConfirm', '确定要删除吗？'),
      centered: true,
      okText: sysText(intl, 'pages.sys.action.confirm', '确定'),
      cancelText: sysText(intl, 'pages.sys.action.cancel', '取消'),
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record),
    });
  };

  const confirmBatchDelete = () => {
    modal.confirm({
      title: sysText(
        intl,
        'pages.sys.action.deleteSelectedConfirm',
        '确定要删除选中的条目吗?',
      ),
      centered: true,
      okText: sysText(intl, 'pages.sys.action.confirm', '确定'),
      cancelText: sysText(intl, 'pages.sys.action.cancel', '取消'),
      okButtonProps: { danger: true },
      onOk: handleBatchDelete,
    });
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    const res = await deleteRoles(selectedRowKeys);
    if (res.success) {
      msg.success(sysText(intl, 'pages.sys.message.deleteSuccess', '删除成功'));
      setSelectedRowKeys([]);
      refresh();
    }
  };

  const handleLockSwitch = async (frozen: 0 | 1) => {
    if (selectedRowKeys.length === 0) return;
    const res = await lockRoles(selectedRowKeys, frozen);
    if (res.success) {
      setSelectedRowKeys([]);
      refresh();
    }
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
    {
      ...textColumn<RoleItem>(
        sysText(intl, 'pages.sys.role.name', '角色名称'),
        'name',
        180,
      ),
    },
    {
      ...textColumn<RoleItem>(
        sysText(intl, 'pages.sys.role.code', '角色编码'),
        'code',
        180,
      ),
    },
    {
      ...textColumn<RoleItem>(
        sysText(intl, 'pages.sys.role.remark', '角色描述'),
        'remark',
        260,
      ),
    },
    {
      title: sysText(intl, 'pages.sys.column.locked', '是否锁定'),
      dataIndex: 'frozen',
      width: 110,
      align: 'center',
      ellipsis: { showTitle: false },
      search: false,
      render: (_, record) => (
        <TextCell text={frozenText(intl, record.frozen)} />
      ),
    },
    {
      title: sysText(intl, 'pages.sys.role.moduleAuth', '模块授权'),
      ...actionColumn(140),
      search: false,
      render: (_, record) => (
        <Button
          type="link"
          disabled={!canOperateRole(record)}
          onClick={() => handleAction(record, 'Module')}
        >
          {sysText(intl, 'pages.sys.role.moduleAuth', '模块授权')}
        </Button>
      ),
    },
    {
      title: sysText(intl, 'pages.sys.role.userAuth', '用户授权'),
      ...actionColumn(140),
      search: false,
      render: (_, record) => (
        <Button
          type="link"
          disabled={!canOperateRole(record)}
          onClick={() => handleAction(record, 'User')}
        >
          {sysText(intl, 'pages.sys.role.userAuth', '用户授权')}
        </Button>
      ),
    },
    {
      title: sysText(intl, 'pages.sys.role.configAuth', '配置授权'),
      ...actionColumn(140),
      search: false,
      render: (_, record) => (
        <Button
          type="link"
          disabled={!canOperateRole(record)}
          onClick={() => handleAction(record, 'Config')}
        >
          {sysText(intl, 'pages.sys.role.configAuth', '配置授权')}
        </Button>
      ),
    },
    {
      title: sysText(intl, 'pages.searchTable.titleOption', '操作'),
      ...actionColumn(220),
      search: false,
      render: (_, record) => (
        <ActionGroup>
          <Button type="link" size="small" onClick={() => handleView(record)}>
            查看
          </Button>
          <a
            className={clsx({ 'eva-link-disabled': !canOperateRole(record) })}
            onClick={() => {
              if (canOperateRole(record)) handleEdit(record);
            }}
          >
            {sysText(intl, 'pages.sys.action.edit', '编辑')}
          </a>
          <Divider type="vertical" />
          <a
            className={clsx('eva-delete-link', {
              'eva-link-disabled': !canOperateRole(record),
              'eva-delete-link-disabled': !canOperateRole(record),
            })}
            onClick={() => confirmDelete(record)}
          >
            {sysText(intl, 'pages.sys.action.delete', '删除')}
          </a>
        </ActionGroup>
      ),
    },
  ];

  return (
    <PageContainer
      header={{ title: false, subTitle: false }}
      title={sysText(intl, 'pages.sys.role.title', '角色管理')}
      subTitle={sysText(
        intl,
        'pages.sys.role.subtitle',
        '系统用户角色权限管理维护',
      )}
    >
      <div className="eva-ribbon">
        <div>
          {selectedRowKeys.length > 0 && (
            <>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={confirmBatchDelete}
              >
                {sysText(intl, 'pages.sys.role.delete', '删除角色')}
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<LockOutlined />}
                onClick={() => handleLockSwitch(1)}
              >
                {sysText(intl, 'pages.sys.role.disable', '停用角色')}
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<UnlockOutlined />}
                onClick={() => handleLockSwitch(0)}
              >
                {sysText(intl, 'pages.sys.role.enable', '启用角色')}
              </Button>
            </>
          )}
        </div>
        <div>
          <Form
            className="eva-table-search"
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
          >
            <Form.Item
              label={sysText(intl, 'pages.sys.role.name', '角色名称')}
              name="name"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label={sysText(intl, 'pages.sys.role.code', '角色编码')}
              name="code"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {sysText(intl, 'pages.sys.action.query', '查询')}
              </Button>
              <Divider type="vertical" />
              <Button htmlType="button" onClick={handleReset}>
                {sysText(intl, 'pages.sys.action.reset', '重置')}
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
                {sysText(intl, 'pages.sys.role.selected', '已选择')}{' '}
                <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{' '}
                {sysText(intl, 'pages.sys.role.item', '项')}
                <a
                  style={{ marginLeft: 24 }}
                  onClick={() => setSelectedRowKeys([])}
                >
                  {sysText(intl, 'pages.sys.action.clearSelected', '清空选择')}
                </a>
              </div>
            }
          />
        </div>
      )}

      <div className="eva-body">
        <ProTable<RoleItem>
          scroll={{ x: 1440 }}
          headerTitle={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {sysText(intl, 'pages.sys.role.add', '新增角色')}
            </Button>
          }
          defaultSize="small"
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
              disabled: isSystemRole(record),
            }),
          }}
          rowClassName={(record) =>
            clsx({
              'eva-locked': record.frozen === 1 && !isSystemRole(record),
              'eva-readonly': isSystemRole(record),
            })
          }
          onRow={(record) => viewRow(() => handleView(record))}
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
          key={`${modalType}:${currentItem.id ?? 'create'}`}
          modalType={modalType}
          setModalType={(type) => {
            view.close();
            setModalType(type);
          }}
          currentItem={
            modalType !== 'create' ? (view.data ?? currentItem) : currentItem
          }
          detailsLoading={modalType !== 'create' && view.loading}
          detailsError={modalType !== 'create' ? view.error : undefined}
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
