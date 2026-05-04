import type { Request, Response } from 'express';

interface OrgRow {
  id: string;
  name: string;
  code: string;
  parentId: string;
  parentName?: string;
  orders: number;
  status: '0000' | '0001' | '9999';
  remark?: string;
  isLeaf?: boolean;
  children?: OrgRow[];
}

const tree: OrgRow[] = [
  {
    id: 'org-1',
    name: '总部',
    code: 'HQ',
    parentId: '0',
    orders: 1,
    status: '9999',
    isLeaf: false,
    children: [
      {
        id: 'org-1-1',
        name: '研发部',
        code: 'RD',
        parentId: 'org-1',
        parentName: '总部',
        orders: 1,
        status: '0001',
        isLeaf: true,
      },
      {
        id: 'org-1-2',
        name: '设计部',
        code: 'DESIGN',
        parentId: 'org-1',
        parentName: '总部',
        orders: 2,
        status: '0001',
        isLeaf: true,
      },
    ],
  },
  {
    id: 'org-2',
    name: '支持中心',
    code: 'SUPPORT',
    parentId: '0',
    orders: 2,
    status: '0001',
    isLeaf: true,
  },
];

const flatten = (nodes: OrgRow[]): OrgRow[] =>
  nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);

const filterByName = (q?: string): OrgRow[] => {
  if (!q) return tree;
  return flatten(tree).filter((n) => n.name.includes(q));
};

export default {
  'GET /api/sys/organization/list': (req: Request, res: Response) => {
    const data = filterByName((req.query.name as string | undefined) ?? '');
    res.send({ success: true, data });
  },
  'GET /api/sys/organization/get/:id': (req: Request, res: Response) => {
    const item = flatten(tree).find((n) => n.id === req.params.id);
    if (!item) {
      res.send({ success: false, message: '记录不存在' });
      return;
    }
    res.send({ success: true, data: item });
  },
  'POST /api/sys/organization/edit': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/organization/del': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/organization/sort': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/organization/switchStatus': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/organization/checkUnique': (req: Request, res: Response) => {
    const { code } = req.body as { code?: string };
    const dup = flatten(tree).some((n) => n.code === code);
    res.send({ success: !dup, message: dup ? '编码已存在' : undefined });
  },
};
