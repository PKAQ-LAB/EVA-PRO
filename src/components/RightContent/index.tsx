import {
  BookOutlined,
  CheckOutlined,
  ForkOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { getAllLocales, getLocale, history, setLocale } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Button, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useMemo, useState } from 'react';
import screenfull from 'screenfull';
import HeaderDropdown from '../HeaderDropdown';

export const localeLabelMap: Record<string, { emoji: string; label: string }> =
  {
    'zh-CN': { emoji: '🇨🇳', label: '简体中文' },
    'zh-TW': { emoji: '🇭🇰', label: '繁體中文' },
    'en-US': { emoji: '🇺🇸', label: 'English' },
    'ja-JP': { emoji: '🇯🇵', label: '日本語' },
    'pt-BR': { emoji: '🇧🇷', label: 'Português' },
    'id-ID': { emoji: '🇮🇩', label: 'Bahasa Indonesia' },
    'fa-IR': { emoji: '🇮🇷', label: 'فارسی' },
    'bn-BD': { emoji: '🇧🇩', label: 'বাংলা' },
  };

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
  const { styles } = useStyles();
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

const versionItems: MenuProps['items'] = [
  { key: 'https://v5.pro.ant.design', label: 'v5' },
  { key: 'https://v4.pro.ant.design', label: 'v4' },
  { key: 'https://v2.pro.ant.design', label: 'v2' },
  { key: 'https://v1.pro.ant.design', label: 'v1' },
];

const onVersionClick: MenuProps['onClick'] = ({ key }) => {
  window.open(key, '_blank', 'noopener,noreferrer');
};

export const VersionDropdown: React.FC = () => {
  const { styles } = useStyles();
  return (
    <HeaderDropdown
      placement="bottomRight"
      arrow
      menu={{
        selectedKeys: [],
        onClick: onVersionClick,
        items: versionItems,
        style: { minWidth: 100 },
      }}
    >
      <Button type="text" className={styles.action} aria-label="历史版本">
        <ForkOutlined />
      </Button>
    </HeaderDropdown>
  );
};

export const LangDropdown: React.FC = () => {
  const { styles } = useStyles();
  const allLocales = useMemo(() => getAllLocales(), []);
  const currentLocale = getLocale();
  const supportLocales = allLocales.filter((l) => l in localeLabelMap);

  if (supportLocales.length <= 1) {
    return null;
  }

  const langItems: MenuProps['items'] = supportLocales.map((locale) => ({
    key: `lang-${locale}`,
    icon:
      locale === currentLocale ? (
        <CheckOutlined style={{ color: '#52c41a' }} />
      ) : (
        <span style={{ display: 'inline-block', width: 14 }} />
      ),
    label: `${localeLabelMap[locale]?.emoji ?? ''} ${localeLabelMap[locale]?.label ?? locale}`,
  }));

  const onLangClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('lang-')) {
      setLocale(key.replace('lang-', ''), false);
    }
  };

  return (
    <HeaderDropdown
      placement="bottomRight"
      arrow
      menu={{
        selectedKeys: [`lang-${currentLocale}`],
        onClick: onLangClick,
        items: langItems,
        style: { minWidth: 180 },
      }}
    >
      <Button type="text" className={styles.action} aria-label="语言切换">
        <GlobalOutlined />
      </Button>
    </HeaderDropdown>
  );
};
