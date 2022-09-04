import { request } from '@umijs/max';
import type { API } from './API';

export async function queryUsers() {
  return request<API.CurrentUser[]>('/api/users');
}

export async function fetchMenus(options?: Record<string, any>) {
  return request<any>('/api/auth/fetchMenus',{
    method: 'GET',
    ...(options || {}),
  });
}

export async function fetchDict(options?: Record<string, any>) {
  return request<any>('/api/auth/fetchDicts',{
    method: 'GET',
    ...(options || {}),
  });
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
