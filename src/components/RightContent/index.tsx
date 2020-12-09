import { Tooltip, Tag, Space } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useModel, SelectLang } from 'umi';
import screenfull from 'screenfull';
import Avatar from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

export default () => {
  const { initialState } = useModel('@@initialState');

  // 全屏控制
  const [ fullscreen, setFullscreen ] = useState(false);
  const fullscreenText = ['全屏', '退出全屏'];

  const f11 = () => {
    setFullscreen(screenfull.isFullscreen ? 0 : 1);
   screenfull.toggle();
  };

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
      <Tooltip title={fullscreenText[fullscreen]}>
        <span className={styles.action} onClick={() => f11()}>
          { fullscreen? <FullscreenExitOutlined/> : <FullscreenOutlined/> }
        </span>
      </Tooltip>

      <Avatar />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
      <SelectLang className={styles.action} />
    </Space>
  );
};
