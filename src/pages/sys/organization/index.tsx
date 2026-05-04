import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="组织管理"
    v5Source="src/pages/sys/organization/{index,list,aoeform}.jsx"
    apiKeys={[
      'ORG_GET',
      'ORG_LIST',
      'ORG_EDIT',
      'ORG_DEL',
      'ORG_SORT',
      'ORG_STATUS',
      'ORG_CHECKUNIQUE',
    ]}
    notes="树形结构，支持拖拽排序与启停切换"
  />
);

export default Page;
