import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import { Table, type TableColumnsType } from 'antd';
import React from 'react';
import {
  platformOrganizationsQueryKey,
  queryPlatformOrganizations,
} from '../platform/service';
import TenantReadonlyLayout from '../platform/TenantReadonlyLayout';
import { frozenText } from '../status';
import type { OrgItem } from './data';

const TenantOrganizationTable: React.FC<{ tenantId: string }> = ({
  tenantId,
}) => {
  const intl = useIntl();
  const organizationsQuery = useQuery({
    queryKey: platformOrganizationsQueryKey(tenantId),
    queryFn: () => queryPlatformOrganizations(tenantId),
    enabled: Boolean(tenantId),
  });
  const columns: TableColumnsType<OrgItem> = [
    { title: '单位/部门名称', dataIndex: 'name' },
    { title: '所属单位/部门', dataIndex: 'parentName' },
    {
      title: '状态',
      dataIndex: 'frozen',
      render: (_, record) => frozenText(intl, record.frozen),
    },
  ];

  return (
    <Table<OrgItem>
      pagination={false}
      dataSource={organizationsQuery.data ?? []}
      loading={organizationsQuery.isLoading}
      columns={columns}
      rowKey="id"
      scroll={{ y: 'calc(100vh - 300px)' }}
    />
  );
};

const PlatformOrganizationPage: React.FC = () => (
  <PageContainer title="组织（部门）管理" subTitle="平台租户组织架构只读查询">
    <TenantReadonlyLayout>
      {(tenantId) => <TenantOrganizationTable tenantId={tenantId} />}
    </TenantReadonlyLayout>
  </PageContainer>
);

export default PlatformOrganizationPage;
