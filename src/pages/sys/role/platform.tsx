import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import { Table, type TableColumnsType } from 'antd';
import React from 'react';
import { platformRolesQueryKey, queryPlatformRoles } from '../platform/service';
import TenantReadonlyLayout from '../platform/TenantReadonlyLayout';
import { frozenText, sysText } from '../status';
import type { RoleItem } from './data';

const TenantRoleTable: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const intl = useIntl();
  const rolesQuery = useQuery({
    queryKey: platformRolesQueryKey(tenantId),
    queryFn: () => queryPlatformRoles(tenantId),
    enabled: Boolean(tenantId),
  });
  const columns: TableColumnsType<RoleItem> = [
    {
      title: sysText(intl, 'pages.sys.role.name', '角色名称'),
      dataIndex: 'name',
    },
    {
      title: sysText(intl, 'pages.sys.role.code', '角色编码'),
      dataIndex: 'code',
    },
    {
      title: sysText(intl, 'pages.sys.role.remark', '角色描述'),
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: sysText(intl, 'pages.sys.column.locked', '是否锁定'),
      dataIndex: 'frozen',
      render: (_, record) => frozenText(intl, record.frozen),
    },
  ];

  return (
    <Table<RoleItem>
      dataSource={rolesQuery.data ?? []}
      loading={rolesQuery.isLoading}
      columns={columns}
      rowKey="id"
      pagination={false}
      scroll={{ y: 'calc(100vh - 300px)' }}
    />
  );
};

const PlatformRolePage: React.FC = () => (
  <PageContainer title="角色管理" subTitle="平台租户角色只读查询">
    <TenantReadonlyLayout>
      {(tenantId) => <TenantRoleTable tenantId={tenantId} />}
    </TenantReadonlyLayout>
  </PageContainer>
);

export default PlatformRolePage;
