import { request } from '@umijs/max';
import { expect, it, vi } from 'vitest';
import APIS from '@/apis';
import { deleteDict, editDict, getDict, queryDicts } from './service';

const mocks = vi.hoisted(() => ({
  request:
    vi.fn<
      (
        url: string,
        options?: { method?: string; data?: unknown },
      ) => Promise<unknown>
    >(),
}));
vi.mock('@umijs/max', () => ({ request: mocks.request }));
it('list保平数组/真bool/remark；get同ID两分类携原query，写白名单不夹能力或虚根', async () => {
  vi.mocked(request).mockResolvedValue({
    success: true,
    businessWritable: false,
    data: [{ id: '7', category: 'SYSTEM', readOnly: true, remark: '真实备注' }],
  });
  expect(await queryDicts()).toMatchObject({
    businessWritable: false,
    data: [{ category: 'SYSTEM', readOnly: true, remark: '真实备注' }],
  });
  vi.mocked(request).mockResolvedValue({
    success: true,
    data: { id: '7', category: 'BUSINESS', readOnly: false },
  });
  await getDict('7', 'SYSTEM');
  expect(request).toHaveBeenLastCalledWith(
    `${APIS.DICT_GET}/7?category=SYSTEM`,
  );
  await getDict('7', 'BUSINESS');
  expect(request).toHaveBeenLastCalledWith(
    `${APIS.DICT_GET}/7?category=BUSINESS`,
  );
  await getDict('7');
  expect(request).toHaveBeenLastCalledWith(`${APIS.DICT_GET}/7`);
  await editDict({
    id: '7',
    category: 'BUSINESS',
    readOnly: false,
    code: 'B',
    remark: '原备注',
    status: '0001',
  });
  const body = mocks.request.mock.calls.at(-1)?.[1]?.data;
  expect(body).toMatchObject({
    category: 'BUSINESS',
    frozen: 1,
    remark: '原备注',
  });
  expect(body).not.toHaveProperty('readOnly');
  expect(body).not.toHaveProperty('businessWritable');
  await editDict({ category: 'BUSINESS', code: 'NEW', name: '新增' });
  expect(mocks.request.mock.calls.at(-1)?.[1]?.data).not.toHaveProperty(
    'category',
  );
  await deleteDict('7');
  expect(request).toHaveBeenLastCalledWith(`${APIS.DICT_DEL}/7`);
});
