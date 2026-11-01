import { Alert, Button, Form, Skeleton, TreeSelect } from 'antd';
import { useEffect, useState } from 'react';
import { findTreeNode } from '@/utils/treeOperations';
import type { OrgItem } from '../../organization/data.d';
import { queryOrgs } from '../../organization/service';

interface Props {
  identity: string;
  value: string[];
  waiting: boolean;
  readOnly: boolean;
  disabled: boolean;
  onChange: (ids: string[]) => void;
  onReadyChange: (ready: boolean) => void;
}

export default function RoleDepartments({
  identity,
  value,
  waiting,
  readOnly,
  disabled,
  onChange,
  onReadyChange,
}: Props) {
  const [rows, setRows] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setRows([]);
    setLoading(true);
    setError(false);
    if (!waiting)
      void queryOrgs()
        .then((res) => {
          if (res.success !== true || !Array.isArray(res.data))
            throw new Error('部门不可用');
          if (active) setRows(res.data);
        })
        .catch(() => {
          if (active) setError(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [identity, waiting, retry]);
  const ready = !loading && !error && !waiting;
  useEffect(() => {
    onReadyChange(ready);
  }, [ready, onReadyChange]);
  return (
    <section
      aria-label="指定部门"
      aria-busy={loading || waiting}
      style={{ minWidth: 0, minHeight: 300 }}
    >
      <div style={{ marginBottom: 12 }}>指定部门</div>
      {error ? (
        <Alert
          type="error"
          title="部门列表加载失败，请重试"
          action={
            <Button onClick={() => setRetry((count) => count + 1)}>
              重试部门
            </Button>
          }
        />
      ) : null}
      {loading || waiting ? (
        <>
          <span role="status">加载中...</span>
          <Skeleton active paragraph={{ rows: 6 }} />
        </>
      ) : error ? null : readOnly ? (
        <Form.Item label="选择部门">
          <div className="eva-view-value">
            {value.length
              ? value
                  .map((id) => findTreeNode(rows, id)?.name || '—')
                  .join('、')
              : '—'}
          </div>
        </Form.Item>
      ) : (
        <TreeSelect<string[]>
          aria-label="选择部门"
          style={{ width: '100%' }}
          treeData={rows}
          fieldNames={{ label: 'name', value: 'id', children: 'children' }}
          treeCheckable
          treeDefaultExpandAll
          multiple
          tagRender={() => <></>}
          allowClear
          value={value}
          disabled={disabled}
          open={!disabled}
          listHeight={300}
          getPopupContainer={(trigger) => trigger.parentElement ?? trigger}
          styles={{
            popup: {
              root: { position: 'relative', inset: 'auto', boxShadow: 'none' },
            },
          }}
          onChange={(ids) => {
            if (!disabled) onChange(ids.map(String));
          }}
        />
      )}
    </section>
  );
}
