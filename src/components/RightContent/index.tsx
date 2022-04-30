import { Tooltip, Tag, Space } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useModel, SelectLang } from 'umi';
// import screenfull from 'screenfull';
import Avatar from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  // 全屏控制
  // const [fullscreen, setFullscreen] = useState(false);

  // const f11 = () => {
  //   setFullscreen(screenfull.isFullscreen);
  //   screenfull.toggle();
  // };

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      {/* 全屏 */}
      {/* <Tooltip title={fullscreen ? '全屏' : '退出全屏'}>
        <span className={styles.action} onClick={() => f11()}>
          {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </span>
      </Tooltip> */}

      <Avatar />
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
