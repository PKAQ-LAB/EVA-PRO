import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="角色管理"
    v5Source="src/pages/sys/role/{index,list,aoeform}.jsx + component/{roleconfig,rolemodule,roleuser}.jsx"
    apiKeys={[
      'ROLE_GET',
      'ROLE_LIST',
      'ROLE_DEL',
      'ROLE_SAVE',
      'ROLE_LOCK',
      'ROLE_SAVEUSER',
      'ROLE_SAVEMODULE',
      'ROLE_LISTMOUDLE',
      'ROLE_LISTUSER',
      'ROLE_CHECKUNIQUE',
    ]}
    notes="Tab 页含 roleconfig / rolemodule / roleuser 三块；rolemodule 用树形多选授权"
  />
);

export default Page;
