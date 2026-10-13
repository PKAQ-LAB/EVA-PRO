import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Divider } from 'antd';
import clsx from 'clsx';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { frozenText } from '../status';
import type { AccountItem } from './data.d';
import {
  type AccountListResponse,
  deleteAccounts,
  getAccount,
  lockAccounts,
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

const AccountList: React.FC<AccountListProps> = ({
  selectedRowKeys,
  setSelectedRowKeys,
  onEdit,
  onGrant,
  innerRef,
  query,
}) => {
  const intl = useIntl();
  const { message: msg, modal } = App.useApp();
  const actionRef = React.useRef<ActionType | undefined>(undefined);
  const lockingRef = useRef(false);
  const [lockingId, setLockingId] = useState<string | null>(null);

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

  const confirmDelete = (record: AccountItem) => {
    modal.confirm({
      title: '确定要删除吗？',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record),
    });
  };

  const handleEdit = async (record: AccountItem) => {
    if (record.frozen === 9999 || record.frozen === 1) return;
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    const res = await getAccount(record.id);
    if (res.data) onEdit(res.data);
  };

  const handleGrant = async (record: AccountItem) => {
    if (record.frozen === 9999 || record.frozen === 1) return;
    if (!record.id) return;
    const res = await getAccount(record.id);
    if (res.data) onGrant(res.data);
  };

  const handleLock = async (record: AccountItem) => {
    if (!record.id || record.frozen === 9999 || lockingRef.current) return;
    lockingRef.current = true;
    setLockingId(record.id);
    const unlock = record.frozen === 1;
    try {
      // 现有接口按账号切换锁定状态，单行操作仅传当前账号ID。
      const res = await lockAccounts([record.id], unlock ? '0000' : '0001');
      if (res.success) {
        msg.success(unlock ? '解锁成功' : '锁定成功');
        actionRef.current?.reload();
      } else {
        msg.error(res.message ?? '操作失败，请重试');
      }
    } catch {
      msg.error('操作失败，请重试');
    } finally {
      lockingRef.current = false;
      setLockingId(null);
    }
  };

  const columns: ProColumns<AccountItem>[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '账号', dataIndex: 'account' },
    { title: '所属部门', dataIndex: 'deptName', search: false },
    { title: '手机', dataIndex: 'tel' },
    {
      title: '账号状态',
      dataIndex: 'frozen',
      search: false,
      render: (_, record) => frozenText(intl, record.frozen),
    },
    {
      title: '操作',
      align: 'center',
      width: 260,
      search: false,
      render: (_, record) =>
        record.frozen !== 9999 && (
          <div onDoubleClick={(event) => event.stopPropagation()}>
            <Button
              type="link"
              size="small"
              icon={record.frozen === 1 ? <UnlockOutlined /> : <LockOutlined />}
              loading={lockingId === record.id}
              disabled={lockingId !== null}
              onClick={(event) => {
                event.stopPropagation();
                void handleLock(record);
              }}
            >
              {record.frozen === 1 ? '解锁' : '锁定'}
            </Button>
            {record.frozen !== 1 && (
              <>
                <Divider type="vertical" />
                <a onClick={() => handleGrant(record)}>角色授权</a>
                <Divider type="vertical" />
                <a onClick={() => handleEdit(record)}>编辑</a>
                <Divider type="vertical" />
                <a
                  className="eva-delete-link"
                  onClick={() => confirmDelete(record)}
                >
                  删除
                </a>
              </>
            )}
          </div>
        ),
    },
  ];

  return (
    <ProTable<AccountItem>
      defaultSize="small"
      actionRef={actionRef}
      columns={columns}
      rowKey="id"
      search={false}
      params={query}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys.map(String)),
        getCheckboxProps: (record) => ({
          disabled: record.frozen === 9999 || record.frozen === 1,
          name: record.name,
        }),
      }}
      rowClassName={(record) =>
        clsx({
          'eva-locked': record.frozen === 1,
          'eva-readonly': record.frozen === 9999,
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
