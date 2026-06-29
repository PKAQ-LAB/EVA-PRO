import { request } from '@umijs/max';

export interface AuthLoginParams {
  account?: string;
  password?: string;
  autoLogin?: boolean;
}

export interface AuthLoginResult {
  success?: boolean;
  code?: string;
  message?: string;
  status?: string;
  type?: string;
  currentAuthority?: string;
  data?: {
    access_token?: string;
    accessToken?: string;
    refresh_token?: string;
    refreshToken?: string;
    user_info?: Record<string, unknown>;
    userInfo?: Record<string, unknown>;
  };
}

/** 账号密码登录 POST /api/auth/login */
export async function login(
  body: AuthLoginParams,
  options?: Record<string, unknown>,
) {
  return request<AuthLoginResult>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** 退出登录 GET /api/auth/logout */
export async function outLogin() {
  return request<unknown>('/api/auth/logout');
}
