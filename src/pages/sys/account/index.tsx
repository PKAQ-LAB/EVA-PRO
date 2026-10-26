import {
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useModel } from '@umijs/max';
import { Alert, App, Button, Divider, Form, Input, Tree } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { SideLayout } from '@/components';
import { useRecordView } from '@/components/RecordView';
import AOEForm, { type OperateType } from './aoeform';
import type { AccountItem, OrgNode, RoleItem } from './data.d';
import AccountList, { type AccountListHandle } from './list';
import RoleModal from './rolemodal';
import {
  deleteAccounts,
  getAccount,
  lockAccounts,
  queryOrgs,
  queryRoles,
} from './service';

const optionScopes = new WeakMap<object, string>();
// 只作为本地候选缓存的匿名版本，不用于身份认证或审计时间。
const optionScopePrefix = `${Date.now()}-${Math.random()}`;
let optionScopeSequence = 0;
function optionScope(user?: object) {
  if (!user) return 'signed-out';
  let scope = optionScopes.get(user);
  if (!scope) {
    scope = `${optionScopePrefix}-${++optionScopeSequence}`;
    optionScopes.set(user, scope);
  }
  return scope;
}

const SysAccountPage: React.FC = () => {
  const { message: msg, modal } = App.useApp();
  const [searchForm] = Form.useForm();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<AccountItem | null>(null);
  const detail = useRecordView<AccountItem>();
  const grantDetail = useRecordView<AccountItem>();
  const grantTarget = useRef('');
  const grantRequest = useRef(0);
  const grantReading = useRef(false);
  const detailIntent = useRef('');
  const detailId = useRef('');
  const previousDetail = useRef<AccountItem | null>(null);
  const retryingDetail = useRef(false);
  useEffect(() => {
    if (detail.data) previousDetail.current = detail.data;
  }, [detail.data]);
  const detailItem = detail.data ?? previousDetail.current;
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const scope = optionScope(currentUser);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [query, setQuery] = useState<Record<string, unknown>>({});
  const listRef = useRef<AccountListHandle>(null);

  // 字典型数据 (orgs / roles) 走 React Query 缓存，避免每次重渲染都重拉
  const orgsQuery = useQuery<OrgNode[]>({
    queryKey: ['sys', 'orgs', scope],
    enabled: Boolean(currentUser),
    queryFn: async () => {
      const res = await queryOrgs();
      return (res?.data ?? []) as OrgNode[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const rolesQuery = useQuery<RoleItem[]>({
    queryKey: ['sys', 'roles', scope],
    enabled: Boolean(currentUser),
    queryFn: async () => {
      const res = await queryRoles();
      if (res.success === false) throw new Error('角色列表加载失败');
      return (res?.data?.list ?? []) as RoleItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const orgs = orgsQuery.data ?? [];
  const roles = rolesQuery.data ?? [];

  const refreshOptions = (includeRoles = true) => {
    if (!currentUser) return;
    void orgsQuery.refetch();
    if (includeRoles) void rolesQuery.refetch();
  };
  const closeForm = () => {
    detailIntent.current = '';
    detailId.current = '';
    previousDetail.current = null;
    detail.close();
    setOperateType('');
  };
  const openDetail = (item: AccountItem, mode: 'view' | 'edit') => {
    const id = item.id;
    if (!id) return;
    const intent = `${mode}:${id}`;
    if (detailIntent.current === intent) return;
    detailIntent.current = intent;
    detailId.current = id;
    previousDetail.current = null;
    retryingDetail.current = false;
    setOperateType(mode);
    refreshOptions(mode === 'edit');
    void detail.read(id, () => getAccount(id));
  };
  const retryDetails = () => {
    const id = detailId.current;
    if (!id || retryingDetail.current) return;
    retryingDetail.current = true;
    void detail
      .read(id, () => getAccount(id))
      .finally(() => {
        if (detailId.current === id) retryingDetail.current = false;
      });
  };

  const refreshList = () => listRef.current?.refresh();

  // 解锁/锁定
  const handleLockSwitch = async (status: '0000' | '0001') => {
    if (selectedRowKeys.length === 0) return;
    const res = await lockAccounts(selectedRowKeys, status);
    if (res.success) {
      msg.success(status === '0001' ? '锁定成功' : '解锁成功');
      setSelectedRowKeys([]);
      refreshList();
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    const res = await deleteAccounts(selectedRowKeys);
    if (res.success) {
      msg.success('删除成功');
      setSelectedRowKeys([]);
      refreshList();
    }
  };

  const confirmBatchDelete = () => {
    modal.confirm({
      title: '确定要删除所选用户吗?',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: handleBatchDelete,
    });
  };

  const handleSearch = async () => {
    const values = await searchForm.validateFields();
    setQuery({ ...values });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQuery({});
  };

  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    setQuery((prev) => ({ ...prev, deptId: selectedKeys[0] }));
  };

  const openCreate = () => {
    detailIntent.current = '';
    detailId.current = '';
    previousDetail.current = null;
    detail.close();
    setCurrentItem(null);
    setOperateType('create');
    refreshOptions();
  };

  const readGrantDetail = (id: string) => {
    const request = ++grantRequest.current;
    grantReading.current = true;
    void grantDetail
      .read(id, () => getAccount(id))
      .finally(() => {
        if (grantRequest.current === request) grantReading.current = false;
      });
  };
  const closeRoleModal = () => {
    grantTarget.current = '';
    grantRequest.current += 1;
    grantReading.current = false;
    grantDetail.close();
    setRoleModalOpen(false);
    setCurrentItem(null);
  };
  const openRoleModal = (item: AccountItem) => {
    if (!item.id || grantTarget.current === item.id) return;
    grantTarget.current = item.id;
    setCurrentItem(item);
    setRoleModalOpen(true);
    if (currentUser) void rolesQuery.refetch();
    readGrantDetail(item.id);
  };

  const openEditModal = (item: AccountItem) => {
    openDetail(item, 'edit');
  };

  return (
    <PageContainer
      header={{ title: false, subTitle: false }}
      title="用户管理"
      subTitle="系统用户账号管理维护"
    >
      <div className="eva-ribbon">
        <div>
          <Button type="primary" onClick={openCreate}>
            新增用户
          </Button>
          {selectedRowKeys.length > 0 && (
            <>
              <Divider type="vertical" />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={confirmBatchDelete}
              >
                删除用户
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<LockOutlined />}
                onClick={() => handleLockSwitch('0001')}
              >
                锁定
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<UnlockOutlined />}
                onClick={() => handleLockSwitch('0000')}
              >
                解锁
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
            <Form.Item label="账号" name="account">
              <Input placeholder="输入账号搜索" />
            </Form.Item>
            <Form.Item label="姓名" name="name">
              <Input placeholder="输入用户名称搜索" />
            </Form.Item>
            <Form.Item label="手机" name="tel">
              <Input placeholder="输入手机号搜索" />
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
        <SideLayout
          title="所属部门"
          layoutStyle={{ height: 'calc(100vh - 332px)' }}
          body={
            <Tree
              showLine
              blockNode
              onSelect={handleTreeSelect}
              treeData={orgs as never}
              fieldNames={{ title: 'title', key: 'id', children: 'children' }}
            />
          }
        >
          <AccountList
            innerRef={listRef}
            query={query}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            onEdit={openEditModal}
            onView={(item) => openDetail(item, 'view')}
            onGrant={openRoleModal}
          />
        </SideLayout>
      </div>

      {operateType !== '' && (
        <AOEForm
          key={`${operateType}:${operateType === 'create' ? 'new' : detailId.current}`}
          operateType={operateType}
          currentItem={operateType === 'create' ? null : detailItem}
          onRetryDetails={retryDetails}
          detailsLoading={operateType !== 'create' && detail.loading}
          detailsError={operateType !== 'create' ? detail.error : undefined}
          orgs={orgs}
          orgsLoading={orgsQuery.isFetching}
          orgsError={orgsQuery.isError}
          onRetryOrgs={() => {
            void orgsQuery.refetch();
          }}
          roles={roles}
          rolesLoading={rolesQuery.isFetching}
          rolesError={rolesQuery.isError}
          onRetryRoles={() => {
            void rolesQuery.refetch();
          }}
          onClose={closeForm}
          onSuccess={refreshList}
        />
      )}
      {roleModalOpen && (
        <RoleModal
          key={`grant:${currentItem?.id ?? ''}`}
          open={roleModalOpen}
          targetId={currentItem?.id ?? ''}
          onClose={closeRoleModal}
          roles={roles}
          currentItem={grantDetail.data ?? null}
          detailsLoading={grantDetail.loading}
          detailsError={grantDetail.error}
          onRetryDetails={() => {
            if (grantTarget.current && !grantReading.current)
              readGrantDetail(grantTarget.current);
          }}
          rolesLoading={rolesQuery.isPending || rolesQuery.isFetching}
          rolesError={rolesQuery.isError}
          onRetryRoles={() => void rolesQuery.refetch()}
        />
      )}
    </PageContainer>
  );
};

export default SysAccountPage;
