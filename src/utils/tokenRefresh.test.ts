import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  clearAuthState,
  getStoredAccessToken,
  getStoredRefreshToken,
  isAuthExpiredError,
  setStoredAccessToken,
  setStoredRefreshToken,
} from './authState';
import { refreshAccessToken } from './tokenRefresh';

vi.mock('@umijs/max', () => ({
  history: {
    location: { pathname: '/', search: '', hash: '' },
    replace: vi.fn(),
  },
}));
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  clearAuthState();
  setStoredAccessToken('test-access');
  setStoredRefreshToken('test-refresh');
});
afterEach(() => vi.unstubAllGlobals());

it('并发刷新共享实际fetch且同步更新既有cookie/session存储', async () => {
  let finish: (response: Response) => void = () => {};
  vi.mocked(fetch).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const first = refreshAccessToken(),
    second = refreshAccessToken();
  expect(fetch).toHaveBeenCalledTimes(1);
  finish(
    new Response(
      JSON.stringify({
        success: true,
        data: { accessToken: 'next-access', refreshToken: 'next-refresh' },
      }),
      { status: 200 },
    ),
  );
  expect(await Promise.all([first, second])).toEqual([
    'next-access',
    'next-access',
  ]);
  expect(getStoredAccessToken()).toBe('next-access');
  expect(getStoredRefreshToken()).toBe('next-refresh');
});
it.each([401, 403, 500])(
  '刷新HTTP%s即使非JSON也保留真实状态，只有401确认为鉴权失效',
  async (status) => {
    vi.mocked(fetch).mockResolvedValue(new Response('not-json', { status }));
    const error = await refreshAccessToken().catch(
      (failure: unknown) => failure,
    );
    expect(isAuthExpiredError(error)).toBe(status === 401);
    expect(getStoredAccessToken()).toBe('test-access');
  },
);
it('已知业务失效码会被识别，未知业务失败和缺token不臆定失效', async () => {
  for (const code of ['0x000-00011', 'unknown']) {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false, code }), { status: 200 }),
    );
    const error = await refreshAccessToken().catch(
      (failure: unknown) => failure,
    );
    expect(isAuthExpiredError(error)).toBe(code === '0x000-00011');
  }
  vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));
  expect(
    isAuthExpiredError(
      await refreshAccessToken().catch((error: unknown) => error),
    ),
  ).toBe(false);
});
it.each([200, 401, 403, 500])(
  '刷新HTTP%s面对不可信JSON形态仍保留状态，不抛TypeError',
  async (status) => {
    for (const body of [
      null,
      [],
      true,
      17,
      'unexpected',
      {},
      { data: null },
      { data: [] },
      { data: { accessToken: {} } },
      { access_token: 44 },
      { message: { toString: null } },
    ]) {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(body), { status }),
      );
      const error = await refreshAccessToken().catch(
        (failure: unknown) => failure,
      );
      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error).toHaveProperty('response.status', status);
      expect(isAuthExpiredError(error)).toBe(status === 401);
      expect(getStoredAccessToken()).toBe('test-access');
    }
  },
);
it('缺刷新凭据不发送请求、不无限重试', async () => {
  clearAuthState();
  const error = await refreshAccessToken().catch((failure: unknown) => failure);
  expect(isAuthExpiredError(error)).toBe(true);
  expect(fetch).not.toHaveBeenCalled();
});
it('403/5xx不被响应体中的鉴权码覆盖成401', () => {
  for (const status of [403, 500, 503]) {
    expect(
      isAuthExpiredError({
        response: { status, data: { code: '0x000-00011' } },
      }),
    ).toBe(false);
  }
});
it.each([
  ['logout', 200],
  ['new-login', 200],
  ['logout', 401],
  ['new-login', 401],
] as const)(
  '刷新等待期间%s，迟到%s响应不能恢复或清除当前登录态',
  async (scenario, status) => {
    let finish: (response: Response) => void = () => {};
    vi.mocked(fetch).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const pending = refreshAccessToken();
    clearAuthState();
    if (scenario === 'new-login') {
      setStoredAccessToken('other-access');
      setStoredRefreshToken('other-refresh');
    }
    finish(
      new Response(
        JSON.stringify({
          data: { accessToken: 'late-access', refreshToken: 'late-refresh' },
        }),
        { status },
      ),
    );
    await expect(pending).rejects.toThrow('登录状态已变更');
    expect(getStoredAccessToken()).toBe(
      scenario === 'logout' ? '' : 'other-access',
    );
    expect(getStoredRefreshToken()).toBe(
      scenario === 'logout' ? '' : 'other-refresh',
    );
  },
);
