import React from 'react';
import { Divider } from 'antd';
import MainAOEForm from './form/mainform';
import LineList from './form/linelist';

// Stateless组件
const PurchasingAOEForm = () => (
  <div>
    {/* 主表 */}
    <MainAOEForm />
    <Divider style={{ margin: 0 }}>采购入库单明细</Divider>
    {/* 子表 */}
    <LineList />
  </div>
);
export default PurchasingAOEForm;
