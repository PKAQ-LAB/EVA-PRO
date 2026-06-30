import { useModel } from '@umijs/max';
import { createStyles } from 'antd-style';
import React from 'react';
import defaultSettings from '../../../config/defaultSettings';

const useStyles = createStyles(({ token, css }) => ({
  footer: css`
    display: flex;
    height: 30px;
    flex: 0 0 30px;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    padding: 0 24px;
    border-top: 1px solid ${token.colorBorderSecondary};
    background: #fff;
    color: ${token.colorTextDescription};
    font-size: 12px;
    line-height: 30px;
    white-space: nowrap;
  `,
}));

export interface FooterProps {
  /**
   * Copyright 文案。
   * 优先级：组件 props > initialState.settings.copyright（SettingDrawer 可改）
   *   > config/defaultSettings.ts 中的 copyright > 默认占位文案。
   */
  copyright?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ copyright }) => {
  const { styles } = useStyles();
  const { initialState } = useModel('@@initialState');
  const settings = initialState?.settings as
    | { copyright?: React.ReactNode; version?: string }
    | undefined;
  const resolvedCopyright =
    copyright ?? settings?.copyright ?? defaultSettings.copyright ?? '';
  const version =
    settings?.version ?? defaultSettings.version ?? __APP_VERSION__;

  return (
    <div className={styles.footer}>
      {resolvedCopyright && <span>{resolvedCopyright}</span>}
      {version && <span>系统版本：{version}</span>}
    </div>
  );
};

export default Footer;
