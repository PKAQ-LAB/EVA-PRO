import clsx from 'clsx';
import React from 'react';
import styles from './index.module.css';

export interface PageProps {
  className?: string;
  children?: React.ReactNode;
  /** inner=true 时启用 100vh - chrome 的内容区高度 */
  inner?: boolean;
}

/** 内页 100% 高度容器 */
const Page: React.FC<PageProps> = ({ className, children, inner = false }) => (
  <div className={clsx(className, { [styles.contentInner]: inner })}>
    {children}
  </div>
);

export default Page;
