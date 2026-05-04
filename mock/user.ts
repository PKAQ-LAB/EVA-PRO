import type { Request, Response } from 'express';
import { waitTime, defaultUser } from './utils';

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;

/**
 * 当前用户的权限，如果为空代表没登录
 * current user access， if is '', user need login
 * 如果是 pro 的预览，默认是有权限的
 */
let access = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site' ? 'admin' : '';

const getAccess = () => {
  return access;
};

// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  // 支持值为 Object 和 Array
  'GET /api/currentUser': (_req: Request, res: Response) => {
    if (!getAccess()) {
      res.status(401).send({
        data: {
          isLogin: false,
        },
        errorCode: '401',
        errorMessage: '请先登录！',
        success: true,
      });
      return;
    }
    res.send({
      success: true,
      data: {
        ...defaultUser,
        access: getAccess(),
      },
    });
  },
  // GET POST 可省略
  'GET /api/users': [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ],
  // 默认账号 admin / admin123，密码经前端 MD5 后再发到后端
  // MD5('admin123') === '0192023a7bbd73250516f069df18b500'
  // MD5('user123')  === '0a791842f52a0d33b25c4b62fcefa125'
  'POST /api/login/account': async (req: Request, res: Response) => {
    const { password, username, type } = req.body;
    await waitTime(500);
    const ADMIN_MD5 = '0192023a7bbd73250516f069df18b500';
    const USER_MD5 = '0a791842f52a0d33b25c4b62fcefa125';
    if (password === ADMIN_MD5 && username === 'admin') {
      res.send({ status: 'ok', type, currentAuthority: 'admin' });
      access = 'admin';
      return;
    }
    if (password === USER_MD5 && username === 'user') {
      res.send({ status: 'ok', type, currentAuthority: 'user' });
      access = 'user';
      return;
    }
    if (type === 'mobile') {
      res.send({ status: 'ok', type, currentAuthority: 'admin' });
      access = 'admin';
      return;
    }
    res.send({ status: 'error', type, currentAuthority: 'guest' });
    access = 'guest';
  },
  'POST /api/auth/login': async (req: Request, res: Response) => {
    const { account, password } = req.body;
    await waitTime(500);
    const ADMIN_MD5 = '0192023a7bbd73250516f069df18b500';
    const USER_MD5 = '0a791842f52a0d33b25c4b62fcefa125';
    if (password === ADMIN_MD5 && account === 'admin') {
      res.send({
        status: 'ok',
        currentAuthority: 'admin',
        data: {
          access_token: 'admin-access-token',
          refresh_token: 'admin-refresh-token',
        },
      });
      access = 'admin';
      return;
    }
    if (password === USER_MD5 && account === 'user') {
      res.send({
        status: 'ok',
        currentAuthority: 'user',
        data: {
          access_token: 'user-access-token',
          refresh_token: 'user-refresh-token',
        },
      });
      access = 'user';
      return;
    }
    res.send({ status: 'error', currentAuthority: 'guest' });
    access = 'guest';
  },
  'GET /api/auth/logout': (_req: Request, res: Response) => {
    access = '';
    res.send({ success: true });
  },
  // 远程菜单：暴露 sys / log / dev 三大块
  'GET /api/auth/fetchMenus': (_req: Request, res: Response) => {
    res.send({
      success: true,
      data: [
        {
          name: '系统管理',
          path: '/sys',
          icon: 'setting',
          children: [
            { name: '用户管理', path: '/sys/account', icon: 'usergroup-add' },
            { name: '组织管理', path: '/sys/organization', icon: 'profile' },
            { name: '角色管理', path: '/sys/role', icon: 'solution' },
            { name: '模块管理', path: '/sys/module', icon: 'bars' },
            { name: '字典管理', path: '/sys/dictionary', icon: 'file' },
          ],
        },
        {
          name: '系统日志',
          path: '/log',
          icon: 'profile',
          children: [
            { name: '在线用户', path: '/log/online', icon: 'usergroup-add' },
            { name: '业务日志', path: '/log/biz', icon: 'profile' },
            { name: '错误日志', path: '/log/error', icon: 'flag' },
          ],
        },
        {
          name: '开发工具',
          path: '/dev',
          icon: 'rocket',
          children: [
            { name: '代码生成', path: '/dev/generator', icon: 'form' },
            { name: '工作流', path: '/dev/workflow', icon: 'radar-chart' },
          ],
        },
      ],
    });
  },
  // 字典数据：sys/dictionary、sys/role 的 DictSelector 会消费
  'GET /api/auth/fetchDicts': (_req: Request, res: Response) => {
    res.send({
      success: true,
      data: {
        dict_type: {
          '0001': '业务字典',
          '0002': '系统字典',
          '0003': '权限字典',
        },
        data_permission: {
          '0000': '本人',
          '0001': '本部门',
          '0002': '本部门及下级',
          '0003': '自定义',
          '9999': '全部',
        },
      },
    });
  },
  'POST /api/login/outLogin': (_req: Request, res: Response) => {
    access = '';
    res.send({ data: {}, success: true });
  },
  'GET /api/500': (_req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (_req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (_req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Forbidden',
      message: 'Forbidden',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (_req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },

  'GET /api/login/captcha': async (_req: Request, res: Response) => {
    await waitTime(2000);
    return res.json('captcha-xxx');
  },
};