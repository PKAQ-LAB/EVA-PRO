import type { Request, Response } from 'express';

const now = Date.now();
const sample = Array.from({ length: 18 }).map((_, i) => ({
  id: `biz-${i + 1}`,
  operateDatetime: new Date(now - i * 30 * 60_000).toISOString(),
  operateType: ['新增', '编辑', '删除', '查询'][i % 4],
  operator: ['admin', 'pkaq', 'designer'][i % 3],
  description: `示例业务日志 ${i + 1}：${
    ['触发流程审批', '修改用户信息', '删除组织', '查询订单'][i % 4]
  }`,
}));

const filterByDate = (begin?: string, end?: string) => {
  if (!begin && !end) return sample;
  const beginTs = begin ? Date.parse(begin) : -Infinity;
  const endTs = end ? Date.parse(end) + 24 * 60 * 60_000 : Infinity;
  return sample.filter((row) => {
    const ts = Date.parse(row.operateDatetime);
    return ts >= beginTs && ts <= endTs;
  });
};

export default {
  'GET /api/monitor/log/biz/list': (req: Request, res: Response) => {
    const data = filterByDate(
      req.query.begin as string | undefined,
      req.query.end as string | undefined,
    );
    res.send({ success: true, data, total: data.length });
  },
  'GET /api/monitor/log/biz/get/:id': (req: Request, res: Response) => {
    const item = sample.find((r) => r.id === req.params.id);
    if (!item) {
      res.send({ success: false, message: '记录不存在' });
      return;
    }
    res.send({ success: true, data: item });
  },
};
