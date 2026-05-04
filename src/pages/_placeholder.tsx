import { PageContainer } from '@ant-design/pro-components';
import { Alert, Empty } from 'antd';
import React from 'react';

interface MigrationPlaceholderProps {
  /** 模块名，用作页面标题 */
  title: string;
  /** V5 EVA-PRO 中对应的源文件路径，方便迁移者对照 */
  v5Source: string;
  /** 涉及的 APIS 常量名，用于快速链接到 src/apis.ts */
  apiKeys?: string[];
  /** 备注信息（如：依赖 sys/account 的字典选择器） */
  notes?: string;
}

/**
 * 通用迁移占位页：用于 TASK-08 暂未完整迁移的业务模块。
 * 路由先注册占位，后续按相同模板逐个迁移。
 */
const MigrationPlaceholder: React.FC<MigrationPlaceholderProps> = ({
  title,
  v5Source,
  apiKeys,
  notes,
}) => (
  <PageContainer>
    <Alert
      type="info"
      showIcon
      title={`${title} —— 待 V6 重构`}
      description={
        <div>
          <p style={{ marginBottom: 4 }}>
            V5 源文件: <code>{v5Source}</code>
          </p>
          {apiKeys && apiKeys.length > 0 && (
            <p style={{ marginBottom: 4 }}>
              使用 APIS: <code>{apiKeys.join(', ')}</code>
            </p>
          )}
          {notes && <p style={{ marginBottom: 0 }}>备注: {notes}</p>}
          <p style={{ marginTop: 8, marginBottom: 0 }}>
            待办：jsx → tsx、Less → Tailwind/CSS Modules、useRequest → React
            Query、ProComponents v2 → v3 API、Class → 函数式、lodash 替换。
          </p>
        </div>
      }
      style={{ marginBottom: 24 }}
    />
    <Empty description={`${title} 等待迁移`} />
  </PageContainer>
);

export default MigrationPlaceholder;
