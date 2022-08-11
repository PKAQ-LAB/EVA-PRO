import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { SelectLang, useModel } from '@umijs/max';
import { Space, Tooltip } from 'antd';
import React, { useState } from 'react';
import screenfull from 'screenfull';
import HeaderSearch from '../HeaderSearch';
import Avatar from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
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

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="站内搜索"
        defaultValue="umi ui"
        options={[
          { label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>, value: 'umi ui' },
          {
            label: <a href="next.ant.design">Ant Design</a>,
            value: 'Ant Design',
          },
          {
            label: <a href="https://protable.ant.design/">Pro Table</a>,
            value: 'Pro Table',
          },
          {
            label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
            value: 'Pro Layout',
          },
        ]}
        // onSearch={value => {
        //   console.log('input', value);
        // }}
      />
      <span
        className={styles.action}
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <QuestionCircleOutlined />
      </span>
      {/* 全屏 */}
      <Tooltip title={fullscreen ? '全屏' : '退出全屏'}>
        <span className={styles.action} onClick={() => f11()}>
          {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </span>
      </Tooltip>
      <Avatar />
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
