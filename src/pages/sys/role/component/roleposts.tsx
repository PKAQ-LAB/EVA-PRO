import { Alert, Button, Skeleton, Table } from 'antd';
import { useEffect, useState } from 'react';
import type { RolePostItem } from '../data.d';
import { queryRolePosts } from '../service';

interface Props {
  identity: string;
  value: string[];
  onChange: (ids: string[]) => void;
  onValidChange: (valid: boolean) => void;
  readOnly: boolean;
  disabled: boolean;
  waiting: boolean;
}

export default function RolePosts({
  identity,
  value,
  onChange,
  onValidChange,
  readOnly,
  disabled,
  waiting,
}: Props) {
  const [rows, setRows] = useState<RolePostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setRows([]);
    setError(false);
    setLoading(true);
    if (!waiting) {
      void queryRolePosts()
        .then((res) => {
          if (res.success !== true || !Array.isArray(res.data))
            throw new Error('岗位列表不可用');
          const seen = new Set<string>();
          const flatten = (nodes: RolePostItem[]): RolePostItem[] =>
            nodes.flatMap((node) => {
              if (
                typeof node.id !== 'string' ||
                !/^[1-9]\d*$/.test(node.id) ||
                seen.has(node.id)
              )
                throw new Error('岗位标识无效');
              seen.add(node.id);
              return [
                { ...node, children: undefined },
                ...flatten(node.children ?? []),
              ];
            });
          const next = flatten(res.data);
          if (active) setRows(next);
        })
        .catch(() => {
          if (active) setError(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [identity, retry, waiting]);

  const selectedKey = JSON.stringify(value);
  const eligible = (row: RolePostItem) =>
    row.frozen === 0 || row.frozen === 9999;
  const invalid = value.filter(
    (id) => !rows.some((row) => row.id === id && eligible(row)),
  );
  const valid =
    !loading && !error && !waiting && value.length > 0 && invalid.length === 0;
  useEffect(() => {
    onValidChange(valid);
  }, [valid, selectedKey, onValidChange]);
  const missing = value
    .filter((id) => !rows.some((row) => row.id === id))
    .map((id) => ({ id, title: `岗位不可用（${id}）` }));
  const visible = readOnly
    ? [...rows.filter((row) => value.includes(row.id)), ...missing]
    : [...rows, ...missing];
  return (
    <section
      aria-label="指定岗位"
      aria-busy={loading || waiting}
      style={{ minWidth: 0, minHeight: 300 }}
    >
      <div style={{ marginBottom: 12 }}>指定岗位</div>
      {error ? (
        <Alert
          type="error"
          title="岗位列表加载失败，请重试"
          action={
            <Button onClick={() => setRetry((count) => count + 1)}>
              重试岗位
            </Button>
          }
        />
      ) : null}
      {loading || waiting ? (
        <>
          <span role="status">加载中...</span>
          <Skeleton active paragraph={{ rows: 6 }} />
        </>
      ) : error ? null : (
        <>
          {invalid.length > 0 && (
            <Alert
              type="warning"
              title="已选岗位已失效或不可见，请移除后重新选择"
            />
          )}
          {!readOnly && value.length === 0 && <div>请选择至少一个有效岗位</div>}
          <Table<RolePostItem>
            aria-label="岗位列表"
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={visible}
            scroll={{ y: 340 }}
            columns={[
              {
                title: '岗位名称',
                dataIndex: 'title',
                render: (title) => title || '—',
              },
              {
                title: '状态',
                render: (_, row) => (eligible(row) ? '有效' : '失效或不可用'),
              },
            ]}
            rowSelection={
              readOnly
                ? undefined
                : {
                    selectedRowKeys: value,
                    checkStrictly: true,
                    onChange: (keys) => {
                      if (!disabled) onChange(keys.map(String));
                    },
                    getCheckboxProps: (row) => ({
                      disabled:
                        disabled || (!eligible(row) && !value.includes(row.id)),
                    }),
                  }
            }
          />
        </>
      )}
    </section>
  );
}
