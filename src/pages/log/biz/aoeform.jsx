import React from 'react';
import { Drawer } from 'antd';
import moment from 'moment';
import styles from './index.less';

export default (props) => {
  const { currentItem, operateType, setOperateType, } = props;

  return (
    <Drawer
      closable
      width={600}
      visible={operateType === 'check'}
      onClose={() => setOperateType("")}
    >
      <ul className={styles.ul}>
        <li>
          <label>操作时间：</label>
          <span>{moment(currentItem.operateDatetime).format('MM-DD HH:mm')}</span>
        </li>
        <li>
          <label>操作人：</label>
          <span>{currentItem.operator}</span>
        </li>
        <li>
          <label>操作类型：</label>
          <span>{currentItem.operateType}</span>
        </li>
        <li>
          <label>描述：</label>
          <span>{currentItem.description}</span>
        </li>
      </ul>
    </Drawer>
  );
}
