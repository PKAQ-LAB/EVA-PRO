import {
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  App,
  Button,
  Divider,
  Form,
  Input,
  Popconfirm,
  Tree,
} from 'antd';
import React, { useRef, useState } from 'react';
import { SideLayout } from '@/components';
import AOEForm, { type OperateType } from './aoeform';
import type { AccountItem, OrgNode, RoleItem } from './data.d';
import AccountList, { type AccountListHandle } from './list';
import RoleModal from './rolemodal';
import { deleteAccounts, lockAccounts, queryOrgs, queryRoles } from './service';

const SysAccountPage: React.FC = () => {
  const { message: msg } = App.useApp();
  const [searchForm] = Form.useForm();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<AccountItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [query, setQuery] = useState<Record<string, unknown>>({});
  const listRef = useRef<AccountListHandle>(null);

  // 字典型数据 (orgs / roles) 走 React Query 缓存，避免每次重渲染都重拉
  const orgsQuery = useQuery<OrgNode[]>({
    queryKey: ['sys', 'orgs'],
    queryFn: async () => {
      const res = await queryOrgs();
      return (res?.data ?? []) as OrgNode[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const rolesQuery = useQuery<RoleItem[]>({
    queryKey: ['sys', 'roles'],
    queryFn: async () => {
      const res = await queryRoles();
      return (res?.data?.list ?? []) as RoleItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const orgs = orgsQuery.data ?? [];
  const roles = rolesQuery.data ?? [];

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
    setCurrentItem(null);
    setOperateType('create');
  };

  const openRoleModal = (item: AccountItem) => {
    setCurrentItem(item);
    setRoleModalOpen(true);
  };

  const openEditModal = (item: AccountItem) => {
    setCurrentItem(item);
    setOperateType('edit');
  };

  return (
    <PageContainer title="用户管理" subTitle="系统用户账号管理维护">
      <div className="eva-ribbon">
        <div>
          <Button type="primary" onClick={openCreate}>
            新增用户
          </Button>
          {selectedRowKeys.length > 0 && (
            <>
              <Divider type="vertical" />
              <Popconfirm
                title="确定要删除所选用户吗?"
                placement="top"
                onConfirm={handleBatchDelete}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除用户
                </Button>
              </Popconfirm>
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
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
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
          layoutStyle={{ minHeight: 'calc(100vh - 332px)' }}
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
            onGrant={openRoleModal}
          />
        </SideLayout>
      </div>

      {operateType !== '' && (
        <AOEForm
          operateType={operateType}
          currentItem={currentItem}
          orgs={orgs}
          roles={roles}
          onClose={() => setOperateType('')}
          onSuccess={refreshList}
        />
      )}
      {roleModalOpen && (
        <RoleModal
          open={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          roles={roles}
          currentItem={currentItem}
        />
      )}
    </PageContainer>
  );
};

export default SysAccountPage;
