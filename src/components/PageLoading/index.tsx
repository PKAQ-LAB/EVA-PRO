import { Spin } from 'antd';
import React from 'react';
import CubeLoading from '../CubeLoading';
import styles from './index.module.css';

/** 全局/局部页面加载占位 */
const PageLoading: React.FC = () => (
  <div className={styles.contentInner}>
    <Spin indicator={<CubeLoading style={{ fontSize: 40 }} />} />
  </div>
);

export default PageLoading;
