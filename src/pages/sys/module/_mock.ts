import type { Request, Response } from 'express';

interface ModuleResource {
  id?: string;
  resourceDesc: string;
  resourceUrl: string;
  resourceType?: string;
}

interface ModuleRow {
  id: string;
  name: string;
  code: string;
  path: string;
  routeUrl: string;
  icon: string;
  parentId: string;
  parentName?: string;
  orders: number;
  status: '0000' | '0001' | '9999';
  remark?: string;
  isLeaf?: boolean;
  resources?: ModuleResource[];
  children?: ModuleRow[];
}

const tree: ModuleRow[] = [
  {
    id: 'm-sys',
    name: '系统管理',
    code: 'sys',
    path: '/sys',
    routeUrl: '/sys',
    icon: 'setting',
    parentId: '0',
    orders: 1,
    status: '0000',
    isLeaf: false,
    resources: [
      { resourceDesc: '全部资源', resourceUrl: '/**', resourceType: '*' },
    ],
    children: [
      {
        id: 'm-sys-account',
        name: '用户管理',
        code: 'account',
        path: '/sys/account',
        routeUrl: '/sys/account',
        icon: 'usergroup-add',
        parentId: 'm-sys',
        parentName: '系统管理',
        orders: 1,
        status: '0000',
        isLeaf: true,
        resources: [
          {
            resourceDesc: '全部资源',
            resourceUrl: '/**',
            resourceType: '*',
          },
        ],
      },
      {
        id: 'm-sys-org',
        name: '组织管理',
        code: 'organization',
        path: '/sys/organization',
        routeUrl: '/sys/organization',
        icon: 'profile',
        parentId: 'm-sys',
        parentName: '系统管理',
        orders: 2,
        status: '0000',
        isLeaf: true,
      },
    ],
  },
  {
    id: 'm-log',
    name: '系统日志',
    code: 'log',
    path: '/log',
    routeUrl: '/log',
    icon: 'profile',
    parentId: '0',
    orders: 2,
    status: '0000',
    isLeaf: false,
    children: [
      {
        id: 'm-log-online',
        name: '在线用户',
        code: 'online',
        path: '/log/online',
        routeUrl: '/log/online',
        icon: 'usergroup-add',
        parentId: 'm-log',
        parentName: '系统日志',
        orders: 1,
        status: '0000',
        isLeaf: true,
      },
    ],
  },
];

const flatten = (nodes: ModuleRow[]): ModuleRow[] =>
  nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);

const filterByName = (q?: string): ModuleRow[] => {
  if (!q) return tree;
  return flatten(tree).filter((n) => n.name.includes(q));
};

export default {
  'GET /api/sys/module/listNoPage': (req: Request, res: Response) => {
    res.send({
      success: true,
      data: filterByName((req.query.name as string | undefined) ?? ''),
    });
  },
  'GET /api/sys/module/get/:id': (req: Request, res: Response) => {
    const item = flatten(tree).find((n) => n.id === req.params.id);
    if (!item) {
      res.send({ success: false, message: '记录不存在' });
      return;
    }
    res.send({ success: true, data: item });
  },
  'POST /api/sys/module/edit': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/module/del': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/module/sort': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/module/switchStatus': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/module/checkUnique': (req: Request, res: Response) => {
    const { code, id, pid } = req.body as {
      code?: string;
      id?: string;
      pid?: string;
    };
    const dup = flatten(tree).find(
      (node) => node.code === code && node.parentId === pid && node.id !== id,
    );
    res.send({ success: !dup, message: dup ? '模块编码已存在' : undefined });
  },
};
