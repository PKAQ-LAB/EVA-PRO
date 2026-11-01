import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  beginDictionarySession,
  DictionaryIntegrityError,
  type DictionaryState,
  dictionaryFields,
  dictionaryGeneration,
} from '@/utils/dictionaryState';
import DictionarySync from './index';

const mocks = vi.hoisted(() => ({
  state: {} as DictionaryState & { fetchDict?: () => Promise<unknown> },
  set: vi.fn(),
  load: vi.fn(),
  token: 'token',
  redirect: vi.fn(),
}));
vi.mock('@umijs/max', () => ({
  useModel: () => ({ initialState: mocks.state, setInitialState: mocks.set }),
}));
vi.mock('@/services/user', () => ({ fetchDict: mocks.load }));
vi.mock('@/utils/authState', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/authState')>();
  return {
    ...actual,
    getStoredAccessToken: () => mocks.token,
    redirectToLogin: mocks.redirect,
  };
});
const etag = `W/"dict-v1-${'a'.repeat(64)}"`;
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mocks.token = 'token';
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  const user = { id: '1', tenantId: '0' };
  mocks.state = {
    currentUser: user,
    ...dictionaryFields(user, beginDictionarySession(), {
      kind: 'updated',
      data: { TYPE: { a: '旧' } },
      etag,
    }),
  };
  mocks.set.mockImplementation(
    (updater: (state: typeof mocks.state) => typeof mocks.state) => {
      mocks.state = updater(mocks.state);
    },
  );
  mocks.load.mockResolvedValue({ kind: 'unchanged', etag });
  mocks.redirect.mockImplementation(() => {
    mocks.token = '';
    beginDictionarySession();
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('运行时最终鉴权失效沿原退出入口清代次及快照', async () => {
  render(<DictionarySync />);
  const epoch = dictionaryGeneration();
  mocks.load.mockRejectedValueOnce(
    Object.assign(new DictionaryIntegrityError('expired'), {
      response: { status: 401 },
    }),
  );
  await act(async () => {
    await mocks.state.fetchDict?.();
  });
  expect(mocks.redirect).toHaveBeenCalledTimes(1);
  expect(dictionaryGeneration()).toBeGreaterThan(epoch);
  expect(mocks.state.dict).toBeUndefined();
  expect(mocks.state.dictEtag).toBeUndefined();
});

it.each([403, 409])('运行时普通%d不按登录失效退出', async (status) => {
  render(<DictionarySync />);
  mocks.load.mockRejectedValueOnce(
    Object.assign(new DictionaryIntegrityError('unavailable'), {
      response: { status },
    }),
  );
  await act(async () => {
    await mocks.state.fetchDict?.();
  });
  expect(mocks.redirect).not.toHaveBeenCalled();
  expect(mocks.state.dict).toBeUndefined();
});

it('运行时旧身份迟到401不能退出新身份', async () => {
  const view = render(<DictionarySync />);
  let reject: (error: unknown) => void = () => {};
  mocks.load.mockImplementationOnce(
    () =>
      new Promise((_resolve, fail) => {
        reject = fail;
      }),
  );
  let old: Promise<unknown> | undefined;
  act(() => {
    old = mocks.state.fetchDict?.();
  });
  mocks.state = { ...mocks.state, currentUser: { id: 'new', tenantId: '0' } };
  view.rerender(<DictionarySync />);
  await act(async () => {
    reject(
      Object.assign(new DictionaryIntegrityError('expired'), {
        response: { status: 401 },
      }),
    );
    await old;
  });
  expect(mocks.redirect).not.toHaveBeenCalled();
  expect(mocks.state.currentUser).toEqual({ id: 'new', tenantId: '0' });
});
it('已有bootstrap不重复全量，visible在线60秒条件校验，focus/online10秒合并', async () => {
  const view = render(<DictionarySync />);
  expect(mocks.load).not.toHaveBeenCalled();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60000);
  });
  expect(mocks.load).toHaveBeenCalledTimes(1);
  expect(mocks.load.mock.calls[0][1]).toBe(etag);
  await act(async () => {
    fireEvent.focus(window);
    fireEvent.online(window);
  });
  expect(mocks.load).toHaveBeenCalledTimes(2);
  await act(async () => {
    fireEvent.focus(window);
  });
  expect(mocks.load).toHaveBeenCalledTimes(2);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
    fireEvent.online(window);
  });
  expect(mocks.load).toHaveBeenCalledTimes(3);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.focus(window);
  expect(mocks.load).toHaveBeenCalledTimes(3);
});
it('隐藏或离线时不轮询，普通token续期不清字典或重建身份', async () => {
  render(<DictionarySync />);
  const snapshot = mocks.state.dict;
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60000);
  });
  expect(mocks.load).not.toHaveBeenCalled();
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60000);
  });
  expect(mocks.load).not.toHaveBeenCalled();
  mocks.token = 'renewed';
  expect(mocks.state.dict).toBe(snapshot);
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  await act(async () => {
    fireEvent.online(window);
  });
  expect(mocks.load.mock.calls[0][1]).toBe(etag);
});
it('换tenant立即清snapshotetag，下一初始化全量；退出代次清理', async () => {
  const view = render(<DictionarySync />);
  mocks.state = { ...mocks.state, currentUser: { id: '1', tenantId: '2' } };
  mocks.load.mockResolvedValue({
    kind: 'updated',
    data: { TYPE: { a: '新' } },
    etag,
  });
  view.rerender(<DictionarySync />);
  expect(mocks.state.dict).toBeUndefined();
  expect(mocks.state.dictEtag).toBeUndefined();
  await act(async () => {
    view.rerender(<DictionarySync />);
  });
  expect(mocks.load.mock.calls[0][1]).toBeUndefined();
  expect(mocks.state.dict).toEqual({ TYPE: { a: '新' } });
  act(() => {
    mocks.token = '';
    beginDictionarySession();
  });
  expect(mocks.state.dict).toBeUndefined();
  expect(mocks.state.dictEtag).toBeUndefined();
});
