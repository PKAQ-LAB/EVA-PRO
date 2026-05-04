import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="字典管理"
    v5Source="src/pages/sys/dictionary/{index,list,aoeform,linelist,lineaoeform}.jsx"
    apiKeys={['DICT_GET', 'DICT_LIST', 'DICT_EDIT', 'DICT_DEL']}
    notes="左侧字典分组，右侧字典明细行；用 dictFilter (utils/DataHelper) 做搜索过滤"
  />
);

export default Page;
