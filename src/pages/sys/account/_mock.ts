import type { Request, Response } from 'express';

interface AccountRow {
  id: string;
  account: string;
  name: string;
  deptId: string;
  deptName: string;
  tel: string;
  email: string;
  locked: '0000' | '0001' | '9999';
  roles: Array<{ id: string; name: string }>;
}

const accounts: AccountRow[] = [
  {
    id: 'a-001',
    account: 'admin',
    name: '系统管理员',
    deptId: 'org-1',
    deptName: '总部',
    tel: '13800000000',
    email: 'admin@eva.local',
    locked: '9999',
    roles: [{ id: 'role-1', name: '超级管理员' }],
  },
  {
    id: 'a-002',
    account: 'pkaq',
    name: 'PKAQ',
    deptId: 'org-1-1',
    deptName: '研发部',
    tel: '13900000001',
    email: 'pkaq@eva.local',
    locked: '0000',
    roles: [{ id: 'role-2', name: '研发' }],
  },
  {
    id: 'a-003',
    account: 'designer',
    name: '设计同学',
    deptId: 'org-1-2',
    deptName: '设计部',
    tel: '13900000002',
    email: 'designer@eva.local',
    locked: '0000',
    roles: [{ id: 'role-3', name: '设计' }],
  },
  {
    id: 'a-004',
    account: 'qa',
    name: '测试同学',
    deptId: 'org-1-1',
    deptName: '研发部',
    tel: '13900000003',
    email: 'qa@eva.local',
    locked: '0001',
    roles: [{ id: 'role-2', name: '研发' }],
  },
  {
    id: 'a-005',
    account: 'support',
    name: '客服',
    deptId: 'org-2',
    deptName: '支持中心',
    tel: '13900000004',
    email: 'support@eva.local',
    locked: '0000',
    roles: [],
  },
];

const filterAccounts = (q: Record<string, string>) =>
  accounts.filter((a) => {
    if (q.account && !a.account.includes(q.account)) return false;
    if (q.name && !a.name.includes(q.name)) return false;
    if (q.tel && !a.tel.includes(q.tel)) return false;
    if (q.deptId && a.deptId !== q.deptId) return false;
    return true;
  });

export default {
  'GET /api/sys/account/list': (req: Request, res: Response) => {
    const data = filterAccounts(req.query as Record<string, string>);
    res.send({ success: true, data, total: data.length });
  },
  'GET /api/sys/account/get/:id': (req: Request, res: Response) => {
    const item = accounts.find((a) => a.id === req.params.id);
    if (!item) {
      res.send({ success: false, message: '记录不存在' });
      return;
    }
    res.send({ success: true, data: item });
  },
  'POST /api/sys/account/edit': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/account/del': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/account/lock': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/account/grant': (_req: Request, res: Response) => {
    res.send({ success: true });
  },
  'POST /api/sys/account/checkUnique': (req: Request, res: Response) => {
    const { account, id } = req.body as { account?: string; id?: string };
    const dup = accounts.find((a) => a.account === account && a.id !== id);
    res.send({ success: !dup, message: dup ? '账号已存在' : undefined });
  },
};
