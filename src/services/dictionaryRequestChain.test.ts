import type { AxiosRequestConfig } from '@@/plugin-request/request';
import { expect, it, vi } from 'vitest';
import { errorConfig } from '@/requestErrorConfig';
import { DictionaryIntegrityError } from '@/utils/dictionaryState';
import { fetchDict } from './user';

const mocks = vi.hoisted(() => ({ config: {} as Record<string, unknown> }));
vi.mock('umi', () => ({ ApplyPluginsType: { modify: 'modify' } }));
vi.mock('@@/core/plugin', () => ({
  getPluginManager: () => ({ applyPlugins: () => mocks.config }),
}));
vi.mock('@umijs/max', async () => {
  const generated = await import('@@/plugin-request/request');
  return {
    request: generated.request,
    history: { location: { pathname: '/sys/role', search: '', hash: '' } },
    getIntl: () => ({
      formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
        defaultMessage,
    }),
  };
});

it('实际生成request及项目拦截器经本地axios adapter处理原生200与空304', async () => {
  const etag = `W/"dict-v1-${'a'.repeat(64)}"`;
  if (!errorConfig.errorConfig?.errorThrower)
    throw new Error('项目错误链不存在');
  const thrower = vi.fn(errorConfig.errorConfig.errorThrower);
  const calls: AxiosRequestConfig[] = [];
  let phase: 200 | 304 | 'failure' = 200;
  mocks.config = {
    ...errorConfig,
    errorConfig: { ...errorConfig.errorConfig, errorThrower: thrower },
    adapter: async (config: AxiosRequestConfig) => {
      calls.push(config);
      const status = phase === 304 ? 304 : 200;
      if (!config.validateStatus?.(status))
        throw new Error('窄适配未接受正确状态');
      return {
        status,
        statusText: status === 304 ? 'Not Modified' : 'OK',
        headers: { etag },
        config,
        data:
          phase === 304
            ? ''
            : JSON.stringify(
                phase === 'failure'
                  ? {
                      success: false,
                      code: '0x0000-10002',
                      message: '字典快照来源或结构不可用',
                    }
                  : { success: true, data: { TYPE: { a: '标签' } } },
              ),
      };
    },
  };
  await expect(fetchDict()).resolves.toEqual({
    kind: 'updated',
    data: { TYPE: { a: '标签' } },
    etag,
  });
  expect(calls).toHaveLength(1);
  expect(calls[0].url).toBe('/api/auth/fetchDicts');
  expect(calls[0].headers).not.toHaveProperty('If-None-Match');
  expect(thrower).not.toHaveBeenCalled();
  phase = 304;
  await expect(fetchDict(undefined, etag)).resolves.toEqual({
    kind: 'unchanged',
    etag,
  });
  expect(calls).toHaveLength(2);
  expect(calls[1].headers).toHaveProperty('If-None-Match', etag);
  expect(thrower).not.toHaveBeenCalled();
  phase = 'failure';
  await expect(fetchDict()).rejects.toBeInstanceOf(DictionaryIntegrityError);
  expect(thrower).toHaveBeenCalledTimes(1);
});
