import type { Request, Response } from 'express';

interface DictLine {
  id: string;
  keyName: string;
  keyValue: string;
  orders: number;
}

interface DictRow {
  id: string;
  code: string;
  name: string;
  remark?: string;
  status?: string;
  lines?: DictLine[];
}

const dicts: DictRow[] = [
  {
    id: 'd-status',
    code: 'order_status',
    name: '订单状态',
    remark: '订单流转状态',
    lines: [
      { id: 'l1', keyName: '0', keyValue: '待支付', orders: 1 },
      { id: 'l2', keyName: '1', keyValue: '已支付', orders: 2 },
      { id: 'l3', keyName: '2', keyValue: '已发货', orders: 3 },
      { id: 'l4', keyName: '9', keyValue: '已取消', orders: 9 },
    ],
  },
  {
    id: 'd-channel',
    code: 'order_channel',
    name: '下单渠道',
    lines: [
      { id: 'l1', keyName: 'web', keyValue: 'PC', orders: 1 },
      { id: 'l2', keyName: 'app', keyValue: 'APP', orders: 2 },
    ],
  },
  {
    id: 'd-locked',
    code: 'FROZEN_STATUS',
    name: '锁定状态',
    lines: [
      { id: 'l1', keyName: '0', keyValue: '正常', orders: 1 },
      { id: 'l2', keyName: '1', keyValue: '已锁定', orders: 2 },
      { id: 'l3', keyName: '9999', keyValue: '只读', orders: 3 },
    ],
  },
];

export default {
  'GET /api/sys/dictionary/list': (_req: Request, res: Response) => {
    res.send({ success: true, data: dicts });
  },
  'GET /api/sys/dictionary/get/:id': (req: Request, res: Response) => {
    const item = dicts.find((n) => n.id === req.params.id);
    if (!item) {
      res.send({ success: false, message: '记录不存在' });
      return;
    }
    res.send({ success: true, data: item });
  },
  'POST /api/sys/dictionary/edit': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'GET /api/sys/dictionary/del/:id': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
};
