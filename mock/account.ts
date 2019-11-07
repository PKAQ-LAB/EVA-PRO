import { Request, Response } from 'express';

const get = (req: Request, res: Response) => {
  res.json({
    "code":0,
    "data":{
      "account":"scott",
      "avatar":"",
      "createBy":"9199482d76b443ef9f13fefddcf0046c",
      "deleted":"0000",
      "deptId":"6",
      "deptName":"加达里",
      "gmtCreate":"2019-11-01 11:12:39",
      "gmtModify":"2019-11-06 17:31:04",
      "id":"1190104332380127233",
      "locked":"0000",
      "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
      "modules":[],
      "name":"操作员",
      "roles":[
        {
          "code":"ROLE_OPERATOR",
          "dataPermissionType":"0002",
          "id":"1191916813788344321",
          "name":"系统操作员"
        }
      ]
    },
    "success":true
  });
};

const list = (req: Request, res: Response) => {
  res.json({
    "code":0,
    "data":{
      "current":1,
      "orders":[],
      "pages":1,
      "records":[
        {
          "account":"scott",
          "avatar":"",
          "createBy":"9199482d76b443ef9f13fefddcf0046c",
          "deleted":"0000",
          "deptId":"6",
          "deptName":"加达里",
          "gmtCreate":"2019-11-01 11:12:39",
          "gmtModify":"2019-11-06 17:31:04",
          "id":"1190104332380127233",
          "locked":"0000",
          "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
          "modules":[],
          "name":"操作员",
          "roles":[]
        },
        {
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
          "roles":[]
        }
      ],
      "searchCount":true,
      "size":10,
      "total":2
    },
    "success":true
  });
};

export default {
  'GET /sys/account/list': list,
  'GET /sys/account/get': get,
  'POST /sys/account/checkUnique': list,
  'POST /sys/account/edit': list,
  'POST /sys/account/grant': list,
  'POST /sys/account/del': list,
  'POST /sys/account/lock': list,
};
