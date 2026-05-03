import { DeploymentUnitOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';
import styles from './index.module.css';

/** 全局/局部页面加载占位 */
const PageLoading: React.FC = () => (
  <div className={styles.contentInner}>
    <Spin
      indicator={<DeploymentUnitOutlined style={{ fontSize: 36 }} spin />}
    />
  </div>
);

export default PageLoading;
