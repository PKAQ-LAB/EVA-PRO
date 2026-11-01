import { beforeEach, expect, it, vi } from 'vitest';
import { fetchDict } from './user';
import { DictionaryIntegrityError } from '@/utils/dictionaryState';
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));
const etag = `W/"dict-v1-${'a'.repeat(64)}"`;
beforeEach(() => {
  mocks.request.mockReset();
});
it('首次200读取原生success/map与etag，窄请求仅接受200/304', async () => {
  mocks.request.mockResolvedValue({
    status: 200,
    headers: { etag },
    data: { success: true, data: { TYPE: { a: '值' } } },
  });
  await expect(fetchDict()).resolves.toEqual({
    kind: 'updated',
    data: { TYPE: { a: '值' } },
    etag,
  });
  const options = mocks.request.mock.calls[0][1];
  expect(options.getResponse).toBe(true);
  expect(options.skipErrorHandler).toBe(true);
  expect(options.headers).not.toHaveProperty('If-None-Match');
  expect(options.validateStatus(304)).toBe(true);
  expect(options.validateStatus(500)).toBe(false);
});
it('空体304不按JSON解析，保留条件请求和响应etag', async () => {
  mocks.request.mockResolvedValue({ status: 304, headers: { etag }, data: '' });
  await expect(fetchDict(undefined, etag)).resolves.toEqual({
    kind: 'unchanged',
    etag,
  });
  expect(mocks.request.mock.calls[0][1].headers).toEqual({
    'If-None-Match': etag,
  });
});
it.each([
  { success: false, data: {} },
  { success: true, data: { TYPE: { a: 3 } } },
  { data: { TYPE: { a: '值' } } },
])('结构错误%s拒绝原子采纳', async (data) => {
  mocks.request.mockResolvedValue({ status: 200, headers: { etag }, data });
  await expect(fetchDict()).rejects.toBeInstanceOf(DictionaryIntegrityError);
});
it('仅指定冲突机器码归来源错误，普通500与其它409保持可辨识原异常', async () => {
  const source = { response: { status: 409, data: { code: '0x0000-10002' } } };
  mocks.request.mockRejectedValueOnce(source);
  await expect(fetchDict()).rejects.toBeInstanceOf(DictionaryIntegrityError);
  const server = { response: { status: 500 } };
  mocks.request.mockRejectedValueOnce(server);
  await expect(fetchDict()).rejects.toBe(server);
  const other = { response: { status: 409, data: { code: 'other' } } };
  mocks.request.mockRejectedValueOnce(other);
  await expect(fetchDict()).rejects.toBe(other);
});
it.each([401, 403])('鉴权%d清可用字典的错误分类', async (status) => {
  mocks.request.mockRejectedValue({ response: { status } });
  await expect(fetchDict()).rejects.toBeInstanceOf(DictionaryIntegrityError);
});

it('HTTP200的鉴权失败业务码和原生false包装不可退成stale成功', async () => {
  for (const code of ['0x000-00003', '0x000-00006', '0x000-00024', 'unknown']) {
    mocks.request.mockRejectedValueOnce(
      Object.assign(new Error('failed'), {
        name: 'BizError',
        info: { success: false, code },
      }),
    );
    await expect(fetchDict()).rejects.toBeInstanceOf(DictionaryIntegrityError);
  }
});

it.each([undefined, { status: 200, data: { success: true, data: {} } }])(
  'HTTP200响应或header无效时清快照而非网络fallback：%s',
  async (response) => {
    mocks.request.mockResolvedValue(response);
    await expect(fetchDict()).rejects.toBeInstanceOf(DictionaryIntegrityError);
  },
);
