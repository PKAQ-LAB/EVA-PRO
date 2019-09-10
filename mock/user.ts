import { Request, Response } from 'express';

function getFakeCaptcha(req: Request, res: Response) {
  return res.json('captcha-xxx');
}
// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  // 支持值为 Object 和 Array
  'GET /auth/fetchUser': {
    code: 200,
    data: {
      user: {
        account: 'admin',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
        code: 'admin',
        deleted: '0001',
        deptId: '1',
        deptName: '',
        email: 'admin',
        id: '9199482d76b443ef9f13fefddcf0046c',
        locked: '0000',
        name: '超级管理员',
      },
      token:
        'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhZG1pbiIsImlhdCI6MTU2ODEyMjk2NSwiaXNzIjoiUEtBUSIsInN1YiI6ImFkbWluIiwiZXhwIjoxNTcwNzE0OTY1LCJuYmYiOjE1NjgxMjI5NjV9.nzBOnR5eDSbSd6h6aYG63dmYfcVaocweZ7x2TkvcBXQ',
    },
    success: true,
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
  'POST /auth/login': (req: Request, res: Response) => {
    const { password, userName, type } = req.body;
    if (password === userName) {
      res.send({
        success: true,
        code: 200,
        currentAuthority: 'admin',
        data:
          'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhZG1pbiIsImlhdCI6MTU2ODEyMjk2NSwiaXNzIjoiUEtBUSIsInN1YiI6ImFkbWluIiwiZXhwIjoxNTcwNzE0OTY1LCJuYmYiOjE1NjgxMjI5NjV9.nzBOnR5eDSbSd6h6aYG63dmYfcVaocweZ7x2TkvcBXQ',
      });
      return;
    }
    if (type === 'mobile') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      return;
    }

    res.send({
      success: false,
      message: '用户名或密码错误',
      currentAuthority: 'guest',
    });
  },
  'POST /api/register': (req: Request, res: Response) => {
    res.send({ status: 'ok', currentAuthority: 'user' });
  },
  'GET /api/500': (req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },

  'GET  /api/login/captcha': getFakeCaptcha,
};
