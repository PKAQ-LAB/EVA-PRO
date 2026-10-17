import {
  CaretLeftOutlined,
  CaretRightOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';
import clsx from 'clsx';
import React, { useState } from 'react';
import styles from './index.module.css';

const { Content, Sider } = Layout;

export interface SideLayoutProps {
  prefixCls?: string;
  className?: string;
  children?: React.ReactNode;
  title?: React.ReactNode;
  width?: number | string;
  collapsible?: boolean;
  layoutStyle?: React.CSSProperties;
  body?: React.ReactNode;
  bodyStyle?: React.CSSProperties;
}

/**
 * 左侧栏 + 主内容区布局，支持折叠侧栏。
 */
const SideLayout: React.FC<SideLayoutProps> = ({
  prefixCls = 'eva-side-layout',
  className,
  children,
  title,
  width = 300,
  collapsible = true,
  layoutStyle,
  body,
  bodyStyle,
}) => {
  const [openSide, setOpenSide] = useState(true);
  const sideVisible = !collapsible || openSide;

  const toggle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenSide((prev) => !prev);
  };

  return (
    <Layout className={clsx(prefixCls, className)} style={layoutStyle}>
      <Sider
        trigger={null}
        collapsible={collapsible}
        collapsed={!sideVisible}
        collapsedWidth={45}
        width={width}
        className={styles.layout}
      >
        <div className={styles.title}>
          <div
            style={{
              visibility: sideVisible ? 'visible' : 'hidden',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <FolderOutlined />
            &nbsp; {title}
          </div>
          {collapsible && (
            <button
              type="button"
              className="side-handle"
              onClick={toggle}
              title={openSide ? '收起' : '展开'}
              aria-label={openSide ? '收起' : '展开'}
              aria-expanded={openSide}
            >
              {openSide ? <CaretLeftOutlined /> : <CaretRightOutlined />}
            </button>
          )}
        </div>
        {sideVisible && (
          <div className={styles.body} style={bodyStyle}>
            {body}
          </div>
        )}
      </Sider>
      <Content className={styles.content}>{children}</Content>
    </Layout>
  );
};

export default SideLayout;
