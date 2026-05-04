import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="代码生成"
    v5Source="src/pages/dev/generator/{index,list,aoeform,EditableList}.jsx + models/itemMdl.js + services/itemSvc.js"
    notes="EditableList 是 Class 组件，需重写为函数式；models/itemMdl 是 dva model，V6 需迁到 models/ 用 useModel"
  />
);

export default Page;
