import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="错误日志"
    v5Source="src/pages/log/error/{index,list,aoeform}.jsx"
    apiKeys={['ERROR_GET', 'ERROR_LIST']}
  />
);

export default Page;
