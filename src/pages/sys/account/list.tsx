import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { App, Divider, Popconfirm } from 'antd';
import clsx from 'clsx';
import React, { useImperativeHandle } from 'react';
import type { AccountItem, AccountLockStatus } from './data.d';
import {
  type AccountListResponse,
  deleteAccounts,
  getAccount,
  queryAccountList,
} from './service';

export interface AccountListHandle {
  refresh: () => void;
}

export interface AccountListProps {
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  onEdit: (record: AccountItem) => void;
  onGrant: (record: AccountItem) => void;
  /** 受控刷新句柄，由父组件 ref 持有 */
  innerRef?: React.RefObject<AccountListHandle | null>;
  /** 父级搜索条件，外部触发刷新时也会一并带上 */
  query?: Record<string, unknown>;
}

const lockedLabel = (status?: AccountLockStatus) => {
  switch (status) {
    case '0000':
      return '正常';
    case '0001':
      return '已锁定';
    case '9999':
      return '系统用户';
    default:
      return '-';
  }
};

const AccountList: React.FC<AccountListProps> = ({
  selectedRowKeys,
  setSelectedRowKeys,
  onEdit,
  onGrant,
  innerRef,
  query,
}) => {
  const { message: msg, modal } = App.useApp();
  const actionRef = React.useRef<ActionType | undefined>(undefined);

  useImperativeHandle(
    innerRef,
    () => ({ refresh: () => actionRef.current?.reload() }),
    [],
  );

  const handleDelete = async (record: AccountItem) => {
    if (!record.id) return;
    const res = await deleteAccounts([record.id]);
    if (res.success) {
      msg.success('删除成功');
      actionRef.current?.reload();
    }
  };

  const handleEdit = async (record: AccountItem) => {
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    const res = await getAccount(record.id);
    if (res.data) onEdit(res.data);
  };

  const handleGrant = async (record: AccountItem) => {
    if (!record.id) return;
    const res = await getAccount(record.id);
    if (res.data) onGrant(res.data);
  };

  const columns: ProColumns<AccountItem>[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '账号', dataIndex: 'account' },
    { title: '所属部门', dataIndex: 'deptName', search: false },
    { title: '手机', dataIndex: 'tel' },
    {
      title: '账号状态',
      dataIndex: 'locked',
      search: false,
      render: (_, record) => lockedLabel(record.locked),
    },
    {
      title: '操作',
      width: 180,
      search: false,
      render: (_, record) =>
        record.locked === '0000' && (
          <>
            <a onClick={() => handleGrant(record)}>角色授权</a>
            <Divider type="vertical" />
            <a onClick={() => handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDelete(record)}
            >
              <a>删除</a>
            </Popconfirm>
          </>
        ),
    },
  ];

  return (
    <ProTable<AccountItem>
      actionRef={actionRef}
      columns={columns}
      rowKey="id"
      search={false}
      params={query}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys.map(String)),
        getCheckboxProps: (record) => ({
          disabled: record.locked === '9999' || record.locked === '0001',
          name: record.name,
        }),
      }}
      rowClassName={(record) =>
        clsx({
          'eva-locked': record.locked === '0001',
          'eva-disabled': record.locked === '9999',
        })
      }
      onRow={(record) => ({
        onDoubleClick: () => handleEdit(record),
      })}
      request={async (params) => {
        const res: AccountListResponse = await queryAccountList({
          ...query,
          ...params,
        });
        return {
          data: res?.data ?? [],
          total: res?.total ?? 0,
          success: res?.success ?? true,
        };
      }}
    />
  );
};

export default AccountList;
