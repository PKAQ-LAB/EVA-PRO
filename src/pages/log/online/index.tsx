import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Descriptions, Drawer } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useRecordView, viewRow } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  TextCell,
  textColumn,
} from '@/components/TablePresentation';
import { type OnlineUserItem, queryOnlineUsers } from './service';

const fmt = (val?: string) =>
  val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-';

const OnlinePage: React.FC = () => {
  const view = useRecordView<Omit<OnlineUserItem, 'token'>>();
  const showMetadata = (record: OnlineUserItem) =>
    view.show({
      id: record.id,
      account: record.account,
      device: record.device,
      version: record.version,
      loginTime: record.loginTime,
      issuedAt: record.issuedAt,
      expireAt: record.expireAt,
    });
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
    textColumn<OnlineUserItem>('用户名', 'account', 180),
    { ...textColumn<OnlineUserItem>('设备', 'device', 180), search: false },
    { ...textColumn<OnlineUserItem>('版本', 'version', 130), search: false },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      search: false,
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => <TextCell text={fmt(record.loginTime)} />,
    },
    {
      title: '签发时间',
      dataIndex: 'issuedAt',
      search: false,
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => <TextCell text={fmt(record.issuedAt)} />,
    },
    {
      title: '过期时间',
      dataIndex: 'expireAt',
      search: false,
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => <TextCell text={fmt(record.expireAt)} />,
    },
    {
      title: 'token',
      dataIndex: 'token',
      search: false,
      width: 320,
      render: (_, record) => (
        <div
          data-no-row-view
          style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}
        >
          <span
            style={{
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {record.token}
          </span>
          <Button
            type="link"
            style={{ padding: 0, flexShrink: 0, whiteSpace: 'nowrap' }}
            onClick={() => copyToken(record.token)}
          >
            复制到剪贴板
          </Button>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'view',
      ...actionColumn(100),
      render: (_, record) => (
        <ActionGroup>
          <Button type="link" size="small" onClick={() => showMetadata(record)}>
            查看
          </Button>
        </ActionGroup>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: false, subTitle: false }}>
      <ProTable<OnlineUserItem>
        scroll={{ x: 1560 }}
        onRow={(record) => viewRow(() => showMetadata(record))}
        defaultSize="small"
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
      <Drawer
        title="在线用户明细"
        closable={{ placement: 'end' }}
        width={600}
        open={view.open}
        onClose={view.close}
        destroyOnHidden
      >
        {view.data && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="用户名">
              {view.data.account}
            </Descriptions.Item>
            <Descriptions.Item label="设备">
              {view.data.device}
            </Descriptions.Item>
            <Descriptions.Item label="版本">
              {view.data.version}
            </Descriptions.Item>
            <Descriptions.Item label="登录时间">
              {fmt(view.data.loginTime)}
            </Descriptions.Item>
            <Descriptions.Item label="签发时间">
              {fmt(view.data.issuedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="过期时间">
              {fmt(view.data.expireAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default OnlinePage;
