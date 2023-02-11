import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { SelectLang, useModel } from '@umijs/max';
import { Tooltip } from 'antd';
import React, { useState } from 'react';
import screenfull from 'screenfull';
import Avatar from './AvatarDropdown';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const className = useEmotionCss(() => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      gap: 8,
    };
  });

  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      float: 'right',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      cursor: 'pointer',
      padding: '0 12px',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const { initialState } = useModel('@@initialState');

  // 全屏控制
  // github.com/sindresorhus/screenfull/issues/195
  const [fullscreen, setFullscreen] = useState(false);

  const f11 = () => {
    setFullscreen(screenfull.isFullscreen);
    screenfull.toggle();
  };

  if (!initialState || !initialState.settings) {
    return null;
  }

  return (
    <div className={className}>
      <span
        className={actionClassName}
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <QuestionCircleOutlined />
      </span>
      {/* 全屏 */}
      <Tooltip title={fullscreen ? '全屏' : '退出全屏'}>
        <span className={actionClassName} onClick={() => f11()}>
          {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </span>
      </Tooltip>
      <Avatar />
      <SelectLang className={actionClassName} />
    </div>
  );
};
export default GlobalHeaderRight;
