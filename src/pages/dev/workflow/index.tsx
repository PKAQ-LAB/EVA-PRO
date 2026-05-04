import React from 'react';
import MigrationPlaceholder from '../../_placeholder';

const Page: React.FC = () => (
  <MigrationPlaceholder
    title="工作流"
    v5Source="src/pages/dev/workflow/index.jsx"
    notes="V5 是单文件占位，可借此机会接入实际工作流引擎"
  />
);

export default Page;
