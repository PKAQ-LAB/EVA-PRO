import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import { queryErrorLogs } from './service';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({ request: mocks.request }));
beforeEach(() => vi.clearAllMocks());

it('真实PageVo records解包为数组和total，分页日期经真实http序列化按后台参数发送', async () => {
  const response = {
    success: true,
    data: {
      records: [{ id: 'error-a', exDesc: '示例异常' }],
      total: '41',
      current: '2',
      size: '5',
    },
  };
  mocks.request.mockResolvedValue(response);
  const result = await queryErrorLogs({
    begin: '2026-10-11',
    end: '2026-10-18',
    current: 2,
    pageSize: 5,
  });
  const url = new URL(mocks.request.mock.calls[0][0], 'http://localhost');
  expect(url.pathname).toBe(APIS.ERROR_LIST);
  expect(Object.fromEntries(url.searchParams)).toEqual({
    begin: '2026-10-11',
    end: '2026-10-18',
    pageNo: '2',
    pageCount: '5',
  });
  expect(result).toEqual({
    success: true,
    data: response.data.records,
    total: 41,
  });
  expect(response.data).toHaveProperty('records');
});

it.each([undefined, [], { records: [], total: 0 }])(
  '空数据%s归一为空数组，不丢失败状态',
  async (data) => {
    mocks.request.mockResolvedValue({ success: false, data });
    expect(await queryErrorLogs({})).toEqual({
      success: false,
      data: [],
      total: 0,
    });
  },
);
