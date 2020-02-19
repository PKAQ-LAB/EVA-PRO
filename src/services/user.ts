import request from '@src/utils/request';

export async function queryCurrent(): Promise<any> {
  return request('/api/auth/fetch');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}

// 修改密码
export async function repwd(params: any): Promise<any>  {
  return request('/api/sys/account/repwd', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
