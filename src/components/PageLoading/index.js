import React from 'react';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from './index.less';

export default () => (
  <div className={styles.contentInner}>
    <Spin indicator={<DeploymentUnitOutlined style={{ fontSize: 36 }} spin />} />
  </div>
);
