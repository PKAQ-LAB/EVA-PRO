import { useModel } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';
import PageLoading from '../PageLoading';

export default function AuthBootstrapStatus() {
  const { loading, error, refresh } = useModel('@@initialState');
  if (loading || !error) return <PageLoading />;
  const forbidden =
    (error as { response?: { status?: number } }).response?.status === 403;
  return (
    <Result
      status={forbidden ? '403' : 'warning'}
      title={forbidden ? '暂无访问权限' : '暂时无法验证登录状态'}
      subTitle={
        forbidden
          ? '当前账号没有访问权限，请联系管理员。'
          : '请检查网络或稍后重试，当前登录信息已保留。'
      }
      extra={
        <Button type="primary" onClick={() => void refresh()}>
          重试
        </Button>
      }
    />
  );
}
