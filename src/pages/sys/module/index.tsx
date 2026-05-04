import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="模块管理"
    v5Source="src/pages/sys/module/{index,list,aoeform,linelist,lineaoeform}.jsx"
    apiKeys={[
      'MODULE_GET',
      'MODULE_LIST',
      'MODULE_EDIT',
      'MODULE_DEL',
      'MODULE_SORT',
      'MODULE_STATUS',
      'MODULE_CHECKUNIQUE',
    ]}
    notes="父子两级 (Module + Line)，支持树形展示与排序"
  />
);

export default Page;
