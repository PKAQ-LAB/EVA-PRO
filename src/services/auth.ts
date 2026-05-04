import { request } from '@umijs/max';

export interface AuthLoginParams {
  account?: string;
  password?: string;
  autoLogin?: boolean;
}

export interface AuthLoginResult {
  status?: string;
  type?: string;
  currentAuthority?: string;
  data?: {
    access_token?: string;
    refresh_token?: string;
  };
}

/** 账号密码登录 POST /api/auth/login */
export async function login(body: AuthLoginParams) {
  return request<AuthLoginResult>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

/** 退出登录 GET /api/auth/logout */
export async function outLogin() {
  return request<unknown>('/api/auth/logout');
}
