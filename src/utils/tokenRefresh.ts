import type { RequestOptions } from '@@/plugin-request/request';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from './authState';

let refreshTokenTask: Promise<string> | null = null;

const getTokenValue = (
  payload: Record<string, unknown>,
  snakeKey: 'access_token' | 'refresh_token',
  camelKey: 'accessToken' | 'refreshToken',
) => {
  const data = payload.data;
  const tokens =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  return [
    tokens[snakeKey],
    tokens[camelKey],
    payload[snakeKey],
    payload[camelKey],
  ].find(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
};

async function requestNewAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw Object.assign(new Error('缺少刷新令牌'), {
      response: { status: 401 },
    });
  }
  const originalAccessToken = getStoredAccessToken();
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
  const body: unknown = await response.json().catch(() => undefined);
  const payload =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  // 退出或更换账号后，迟到的刷新结果不能恢复旧登录态。
  if (
    getStoredRefreshToken() !== refreshToken ||
    getStoredAccessToken() !== originalAccessToken
  )
    throw new Error('登录状态已变更');
  const accessToken = getTokenValue(payload, 'access_token', 'accessToken');
  if (!response.ok || payload.success === false || !accessToken) {
    throw Object.assign(
      new Error(
        typeof payload.message === 'string'
          ? payload.message
          : '刷新登录令牌失败',
      ),
      {
        response: { status: response.status, data: payload },
      },
    );
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
