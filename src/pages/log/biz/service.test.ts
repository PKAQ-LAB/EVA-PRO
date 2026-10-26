import { expect, it, vi } from 'vitest';
import APIS from '@/apis';
import { queryBizLogs } from './service';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));

it('业务日志PageVo解包，并按LogQueryBo发送pageNo/pageSize和原查询条件', async () => {
  const data = {
    records: [{ id: 'biz-a', description: '示例操作' }],
    total: '41',
    current: '2',
    size: '5',
  };
  mocks.request.mockResolvedValue({ success: true, data });
  const result = await queryBizLogs({
    current: 2,
    pageSize: 5,
    begin: '2026-10-12',
    end: '2026-10-19',
    operator: 'test-operator',
  });
  const url = new URL(mocks.request.mock.calls[0][0], 'http://localhost');
  expect(url.pathname).toBe(APIS.BIZLOG_LIST);
  expect(Object.fromEntries(url.searchParams)).toEqual({
    pageNo: '2',
    pageSize: '5',
    begin: '2026-10-12',
    end: '2026-10-19',
    operator: 'test-operator',
  });
  expect(result).toEqual({ success: true, data: data.records, total: 41 });
  expect(data.records).toHaveLength(1);
});

it('空分页仍为数组，后端失败不伪装成功', async () => {
  mocks.request.mockResolvedValue({
    success: false,
    data: { records: [], total: '0' },
  });
  expect(await queryBizLogs({})).toEqual({
    success: false,
    data: [],
    total: 0,
  });
});
