import { Request, Response } from 'express';
// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  // 支持值为 Object 和 Array
  'GET /api/auth/fetch': {
    "code":'0000',
    "data":{
      "dict":{
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
      },
      "menus":[
        {
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
          "originChildren":[
            {"$ref":"$.data.menus[0].children[0]"},
            {"$ref":"$.data.menus[0].children[1]"},
            {"$ref":"$.data.menus[0].children[2]"},
            {"$ref":"$.data.menus[0].children[3]"},
            {"$ref":"$.data.menus[0].children[4]"}
          ],
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
          "originChildren":[
            {"$ref":"$.data.menus[1].children[0]"},
            {"$ref":"$.data.menus[1].children[1]"}
          ],
          "path":"/monitor",
          "status":"9999"
        },
        {
          "createBy":"9199482d76b443ef9f13fefddcf0046c",
          "exact":true,
          "gmtCreate":"2019-10-25 12:34:47",
          "gmtModify":"2019-10-25 12:34:47",
          "icon":"rocket",
          "id":"1187588287316574209",
          "isleaf":true,
          "key":"",
          "locale":"menu.dev.generator",
          "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
          "name":"代码生成",
          "orders":6,
          "path":"/dev/generator",
          "status":"9999"
        },
        {
          "children":[
            {
              "createBy":"9199482d76b443ef9f13fefddcf0046c",
              "exact":true,
              "gmtCreate":"2019-10-26 11:39:48",
              "gmtModify":"2019-10-26 11:39:48",
              "id":"1187936839427391490",
              "isleaf":true,
              "key":"",
              "locale":"menu.pdos.purchasing",
              "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
              "name":"采购管理",
              "orders":1,
              "parentId":"1187919802302926850",
              "parentName":"进销存",
              "path":"/pdos/purchasing",
              "pathId":"1187919802302926850",
              "pathName":"进销存/采购管理",
              "status":"9999"
            }
          ],
          "createBy":"9199482d76b443ef9f13fefddcf0046c",
          "exact":true,
          "gmtCreate":"2019-10-26 10:32:06",
          "gmtModify":"2019-10-26 10:32:06",
          "icon":"home",
          "id":"1187919802302926850",
          "isleaf":true,
          "key":"",
          "locale":"menu.pdos",
          "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
          "name":"进销存",
          "orders":7,
          "originChildren":[
            {"$ref":"$.data.menus[3].children[0]"}
          ],
          "path":"/pdos",
          "status":"9999"
        }
      ],
      "user":{
        "account":"admin",
        "avatar":"",
        "code":"admin",
        "deleted":"0000",
        "deptId":"1",
        "deptName":"统合部",
        "email":"pkaq@msn.com",
        "gmtModify":"2019-10-09 20:20:04",
        "id":"9199482d76b443ef9f13fefddcf0046c",
        "locked":"9999",
        "modules":[],
        "name":"超级管理员",
        "nickName":"133",
        "remark":"AAACCC",
        "roles":[
          {
            "code":"ROLE_ADMIN",
            "dataPermissionType":"0000",
            "id":"1",
            "name":"系统管理员"
          }
        ]
      }
    },
    "success":true
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
          ALPHA: 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhZG1pbiIsImlhdCI6MTU2ODEyMjk2NSwiaXNzIjoiUEtBUSIsInN1YiI6ImFkbWluIiwiZXhwIjoxNTcwNzE0OTY1LCJuYmYiOjE1NjgxMjI5NjV9.nzBOnR5eDSbSd6h6aYG63dmYfcVaocweZ7x2TkvcBXQ',
          BRAVO: 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhZG1pbiIsImlhdCI6MTU2ODEyMjk2NSwiaXNzIjoiUEtBUSIsInN1YiI6ImFkbWluIiwiZXhwIjoxNTcwNzE0OTY1LCJuYmYiOjE1NjgxMjI5NjV9.nzBOnR5eDSbSd6h6aYG63dmYfcVaocweZ7x2TkvcBXQ',
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
};
