import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { fetch } from './services/onlineSvc';

const OnlineUsers = () => {
    const columns = [
      {
        title: '用户名',
        dataIndex: 'account',
        ellipsis: true,
      },
      {
        title: '设备',
        dataIndex: 'device',
        ellipsis: true,
      },
      {
        title: '版本',
        dataIndex: 'version',
        hideInForm: true,
      },
      {
        title: '登录时间',
        dataIndex: 'loginTime',
        hideInForm: true,
      },
      {
        title: '签发时间',
        dataIndex: 'issuedAt',
        ellipsis: true,
      },
      {
        title: '过期时间',
        dataIndex: 'expireAt',
        hideInForm: true,
      },
      {
        title: 'token',
        dataIndex: 'token',
        hideInForm: true,
        render: record => (
          <div>
            复制token
          </div>
        ),
      },
    ];

    const tableProps = {
      columns,
      headerTitle: '在线用户名单',
      rowKey: 'id',
      rowSelection: {},
      request: params => fetch(params),
      tableAlertRender: selectedRowKeys => (
        <div>
          已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
        </div>
      )
    };

    return (
      <PageHeaderWrapper>
        <ProTable {...tableProps} />
      </PageHeaderWrapper>
    )
}

export default OnlineUsers;
