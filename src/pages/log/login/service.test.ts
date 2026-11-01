import { request } from '@umijs/max';
import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import { getLoginLog, queryLoginLogs } from './service';

vi.mock('@umijs/max', () => ({ request: vi.fn() }));
beforeEach(() => {
  vi.clearAllMocks();
});
it('现有IPage解包，false和LocalDateTime原样传递，无新增参数/endpoint', async () => {
  vi.mocked(request).mockResolvedValue({
    success: true,
    data: { records: [{ id: '2115792898971795458' }], total: '41' },
  });
  const result = await queryLoginLogs({
    current: 2,
    pageSize: 20,
    account: 'fixture',
    success: false,
    begin: '2026-10-29T10:11:12',
    end: '2026-10-29T10:12:13',
  });
  const url = new URL(vi.mocked(request).mock.calls[0][0], 'http://localhost');
  expect(url.pathname).toBe(APIS.LOGINLOG_LIST);
  expect(Object.fromEntries(url.searchParams)).toEqual({
    pageNo: '2',
    pageSize: '20',
    account: 'fixture',
    success: 'false',
    begin: '2026-10-29T10:11:12',
    end: '2026-10-29T10:12:13',
  });
  expect(result).toMatchObject({
    total: 41,
    data: [{ id: '2115792898971795458' }],
  });
  await getLoginLog('2115792898971795458');
  expect(request).toHaveBeenLastCalledWith(
    `${APIS.LOGINLOG_GET}/2115792898971795458`,
  );
});
