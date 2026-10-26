import { message } from 'antd';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { errorConfig } from './requestErrorConfig';
import * as authState from './utils/authState';

vi.mock('@umijs/max', () => ({
  history: { location: { pathname: '/sys/role', search: '', hash: '' } },
  getIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
  request: vi.fn(),
}));
vi.mock('antd', async (original) => {
  const actual = await original<typeof import('antd')>();
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});

const interceptors = errorConfig.responseInterceptors?.[0] as [
  (response: unknown) => Promise<unknown>,
  (error: unknown) => Promise<unknown>,
];
const handleError = errorConfig.errorConfig?.errorHandler as (
  error: unknown,
  options: object,
) => void;
const unauthorized = {
  config: { url: '/api/auth/fetchMenus', method: 'GET' },
  response: { status: 401 },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  vi.spyOn(window.location, 'replace').mockImplementation(() => {});
  authState.setStoredAccessToken('pipeline-old-access');
  authState.setStoredRefreshToken('pipeline-old-refresh');
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each(['new-login', 'refresh-only', 'logout'])(
  '真实刷新内层检查后发生%s，拒绝传播至统一错误处理也不能清新会话',
  async (scenario) => {
    const readAccess = authState.getStoredAccessToken;
    let armed = false;
    vi.spyOn(authState, 'getStoredAccessToken').mockImplementation(() => {
      const value = readAccess();
      if (armed) {
        armed = false;
        // 精确覆盖内层快照检查与外层 catch 之间的 Promise 微任务窗口。
        queueMicrotask(() => {
          if (scenario === 'logout') {
            authState.clearAuthState();
          } else {
            if (scenario === 'new-login') {
              authState.setStoredAccessToken('pipeline-new-access');
            }
            authState.setStoredRefreshToken('pipeline-new-refresh');
          }
        });
      }
      return value;
    });
    const response = new Response('{"success":false}', { status: 401 });
    const parseJson = response.json.bind(response);
    vi.spyOn(response, 'json').mockImplementation(async () => {
      const body = await parseJson();
      armed = true;
      return body;
    });
    vi.mocked(fetch).mockResolvedValue(response);

    const error = await interceptors[1](unauthorized).catch(
      (failure: unknown) => failure,
    );
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', '登录状态已变更');
    expect(authState.isAuthExpiredError(error)).toBe(false);
    handleError(error, {});
    expect(authState.getStoredAccessToken()).toBe(
      scenario === 'logout'
        ? ''
        : scenario === 'new-login'
          ? 'pipeline-new-access'
          : 'pipeline-old-access',
    );
    expect(authState.getStoredRefreshToken()).toBe(
      scenario === 'logout' ? '' : 'pipeline-new-refresh',
    );
    expect(window.location.replace).not.toHaveBeenCalled();
    expect(
      vi
        .mocked(message.error)
        .mock.calls.every(([notice]) => typeof notice === 'string'),
    ).toBe(true);
  },
);

it('真实刷新返回401 JSON null时，统一错误处理只通知和跳转一次', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response('null', { status: 401 }));
  const error = await interceptors[1](unauthorized).catch(
    (failure: unknown) => failure,
  );
  expect(error).toHaveProperty('response.status', 401);
  expect(authState.isAuthExpiredError(error)).toBe(true);
  handleError(error, {});
  expect(message.error).toHaveBeenCalledTimes(1);
  const notice = vi.mocked(message.error).mock.calls[0][0] as {
    onClose: () => void;
  };
  notice.onClose();
  expect(window.location.replace).toHaveBeenCalledTimes(1);
  expect(authState.getStoredAccessToken()).toBe('');
});
