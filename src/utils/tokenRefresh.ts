import type { RequestOptions } from '@@/plugin-request/request';
import type { AuthRefreshResult } from '@/services/auth';
import {
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from './authState';

let refreshTokenTask: Promise<string> | null = null;

const getTokenValue = (
  payload: AuthRefreshResult,
  snakeKey: 'access_token' | 'refresh_token',
  camelKey: 'accessToken' | 'refreshToken',
) =>
  payload.data?.[snakeKey] ||
  payload.data?.[camelKey] ||
  (payload as AuthRefreshResult & Record<string, string | undefined>)[
    snakeKey
  ] ||
  (payload as AuthRefreshResult & Record<string, string | undefined>)[camelKey];

async function requestNewAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('缺少刷新令牌');
  }
  const response = await fetch('/api/auth/getAlpha', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
  const payload = (await response.json()) as AuthRefreshResult;
  const accessToken = getTokenValue(payload, 'access_token', 'accessToken');
  if (!response.ok || payload.success === false || !accessToken) {
    throw new Error(payload.message || '刷新登录令牌失败');
  }
  const nextRefreshToken = getTokenValue(
    payload,
    'refresh_token',
    'refreshToken',
  );
  setStoredAccessToken(accessToken);
  if (nextRefreshToken) {
    setStoredRefreshToken(nextRefreshToken);
  }
  return accessToken;
}

export async function refreshAccessToken() {
  if (!refreshTokenTask) {
    refreshTokenTask = requestNewAccessToken().finally(() => {
      refreshTokenTask = null;
    });
  }
  return refreshTokenTask;
}

type ReplayRequestOptions = RequestOptions & {
  url?: string;
  _retryAuth?: boolean;
  _retryCount?: number;
};

export async function replayRequest<T = unknown>(
  config: ReplayRequestOptions,
  token?: string,
) {
  const { request } = await import('@umijs/max');
  const { url = '', headers, ...options } = config;
  return request<T>(url, {
    ...options,
    headers: {
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
