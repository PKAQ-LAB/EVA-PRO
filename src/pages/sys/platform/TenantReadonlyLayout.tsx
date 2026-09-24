import { useQuery } from '@tanstack/react-query';
import { Empty, Menu, Spin } from 'antd';
import React, { useState } from 'react';
import SideLayout from '@/components/SideLayout';
import {
  platformTenantOptionsQueryKey,
  queryPlatformTenantOptions,
} from './service';

interface TenantReadonlyLayoutProps {
  children: (tenantId: string) => React.ReactNode;
}

const TenantReadonlyLayout: React.FC<TenantReadonlyLayoutProps> = ({
  children,
}) => {
  const [tenantId, setTenantId] = useState('');
  const tenantOptionsQuery = useQuery({
    queryKey: platformTenantOptionsQueryKey,
    queryFn: queryPlatformTenantOptions,
  });
  const options = tenantOptionsQuery.data ?? [];
  const selectedTenantId = options.some((option) => option.id === tenantId)
    ? tenantId
    : (options[0]?.id ?? '');

  return (
    <SideLayout
      title="租户列表"
      width={300}
      body={
        <Spin spinning={tenantOptionsQuery.isLoading}>
          {options.length > 0 ? (
            <Menu
              mode="inline"
              selectedKeys={selectedTenantId ? [selectedTenantId] : []}
              items={options.map((option) => ({
                key: option.id,
                label: option.code
                  ? `${option.name}（${option.code}）`
                  : option.name,
              }))}
              onClick={({ key }) => setTenantId(String(key))}
            />
          ) : (
            !tenantOptionsQuery.isLoading && <Empty description="暂无租户" />
          )}
        </Spin>
      }
    >
      {selectedTenantId ? (
        children(selectedTenantId)
      ) : (
        <Empty description="请选择租户" />
      )}
    </SideLayout>
  );
};

export default TenantReadonlyLayout;
