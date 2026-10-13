import { Alert, Button, Table } from 'antd';
import type { AccountRoleRef, RoleItem } from './data.d';

interface RoleListProps {
  value?: AccountRoleRef[];
  onChange?: (roles: AccountRoleRef[]) => void;
  roles: RoleItem[];
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export default function RoleList({
  value = [],
  onChange,
  roles,
  loading,
  error,
  disabled,
  onRetry,
}: RoleListProps) {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title="角色列表加载失败"
        action={<Button onClick={onRetry}>重试</Button>}
      />
    );
  }
  return (
    <Table<RoleItem>
      aria-label="角色授权列表"
      size="small"
      rowKey="id"
      loading={loading}
      dataSource={roles}
      pagination={false}
      locale={{ emptyText: '暂无可选角色' }}
      columns={[
        {
          title: '序号',
          width: 64,
          align: 'center',
          render: (_, _role, index) => index + 1,
        },
        {
          title: '角色名称',
          dataIndex: 'name',
          sorter: (left, right) => left.name.localeCompare(right.name, 'zh-CN'),
        },
      ]}
      rowSelection={{
        selectedRowKeys: value.map((role) => role.id),
        preserveSelectedRowKeys: true,
        onChange: (keys) => onChange?.(keys.map((id) => ({ id: String(id) }))),
        getCheckboxProps: (role) => ({
          disabled: disabled || loading,
          name: role.name,
          'aria-label': `授权角色${role.name}`,
        }),
      }}
    />
  );
}
