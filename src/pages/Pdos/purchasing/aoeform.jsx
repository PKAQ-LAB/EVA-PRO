import React from 'react';
import { Divider } from 'antd';
import MainAOEForm from './form/mainform';
import LineList from './form/linelist';

// Stateless组件
const WayBillMgtAOEForm = () => {
  return (
    <div>
      {/* 主表 */}
      <MainAOEForm />
      <Divider />
      {/* 子表 */}
      <LineList />
    </div>
  );
};
export default WayBillMgtAOEForm;
