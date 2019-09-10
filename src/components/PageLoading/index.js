import React from 'react';
import { Spin, Icon } from 'antd';
import styles from './index.less';

export default () => (
  <div className={styles.contentInner}>
    <Spin indicator={<Icon type="deployment-unit" style={{ fontSize: 36 }} spin />} />
  </div>
);
