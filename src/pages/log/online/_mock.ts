import type { Request, Response } from 'express';

const now = Date.now();
const onlineUsers = Array.from({ length: 12 }).map((_, i) => ({
  id: `online-${i + 1}`,
  account: i === 0 ? 'admin' : `user${i + 1}`,
  device: i % 2 === 0 ? 'pc' : 'mobile',
  version: '6.0',
  loginTime: new Date(now - i * 60_000).toISOString(),
  issuedAt: new Date(now - i * 60_000).toISOString(),
  expireAt: new Date(now + (60 - i) * 60_000).toISOString(),
  token: `eyJhbGciOiJIUzI1NiJ9.online-${i + 1}.signature`,
}));

export default {
  'GET /api/monitor/log/online/list': (_req: Request, res: Response) => {
    res.send({
      success: true,
      data: onlineUsers,
      total: onlineUsers.length,
    });
  },
};
