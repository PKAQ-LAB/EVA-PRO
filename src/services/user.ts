import { request } from 'umi';
import type { API } from './API';

export async function query() {
  return request<API.CurrentUser[]>('/api/users');
}

export async function queryCurrent() {
  return request<API.CurrentUser>('/api/auth/fetch');
}

export async function queryNotices(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/notices');
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
