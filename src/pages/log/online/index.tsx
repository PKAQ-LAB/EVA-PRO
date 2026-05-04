import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { type OnlineUserItem, queryOnlineUsers } from './service';

const fmt = (val?: string) =>
  val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-';

const OnlinePage: React.FC = () => {
  const { message } = App.useApp();

  const copyToken = async (token?: string) => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      message.success('token 已复制到剪贴板');
    } catch {
      message.error('复制失败，请重新尝试');
    }
  };

  const columns: ProColumns<OnlineUserItem>[] = [
    { title: '用户名', dataIndex: 'account', ellipsis: true },
    { title: '设备', dataIndex: 'device', search: false, ellipsis: true },
    { title: '版本', dataIndex: 'version', search: false },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      search: false,
      render: (_, record) => fmt(record.loginTime),
    },
    {
      title: '签发时间',
      dataIndex: 'issuedAt',
      search: false,
      ellipsis: true,
      render: (_, record) => fmt(record.issuedAt),
    },
    {
      title: '过期时间',
      dataIndex: 'expireAt',
      search: false,
      render: (_, record) => fmt(record.expireAt),
    },
    {
      title: 'token',
      dataIndex: 'token',
      search: false,
      ellipsis: true,
      width: 240,
      render: (_, record) => (
        <div>
          <span>{record.token}</span>
          <Button
            type="link"
            style={{ padding: 0, marginLeft: 8 }}
            onClick={() => copyToken(record.token)}
          >
            复制到剪贴板
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<OnlineUserItem>
        columns={columns}
        headerTitle="在线用户名单"
        rowKey="id"
        rowSelection={{}}
        request={async (params) => {
          const res = await queryOnlineUsers(params);
          return {
            data: res?.data ?? [],
            total: res?.total ?? 0,
            success: res?.success ?? true,
          };
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <div>
            已选择{' '}
            <span style={{ fontWeight: 600 }}>{selectedRowKeys.length}</span> 项
          </div>
        )}
      />
    </PageContainer>
  );
};

export default OnlinePage;
