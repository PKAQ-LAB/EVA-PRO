import { DownloadOutlined } from '@ant-design/icons';
import { FormattedMessage, useLocation } from '@umijs/max';
import { Popover, Typography } from 'antd';
import React, { useRef } from 'react';
import styles from './index.module.css';

const firstUpperCase = (pathString: string): string =>
  pathString
    .replace('.', '')
    .split(/\/|-/)
    .map((s) => s.toLowerCase().replace(/( |^)[a-z]/g, (l) => l.toUpperCase()))
    .filter(Boolean)
    .join('');

interface BlockCodeViewProps {
  url: string;
}

const BlockCodeView: React.FC<BlockCodeViewProps> = ({ url }) => {
  const blockUrl = `npx umi block add ${firstUpperCase(url)} --path=${url}`;
  return (
    <div className={styles.copyBlockView}>
      <Typography.Paragraph
        copyable={{ text: blockUrl }}
        style={{ display: 'flex' }}
      >
        <pre>
          <code className={styles.copyBlockCode}>{blockUrl}</code>
        </pre>
      </Typography.Paragraph>
    </div>
  );
};

/**
 * "复制 block 命令" 浮窗按钮，原 ant-design-pro v3 的 doc helper 迁移版本。
 */
const CopyBlock: React.FC = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <Popover
      title={
        <FormattedMessage
          id="app.preview.down.block"
          defaultMessage="下载此页面到本地项目"
        />
      }
      placement="topLeft"
      content={<BlockCodeView url={location.pathname} />}
      trigger="click"
      getPopupContainer={(dom) => containerRef.current ?? dom}
    >
      <div className={styles.copyBlock} ref={containerRef}>
        <DownloadOutlined />
      </div>
    </Popover>
  );
};

export default CopyBlock;
