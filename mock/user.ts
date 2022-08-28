import { Request, Response } from 'express';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

async function getFakeCaptcha(req: Request, res: Response) {
  await waitTime(2000);
  return res.json('captcha-xxx');
}

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
  'GET /api/currentUser': (req: Request, res: Response) => {
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
        name: 'Serati Ma',
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        userid: '00000001',
        email: 'antdesign@alipay.com',
        signature: '海纳百川，有容乃大',
        title: '交互专家',
        group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
        tags: [
          {
            key: '0',
            label: '很有想法的',
          },
          {
            key: '1',
            label: '专注设计',
          },
          {
            key: '2',
            label: '辣~',
          },
          {
            key: '3',
            label: '大长腿',
          },
          {
            key: '4',
            label: '川妹子',
          },
          {
            key: '5',
            label: '海纳百川',
          },
        ],
        notifyCount: 12,
        unreadCount: 11,
        country: 'China',
        access: getAccess(),
        geographic: {
          province: {
            label: '浙江省',
            key: '330000',
          },
          city: {
            label: '杭州市',
            key: '330100',
          },
        },
        address: '西湖区工专路 77 号',
        phone: '0752-268888888',
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
  'POST /api/login/account': async (req: Request, res: Response) => {
    const { password, username, type } = req.body;
    await waitTime(2000);
    if (password === 'ant.design' && username === 'admin') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      access = 'admin';
      return;
    }
    if (password === 'ant.design' && username === 'user') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'user',
      });
      access = 'user';
      return;
    }
    if (type === 'mobile') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      access = 'admin';
      return;
    }

    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
    access = 'guest';
  },
  'POST /api/login/outLogin': (req: Request, res: Response) => {
    access = '';
    res.send({ data: {}, success: true });
  },
  'POST /api/register': (req: Request, res: Response) => {
    res.send({ status: 'ok', currentAuthority: 'user', success: true });
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
      error: 'Forbidden',
      message: 'Forbidden',
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
  // 字典
  'GET /api/auth/fetchDict' : (req: Request, res: Response) => {
    res.status(200).send({
      "code": '0000',
      "success":true,
      "data": {
        "purchasing_type":{
          "0002":"市场采购",
          "0001":"网络采购"
        },
        "goods_type":{
          "0002":"饰品",
          "0001":"玩具"
        },
        "data_permission":{
          "0005":"仅本人创建",
          "0002":"本部门及下属部门",
          "0003":"指定部门",
          "0000":"全部",
          "0001":"仅本部门"
        }
      }
    });
  },
  // 支持值为 Object 和 Array
  'GET /api/auth/fetchMenus' : (req: Request, res: Response) => {
      res.status(200).send({
      "code":'0000',
      "data":[
          {
          "exact":false,
          "icon":"",
          "id":"25",
          "isleaf":false,
          "key":"",
          "locale":"menu.pdos.sale",
          "name":"销售管理",
          "orders":0,
          "parentName":"销售管理",
          "path":"/pdos/sale",
          "pathId":"25",
          "status":"9999",
          "children":[
            {
              "exact":true,
              "icon":"form",
              "id":"20",
              "isleaf":true,
              "key":"",
              "locale":"menu.pdos.sale.slip",
              "name":"销售单",
              "orders":4,
              "parentId":"8",
              "path":"/pdos/sale/slip",
              "pathId":"8,20",
              "status":"9999"
            }]
        },{
          "children":[
            {
              "exact":true,
              "icon":"profile",
              "id":"18",
              "isleaf":true,
              "key":"",
              "locale":"menu.pdos.category",
              "name":"类目管理",
              "orders":1,
              "parentId":"8",
              "path":"/pdos/base/category",
              "pathId":"8,18",
              "status":"9999"
            },
            {
              "exact":true,
              "icon":"form",
              "id":"20",
              "isleaf":true,
              "key":"",
              "locale":"menu.pdos.goods",
              "name":"商品管理",
              "orders":4,
              "parentId":"8",
              "path":"/pdos/base/goods",
              "pathId":"8,20",
              "status":"9999"
            },{
              "exact":true,
              "icon":"form",
              "id":"21",
              "isleaf":true,
              "key":"",
              "locale":"menu.pdos.shop",
              "name":"店铺管理",
              "orders":4,
              "parentId":"8",
              "path":"/pdos/base/shop",
              "pathId":"8,21",
              "status":"9999"
            },{
              "exact":true,
              "icon":"form",
              "id":"22",
              "isleaf":true,
              "key":"",
              "locale":"menu.pdos.brand",
              "name":"品牌管理",
              "orders":4,
              "parentId":"8",
              "path":"/pdos/base/brand",
              "pathId":"8,22",
              "status":"9999"
            },
            {
              "exact":true,
              "icon":"bars",
              "id":"19",
              "isleaf":true,
              "key":"",
              "locale":"menu.pdos.supplier",
              "name":"供应商管理",
              "orders":3,
              "parentId":"8",
              "path":"/pdos/base/supplier",
              "pathId":"8,19",
              "status":"9999"
            }
          ],
          "exact":false,
          "icon":"setting",
          "id":"8",
          "isleaf":false,
          "key":"",
          "locale":"menu.pdos",
          "name":"进销存",
          "orders":0,
          "parentName":"进销存",
          "path":"/pdos/base",
          "pathId":"8",
          "status":"9999"
        },{
            "children":[
              {
                "exact":true,
                "gmtModify":"2019-11-01 10:36:52",
                "icon":"flag",
                "id":"6",
                "isleaf":true,
                "key":"",
                "locale":"menu.sys.organization",
                "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
                "name":"组织管理",
                "orders":0,
                "parentId":"5",
                "path":"/sys/organization",
                "pathId":"5,5",
                "status":"9999"
              },
              {
                "exact":true,
                "gmtModify":"2019-11-01 10:36:55",
                "icon":"usergroup-add",
                "id":"8",
                "isleaf":true,
                "key":"",
                "locale":"menu.sys.account",
                "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
                "name":"用户管理",
                "orders":1,
                "parentId":"5",
                "path":"/sys/account",
                "pathId":"5,5",
                "status":"9999"
              },
              {
                "exact":true,
                "gmtModify":"2019-11-01 10:36:56",
                "icon":"form",
                "id":"9",
                "isleaf":true,
                "key":"",
                "locale":"menu.sys.role",
                "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
                "name":"权限管理",
                "orders":2,
                "parentId":"5",
                "path":"/sys/role",
                "pathId":"5,5",
                "status":"9999"
              },
              {
                "exact":true,
                "gmtModify":"2019-11-01 10:36:56",
                "icon":"bars",
                "id":"7",
                "isleaf":true,
                "key":"",
                "locale":"menu.sys.module",
                "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
                "name":"模块管理",
                "orders":3,
                "parentId":"5",
                "path":"/sys/module",
                "pathId":"5,5",
                "status":"9999"
              },
              {
                "exact":true,
                "gmtModify":"2019-11-01 10:36:40",
                "icon":"profile",
                "id":"10",
                "isleaf":true,
                "key":"",
                "locale":"menu.sys.dictionary",
                "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
                "name":"字典管理",
                "orders":4,
                "parentId":"5",
                "path":"/sys/dictionary",
                "pathId":"5,5",
                "status":"9999"
              }
            ],
            "exact":false,
            "gmtModify":"2019-10-15 12:41:52",
            "icon":"setting",
            "id":"5",
            "isleaf":false,
            "key":"",
            "locale":"menu.sys",
            "name":"系统管理",
            "orders":0,
            "parentName":"系统管理",
            "path":"/sys",
            "pathId":"5",
            "status":"9999"
          },
          {
            "children":[
              {
                "createBy":"9199482d76b443ef9f13fefddcf0046c",
                "exact":true,
                "gmtCreate":"2019-10-21 16:09:48",
                "gmtModify":"2019-10-21 16:11:02",
                "icon":"file",
                "id":"1186192847761297410",
                "isleaf":true,
                "key":"",
                "locale":"menu.monitor.log.biz",
                "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
                "name":"业务日志",
                "orders":1,
                "parentId":"1186192719776305153",
                "parentName":"系统监控",
                "path":"/monitor/log/biz",
                "pathId":"1186192719776305153",
                "pathName":"系统监控/业务日志",
                "status":"9999"
              },
              {
                "createBy":"9199482d76b443ef9f13fefddcf0046c",
                "exact":true,
                "gmtCreate":"2019-10-21 16:10:19",
                "gmtModify":"2019-10-21 16:11:08",
                "icon":"file",
                "id":"1186192979059789826",
                "isleaf":true,
                "key":"",
                "locale":"menu.monitor.log.error",
                "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
                "name":"异常日志",
                "orders":2,
                "parentId":"1186192719776305153",
                "parentName":"系统监控",
                "path":"/monitor/log/error",
                "pathId":"1186192719776305153",
                "pathName":"系统监控/异常日志",
                "status":"9999"
              }
            ],
            "createBy":"9199482d76b443ef9f13fefddcf0046c",
            "exact":true,
            "gmtCreate":"2019-10-21 16:09:17",
            "gmtModify":"2019-10-21 16:09:17",
            "icon":"radar-chart",
            "id":"1186192719776305153",
            "isleaf":true,
            "key":"",
            "locale":"menu.monitor",
            "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
            "name":"系统监控",
            "orders":5,
            "path":"/monitor",
            "status":"9999"
          },
        // ],
        // "user":{
        //   "account":"admin",
        //   "avatar":"",
        //   "code":"admin",
        //   "deleted":"0000",
        //   "deptId":"1",
        //   "deptName":"统合部",
        //   "email":"pkaq@msn.com",
        //   "gmtModify":"2019-10-09 20:20:04",
        //   "id":"9199482d76b443ef9f13fefddcf0046c",
        //   "locked":"9999",
        //   "modules":[],
        //   "name":"超级管理员",
        //   "nickName":"133",
        //   "remark":"AAACCC",
        //   "roles":[
        //     {
        //       "code":"ROLE_ADMIN",
        //       "dataPermissionType":"0000",
        //       "id":"1",
        //       "name":"系统管理员"
        //     }
        //   ]
        // }
      ],
      "success":true
    });
  },
  // GET POST 可省略
  'POST /api/auth/login': (req: Request, res: Response) => {
    const { account, type } = req.body;
    if ("admin" === account) {
      res.send({
        success: true,
        code: '0000',
        currentAuthority: 'admin',
        message: '欢迎回来 [Admin] ',
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhZG1pbiIsImlhdCI6MTU2ODEyMjk2NSwiaXNzIjoiUEtBUSIsInN1YiI6ImFkbWluIiwiZXhwIjoxNTcwNzE0OTY1LCJuYmYiOjE1NjgxMjI5NjV9.nzBOnR5eDSbSd6h6aYG63dmYfcVaocweZ7x2TkvcBXQ',
          refresh_token: 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhZG1pbiIsImlhdCI6MTU2ODEyMjk2NSwiaXNzIjoiUEtBUSIsInN1YiI6ImFkbWluIiwiZXhwIjoxNTcwNzE0OTY1LCJuYmYiOjE1NjgxMjI5NjV9.nzBOnR5eDSbSd6h6aYG63dmYfcVaocweZ7x2TkvcBXQ',
        }

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
      message: '用户名或密码错误~',
      currentAuthority: 'guest',
    });
  },
  'GET /api/auth/logout': (req: Request, res: Response) => {
    res.send({ data: {}, success: true, code: '0000', message: '您已经退出登录' });
  },
};
