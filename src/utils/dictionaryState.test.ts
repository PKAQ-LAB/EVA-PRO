import { expect, it, vi } from 'vitest';
import {
  beginDictionarySession,
  createDictionarySync,
  DictionaryIntegrityError,
  type DictionaryResult,
  type DictionaryState,
  dictionaryFields,
  dictionaryGeneration,
  ownedDictionary,
} from './dictionaryState';

const tag = (letter: string) => `W/"dict-v1-${letter.repeat(64)}"`;
const updated = (label = '原'): DictionaryResult => ({
  kind: 'updated',
  data: { TYPE: { a: label } },
  etag: tag('a'),
});
function harness() {
  const user = { id: '1', tenantId: '0' };
  const epoch = beginDictionarySession();
  let state: DictionaryState = {
    currentUser: user,
    ...dictionaryFields(user, epoch, updated()),
  };
  const load = vi.fn<(etag?: string) => Promise<DictionaryResult>>();
  const sync = createDictionarySync({
    current: () => epoch === dictionaryGeneration(),
    read: () => state,
    update: (change) => {
      state = { ...state, ...change };
    },
    load,
  });
  return {
    load,
    sync,
    read: () => state,
    change: (value: DictionaryState) => {
      state = value;
    },
  };
}
it('条件304复用同身份快照，200完整原子替换删除旧code', async () => {
  const h = harness();
  const first = h.read().dict;
  h.load.mockResolvedValueOnce({ kind: 'unchanged', etag: tag('a') });
  await h.sync.synchronize();
  expect(h.read().dict).toBe(first);
  expect(h.load.mock.calls[0][0]).toBe(tag('a'));
  h.load.mockResolvedValueOnce({
    kind: 'updated',
    data: { NEW: { b: '新' } },
    etag: tag('b'),
  });
  await h.sync.synchronize();
  expect(h.read().dict).toEqual({ NEW: { b: '新' } });
  expect(h.read().dictEtag).toBe(tag('b'));
});
it('一在途合并，写后遇旧在途必须结束再补一次', async () => {
  const h = harness();
  let finish: (value: DictionaryResult) => void = () => {};
  h.load
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce(updated('写后'));
  const first = h.sync.synchronize();
  const second = h.sync.synchronize();
  const written = h.sync.synchronize(true);
  expect(first).toBe(second);
  expect(first).toBe(written);
  expect(h.load).toHaveBeenCalledTimes(1);
  finish(updated('旧'));
  await written;
  expect(h.load).toHaveBeenCalledTimes(2);
  expect(h.read().dict).toEqual({ TYPE: { a: '写后' } });
});
it('网络5xx保原快照标stale，来源冲突清map与etag并可重试全量', async () => {
  const h = harness();
  const first = h.read().dict;
  h.load.mockRejectedValueOnce(new Error('network'));
  await h.sync.synchronize();
  expect(h.read().dict).toBe(first);
  expect(h.read().dictStatus).toBe('stale');
  h.load.mockRejectedValueOnce(new DictionaryIntegrityError('conflict'));
  await h.sync.synchronize();
  expect(h.read().dict).toBeUndefined();
  expect(h.read().dictEtag).toBeUndefined();
  h.load.mockResolvedValueOnce(updated());
  await h.sync.synchronize();
  expect(h.load.mock.calls.at(-1)?.[0]).toBeUndefined();
  expect(h.read().dictStatus).toBe('ready');
});
it('空snapshot不送条件头，收到304不能伪成功', async () => {
  const h = harness();
  h.change({});
  h.load.mockResolvedValue({ kind: 'unchanged', etag: tag('a') });
  await h.sync.synchronize();
  expect(h.load.mock.calls[0][0]).toBeUndefined();
  expect(h.read().dictStatus).toBe('error');
});
it('同uid重登与tenant切换均不复用旧map，迟到结果不写回', async () => {
  const h = harness();
  let finish: (value: DictionaryResult) => void = () => {};
  h.load.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const old = h.sync.synchronize();
  beginDictionarySession();
  expect(ownedDictionary(h.read())).toBeUndefined();
  h.change({ currentUser: { id: '1', tenantId: '2' } });
  finish(updated('旧主体'));
  await old;
  expect(h.read().dict).toBeUndefined();
});
it('退出dispose取消信号，旧回调不恢复快照', async () => {
  const h = harness();
  let finish: (value: DictionaryResult) => void = () => {};
  h.load.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const old = h.sync.synchronize();
  h.sync.dispose();
  h.change({});
  finish(updated());
  await old;
  expect(h.read()).toEqual({});
  await h.sync.synchronize();
  expect(h.load).toHaveBeenCalledTimes(1);
});
