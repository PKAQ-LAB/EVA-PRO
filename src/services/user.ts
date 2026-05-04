import { request } from '@umijs/max';

/** 获取所有用户 GET /api/users */
export async function queryUsers() {
  return request<API.CurrentUser[]>('/api/users');
}

/** 获取登录用户的菜单树 GET /api/auth/fetchMenus */
export async function fetchMenus(options?: Record<string, unknown>) {
  return request<{ data?: unknown[] }>('/api/auth/fetchMenus', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取全部字典 GET /api/auth/fetchDicts */
export async function fetchDict(options?: Record<string, unknown>) {
  return request<{ data?: Record<string, unknown> }>('/api/auth/fetchDicts', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 通知列表 GET /api/notices */
export async function queryNotices() {
  return request<{ data: API.NoticeIconItem[] }>('/api/notices');
}

/** 修改密码 POST /api/sys/account/repwd */
export async function repwd(params: {
  oldPassword?: string;
  newPassword?: string;
  [k: string]: unknown;
}) {
  return request<{ success?: boolean; data?: unknown }>(
    '/api/sys/account/repwd',
    {
      method: 'POST',
      data: { ...params },
    },
  );
}
