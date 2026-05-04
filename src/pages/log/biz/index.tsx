import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="业务日志"
    v5Source="src/pages/log/biz/{index,list,aoeform}.jsx"
    apiKeys={['BIZLOG_GET', 'BIZLOG_LIST']}
  />
);

export default Page;
