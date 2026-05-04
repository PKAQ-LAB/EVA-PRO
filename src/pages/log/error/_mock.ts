import type { Request, Response } from 'express';

const now = Date.now();
const sample = Array.from({ length: 14 }).map((_, i) => ({
  id: `err-${i + 1}`,
  className: `top.pkaq.eva.${
    ['account', 'order', 'auth', 'log'][i % 4]
  }.Service`,
  exDesc: [
    'NullPointerException at line 42',
    'IllegalArgumentException: id 不能为空',
    'TimeoutException: 等待数据库连接超时',
    'BizException: 校验失败',
  ][i % 4],
  ip: `192.168.1.${10 + i}`,
  method: ['list', 'edit', 'del', 'get'][i % 4],
  params: JSON.stringify({ id: `entity-${i + 1}` }),
  requestTime: new Date(now - i * 45 * 60_000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19),
  spendTime: `${(50 + i * 7) % 800} ms`,
}));

const filterByDate = (begin?: string, end?: string) => {
  if (!begin && !end) return sample;
  const beginTs = begin ? Date.parse(begin) : -Infinity;
  const endTs = end ? Date.parse(end) + 24 * 60 * 60_000 : Infinity;
  return sample.filter((row) => {
    const ts = Date.parse(row.requestTime.replace(' ', 'T'));
    return ts >= beginTs && ts <= endTs;
  });
};

export default {
  'GET /api/monitor/log/error/list': (req: Request, res: Response) => {
    const data = filterByDate(
      req.query.begin as string | undefined,
      req.query.end as string | undefined,
    );
    res.send({ success: true, data, total: data.length });
  },
  'GET /api/monitor/log/error/get/:id': (req: Request, res: Response) => {
    const item = sample.find((r) => r.id === req.params.id);
    if (!item) {
      res.send({ success: false, message: '记录不存在' });
      return;
    }
    res.send({ success: true, data: item });
  },
};
