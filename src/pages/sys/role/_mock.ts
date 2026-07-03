import type { Request, Response } from 'express';

interface RoleRow {
  id: string;
  name: string;
  code: string;
  remark: string;
  frozen: 0 | 1 | 9999;
  dataScope?: string;
}

const roles: RoleRow[] = [
  {
    id: 'role-1',
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    remark: '系统内置，不可修改',
    frozen: 9999,
    dataScope: '0000',
  },
  {
    id: 'role-2',
    name: '研发',
    code: 'RD',
    remark: '研发同学',
    frozen: 0,
    dataScope: '0001',
  },
  {
    id: 'role-3',
    name: '设计',
    code: 'DESIGN',
    remark: '设计同学',
    frozen: 0,
    dataScope: '0001',
  },
  {
    id: 'role-4',
    name: '客服',
    code: 'SUPPORT',
    remark: '已停用示例',
    frozen: 1,
    dataScope: '0000',
  },
];

const filterRoles = (q: Record<string, string>) =>
  roles.filter((r) => {
    if (q.name && !r.name.includes(q.name)) return false;
    if (q.code && !r.code.includes(q.code)) return false;
    return true;
  });

// 简化的模块授权树：每个模块挂 1-2 条资源
const moduleTree = [
  {
    id: 'mod-sys',
    name: '系统管理',
    children: [
      {
        id: 'mod-sys-account',
        name: '用户管理',
        resources: [
          { id: 'res-account-r', resourceDesc: '查看' },
          { id: 'res-account-w', resourceDesc: '编辑' },
        ],
      },
      {
        id: 'mod-sys-role',
        name: '角色管理',
        resources: [
          { id: 'res-role-r', resourceDesc: '查看' },
          { id: 'res-role-w', resourceDesc: '编辑' },
        ],
      },
    ],
  },
  {
    id: 'mod-log',
    name: '系统日志',
    children: [
      {
        id: 'mod-log-online',
        name: '在线用户',
        resources: [{ id: 'res-online-r', resourceDesc: '查看' }],
      },
    ],
  },
];

const flattenModules = (list: typeof moduleTree): typeof moduleTree =>
  list.flatMap((m) => [
    m,
    ...(m.children ? flattenModules(m.children as never) : []),
  ]);

const usersPool = [
  {
    id: 'a-001',
    name: '系统管理员',
    account: 'admin',
    deptName: '总部',
    tel: '13800000000',
  },
  {
    id: 'a-002',
    name: 'PKAQ',
    account: 'pkaq',
    deptName: '研发部',
    tel: '13900000001',
  },
  {
    id: 'a-003',
    name: '设计同学',
    account: 'designer',
    deptName: '设计部',
    tel: '13900000002',
  },
];

export default {
  'GET /api/sys/role/list': (req: Request, res: Response) => {
    const list = filterRoles(req.query as Record<string, string>);
    res.send({ success: true, data: { list, total: list.length } });
  },
  'GET /api/sys/role/get/:id': (req: Request, res: Response) => {
    const item = roles.find((r) => r.id === req.params.id);
    if (!item) {
      res.send({ success: false, message: '记录不存在' });
      return;
    }
    res.send({ success: true, data: item });
  },
  'POST /api/sys/role/save': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/role/del': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/role/lock': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/role/checkUnique': (req: Request, res: Response) => {
    const { code } = req.body as { code?: string };
    const dup = roles.some((r) => r.code === code);
    res.send({ success: !dup, message: dup ? '编码已存在' : undefined });
  },
  'GET /api/sys/role/listModule': (req: Request, res: Response) => {
    const roleId = String(req.query.roleId ?? '');
    // 默认 admin 角色全选；其他角色选第一个模块
    const allModules = flattenModules(moduleTree);
    const isAdmin = roleId === 'role-1';
    const checked = isAdmin ? allModules.map((m) => m.id) : ['mod-sys-account'];
    const checkedResource: Record<string, string[]> = {};
    for (const m of allModules) {
      const resources = (
        m as { resources?: Array<{ id: string; resourceDesc: string }> }
      ).resources;
      if (!resources) continue;
      if (isAdmin) {
        checkedResource[m.id] = resources.map((r) => r.id);
      } else if (m.id === 'mod-sys-account') {
        checkedResource[m.id] = [resources[0].id];
      }
    }
    res.send({
      success: true,
      data: {
        modules: moduleTree,
        checked,
        checkedResource,
      },
    });
  },
  'POST /api/sys/role/saveModule': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'GET /api/sys/role/listUser': (req: Request, res: Response) => {
    const roleId = String(req.query.roleId ?? '');
    const checked = roleId === 'role-1' ? ['a-001'] : ['a-002'];
    res.send({ success: true, data: { users: usersPool, checked } });
  },
  'POST /api/sys/role/saveUser': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
};
