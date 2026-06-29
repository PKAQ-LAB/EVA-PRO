import {
  BookOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import screenfull from 'screenfull';
import { LangDropdown } from './LangDropdown';
import useHeaderActionStyles from './style';
import { VersionDropdown } from './VersionDropdown';

const useStyles = createStyles(({ token, css }) => ({
  action: css`
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 36px !important;
    min-width: 36px;
    padding-inline: 8px !important;
    padding-block: 0 !important;
    border-radius: ${token.borderRadius}px !important;
  `,
}));

export const FullscreenToggle: React.FC = () => {
  const { styles } = useStyles();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!screenfull.isEnabled) return;
    const onChange = () => setIsFullscreen(screenfull.isFullscreen);
    screenfull.on('change', onChange);
    return () => screenfull.off('change', onChange);
  }, []);

  if (!screenfull.isEnabled) return null;

  const toggle = () => {
    screenfull.toggle();
  };

  return (
    <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
      <Button
        type="text"
        className={styles.action}
        icon={
          isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
        }
        aria-label={isFullscreen ? '退出全屏' : '全屏'}
        onClick={toggle}
      />
    </Tooltip>
  );
};

export const DocLink: React.FC = () => {
  const { styles } = useHeaderActionStyles();
  return (
    <Tooltip title="使用文档">
      <Button
        type="text"
        className={styles.action}
        icon={<BookOutlined />}
        aria-label="使用文档"
        onClick={() => {
          history.push('/welcome');
        }}
      />
    </Tooltip>
  );
};

export { LangDropdown, VersionDropdown };
