import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="用户管理"
    v5Source="src/pages/sys/account/{index,list,aoeform,rolemodal}.jsx"
    apiKeys={[
      'ACCOUNT_GET',
      'ACCOUNT_LIST',
      'ACCOUNT_EDIT',
      'ACCOUNT_DEL',
      'ACCOUNT_LOCK',
      'ACCOUNT_GRANT',
      'ACCOUNT_CHECKUNIQUE',
    ]}
    notes="包含一个 rolemodal 子组件用于角色分配"
  />
);

export default Page;
