import type { Request, Response } from 'express';

interface DictLine {
  id: string;
  keyName: string;
  keyValue: string;
  orders: number;
}

interface DictRow {
  id: string;
  parentId: string;
  code: string;
  name: string;
  remark?: string;
  status?: string;
  parent?: boolean;
  lines?: DictLine[];
  children?: DictRow[];
}

const tree: DictRow[] = [
  {
    id: 'root-1',
    parentId: '0',
    code: 'BIZ',
    name: '业务字典',
    parent: true,
    children: [
      {
        id: 'd-status',
        parentId: 'root-1',
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
        parentId: 'root-1',
        code: 'order_channel',
        name: '下单渠道',
        lines: [
          { id: 'l1', keyName: 'web', keyValue: 'PC', orders: 1 },
          { id: 'l2', keyName: 'app', keyValue: 'APP', orders: 2 },
        ],
      },
    ],
  },
  {
    id: 'root-2',
    parentId: '0',
    code: 'SYS',
    name: '系统字典',
    parent: true,
    children: [
      {
        id: 'd-locked',
        parentId: 'root-2',
        code: 'locked_status',
        name: '锁定状态',
        lines: [
          { id: 'l1', keyName: '0000', keyValue: '正常', orders: 1 },
          { id: 'l2', keyName: '0001', keyValue: '已锁定', orders: 2 },
          { id: 'l3', keyName: '9999', keyValue: '系统用户', orders: 3 },
        ],
      },
    ],
  },
];

const flatten = (nodes: DictRow[]): DictRow[] =>
  nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);

export default {
  'GET /api/sys/dictionary/list': (_req: Request, res: Response) => {
    res.send({ success: true, data: tree });
  },
  'GET /api/sys/dictionary/get/:id': (req: Request, res: Response) => {
    const item = flatten(tree).find((n) => n.id === req.params.id);
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
