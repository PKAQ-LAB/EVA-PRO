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
  width?: number;
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
  layoutStyle,
  body,
  bodyStyle,
}) => {
  const [openSide, setOpenSide] = useState(true);

  const toggle: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenSide((prev) => !prev);
  };

  return (
    <Layout className={clsx(prefixCls, className)} style={layoutStyle}>
      <Sider
        trigger={null}
        collapsible
        collapsed={!openSide}
        collapsedWidth={45}
        width={width}
        className={styles.layout}
      >
        <div className={styles.title}>
          <div>
            <FolderOutlined />
            &nbsp; {title}
          </div>
          <a
            className="side-handle"
            onClick={toggle}
            title={openSide ? '收起' : '展开'}
          >
            {openSide ? <CaretLeftOutlined /> : <CaretRightOutlined />}
          </a>
        </div>
        {openSide && (
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
