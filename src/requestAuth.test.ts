import { message } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import { errorConfig } from './requestErrorConfig';
import {
  clearAuthState,
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from './utils/authState';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replay: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('@umijs/max', () => ({
  history: {
    location: { pathname: '/sys/role', search: '?page=2', hash: '' },
    replace: mocks.replace,
  },
  getIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));
vi.mock('antd', async (original) => {
  const actual = await original<typeof import('antd')>();
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});
vi.mock('@/utils/tokenRefresh', () => ({
  refreshAccessToken: mocks.refresh,
  replayRequest: mocks.replay,
}));
const interceptors = errorConfig.responseInterceptors?.[0] as [
  (response: unknown) => Promise<unknown>,
  (error: unknown) => Promise<unknown>,
];
const handleError = errorConfig.errorConfig?.errorHandler as (
  error: unknown,
  options: object,
) => void;
const config = { url: '/api/auth/fetchMenus', method: 'GET' };
const unauthorized = { config, response: { status: 401 } };

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.spyOn(window.location, 'replace').mockImplementation(mocks.replace);
  setStoredAccessToken('test-access');
  setStoredRefreshToken('test-refresh');
  mocks.replay.mockResolvedValue({ data: { success: true } });
});

it.each([403, 500, 'network', 'timeout'])(
  '刷新%s不把原401错误替代成最终失效，不清理凭据',
  async (kind) => {
    const error =
      typeof kind === 'number'
        ? { response: { status: kind } }
        : {
            request: {},
            code: kind === 'timeout' ? 'ECONNABORTED' : 'ERR_NETWORK',
          };
    mocks.refresh.mockRejectedValue(error);
    await expect(interceptors[1](unauthorized)).rejects.toBe(error);
    expect(getStoredAccessToken()).toBe('test-access');
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(message.error).not.toHaveBeenCalled();
  },
);
it('多个并发确认401只通知及重定向一次，保留业务返回目标', async () => {
  mocks.refresh.mockRejectedValue({ response: { status: 401 } });
  await Promise.allSettled([
    interceptors[1](unauthorized),
    interceptors[1](unauthorized),
  ]);
  handleError(unauthorized, {});
  const notice = vi.mocked(message.error).mock.calls[0][0] as {
    onClose: () => void;
  };
  notice.onClose();
  expect(mocks.replace).toHaveBeenCalledTimes(1);
  expect(message.error).toHaveBeenCalledTimes(1);
  expect(mocks.replace).toHaveBeenCalledWith(
    '/#/user/login?redirect=%2Fsys%2Frole%3Fpage%3D2',
  );
  expect(getStoredAccessToken()).toBe('');
});
it('成功刷新按原请求重放一次，重放403不当成失效', async () => {
  mocks.refresh.mockImplementation(async () => {
    setStoredAccessToken('new-access');
    return 'new-access';
  });
  const forbidden = { response: { status: 403 } };
  mocks.replay.mockRejectedValue(forbidden);
  await expect(interceptors[1](unauthorized)).rejects.toBe(forbidden);
  expect(mocks.replay).toHaveBeenCalledWith(
    { ...config, _retryAuth: true },
    'new-access',
  );
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(getStoredAccessToken()).toBe('new-access');
});
it('重放仍401不无限刷新，统一错误处理负责失效提示', async () => {
  const error = {
    config: { ...config, _retryAuth: true },
    response: { status: 401 },
  };
  await expect(interceptors[1](error)).rejects.toBe(error);
  expect(mocks.refresh).not.toHaveBeenCalled();
  handleError(error, {});
  const notice = vi.mocked(message.error).mock.calls[0][0] as {
    onClose: () => void;
  };
  notice.onClose();
  expect(mocks.replace).toHaveBeenCalledTimes(1);
});
it('HTTP200中的已知鉴权失效业务码也触发刷新重放', async () => {
  mocks.refresh.mockImplementation(async () => {
    setStoredAccessToken('new-access');
    return 'new-access';
  });
  await interceptors[0]({
    config,
    data: { success: false, code: '0x000-00011' },
  });
  expect(mocks.refresh).toHaveBeenCalledTimes(1);
  expect(mocks.replay).toHaveBeenCalledWith(
    { ...config, _retryAuth: true },
    'new-access',
  );
});
it('业务失效刷新再确认401后保留错误语义，不追加通用错误提示', async () => {
  const expired = { response: { status: 401 } };
  mocks.refresh.mockRejectedValue(expired);
  const error = await interceptors[0]({
    config,
    data: { success: false, code: '0x000-00011' },
  }).catch((failure: unknown) => failure);
  expect(error).toBe(expired);
  handleError(error, {});
  const notice = vi.mocked(message.error).mock.calls[0][0] as {
    onClose: () => void;
  };
  notice.onClose();
  expect(message.error).toHaveBeenCalledTimes(1);
  expect(mocks.replace).toHaveBeenCalledTimes(1);
});
it.each(['http', 'business', 'replay'])(
  '旧%s失效响应不能清除新会话或用新会话重放旧请求',
  async (kind) => {
    const oldConfig = {
      ...config,
      headers: { Authorization: 'Bearer old-access' },
      _retryAuth: kind === 'replay',
    };
    const request =
      kind === 'business'
        ? interceptors[0]({
            config: oldConfig,
            data: { success: false, code: '0x000-00011' },
          })
        : interceptors[1]({ config: oldConfig, response: { status: 401 } });
    await expect(request).rejects.toThrow('登录状态已变更');
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.replay).not.toHaveBeenCalled();
    expect(getStoredAccessToken()).toBe('test-access');
    expect(message.error).not.toHaveBeenCalled();
  },
);
it('刷新写入后、重放前退出，不再注入旧token发请求', async () => {
  mocks.refresh.mockImplementation(async () => {
    setStoredAccessToken('next-access');
    clearAuthState();
    return 'next-access';
  });
  await expect(interceptors[1](unauthorized)).rejects.toThrow('登录状态已变更');
  expect(mocks.replay).not.toHaveBeenCalled();
  expect(getStoredAccessToken()).toBe('');
});
