import React from 'react';
import { Divider } from 'antd';
import MainAOEForm from './form/mainform';
import LineList from './form/linelist';

// Stateless组件
const PurchasingViewForm = () => {
  return (
    <div>
      {/* 主表 */}
      <MainAOEForm view />
      <Divider />
      {/* 子表 */}
      <LineList view />
    </div>
  );
};
export default PurchasingViewForm;
