import { Alert, Button, Skeleton, Table } from 'antd';
import { useState } from 'react';
import { viewRow } from '@/components/RecordView';
import { textColumn } from '@/components/TablePresentation';
import type { AccountRoleRef, RoleItem } from './data.d';
import RoleModulesView from './rolemodulesview';

interface RoleListProps {
  value?: AccountRoleRef[];
  onChange?: (roles: AccountRoleRef[]) => void;
  roles: RoleItem[];
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  metadataError?: string;
  onRetryMetadata?: () => void;
  onRetry?: () => void;
}

export default function RoleList({
  value = [],
  onChange,
  roles,
  loading,
  error,
  disabled,
  readOnly = false,
  metadataError,
  onRetryMetadata,
  onRetry,
}: RoleListProps) {
  const [previewRole, setPreviewRole] = useState<RoleItem | null>(null);
  const showRole = (role: RoleItem) => {
    if (loading) return;
    setPreviewRole((current) =>
      current?.id === role.id ? current : { id: role.id, name: role.name },
    );
  };
  return (
    <>
      <Table<RoleItem>
        scroll={{ x: readOnly ? 430 : 360 }}
        aria-label="角色授权列表"
        size="small"
        rowKey="id"
        loading={loading}
        dataSource={loading || error ? [] : roles}
        pagination={false}
        title={
          error || metadataError
            ? () => (
                <Alert
                  className="eva-view-notice"
                  type="error"
                  showIcon
                  title={error ? '角色列表加载失败' : metadataError}
                  action={
                    error || onRetryMetadata ? (
                      <Button
                        htmlType="button"
                        disabled={false}
                        onClick={error ? onRetry : onRetryMetadata}
                      >
                        {error ? '重试' : '重试角色'}
                      </Button>
                    ) : undefined
                  }
                />
              )
            : undefined
        }
        locale={{
          emptyText: loading ? (
            <div>
              <span role="status">加载中...</span>
              <div aria-hidden="true">
                <Skeleton active title={false} paragraph={{ rows: 3 }} />
              </div>
            </div>
          ) : error || metadataError ? (
            <span />
          ) : readOnly ? (
            '暂无已分配角色'
          ) : (
            '暂无可选角色'
          ),
        }}
        columns={[
          {
            title: '序号',
            width: 64,
            align: 'center',
            render: (_, _role, index) => index + 1,
          },
          {
            ...textColumn<RoleItem>('角色名称', 'name', 240),
            sorter: (left, right) =>
              left.name.localeCompare(right.name, 'zh-CN'),
          },
          ...(readOnly
            ? [
                {
                  title: '角色状态',
                  width: 100,
                  align: 'center' as const,
                  render: (_: unknown, role: RoleItem) =>
                    role.frozen === 1
                      ? '已锁定'
                      : role.frozen === 9999
                        ? '系统只读'
                        : role.frozen === 0
                          ? '未锁定'
                          : '—',
                },
              ]
            : []),
        ]}
        onRow={(role) => ({
          ...viewRow(() => showRole(role)),
          tabIndex: loading ? -1 : 0,
          onKeyDown: (event) => {
            if (
              event.key === 'Enter' &&
              !event.repeat &&
              event.target === event.currentTarget
            ) {
              event.preventDefault();
              showRole(role);
            }
          },
        })}
        rowSelection={
          readOnly
            ? undefined
            : {
                selectedRowKeys: value.map((role) => role.id),
                preserveSelectedRowKeys: true,
                onChange: (keys) => {
                  if (!disabled && !loading)
                    onChange?.(keys.map((id) => ({ id: String(id) })));
                },
                getCheckboxProps: (role) => ({
                  disabled: disabled || loading,
                  name: role.name,
                  'aria-label': `授权角色${role.name}`,
                }),
              }
        }
      />
      {previewRole && (
        <RoleModulesView
          key={previewRole.id}
          role={previewRole}
          onClose={() => setPreviewRole(null)}
        />
      )}
    </>
  );
}
