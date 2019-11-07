import { Request, Response } from 'express';

const get = (req: Request, res: Response) => {
  res.json({
    "code":0,
    "data":{
      "code":"data_permission",
      "gmtCreate":"2019-09-20 17:12:37",
      "gmtModify":"2019-09-20 19:41:56",
      "id":"1174974634025496578",
      "lines":[
        {
          "id":"1174974634100994050",
          "keyName":"0000",
          "keyValue":"全部",
          "mainId":"1174974634025496578",
          "orders":0
        },
        {
          "id":"1174974634117771265",
          "keyName":"0001",
          "keyValue":"仅本部门",
          "mainId":"1174974634025496578",
          "orders":1
        },
        {
          "id":"1174974634142937089",
          "keyName":"0002",
          "keyValue":"本部门及下属部门",
          "mainId":"1174974634025496578",
          "orders":2
        },
        {
          "id":"1174974634159714305",
          "keyName":"0003",
          "keyValue":"指定部门",
          "mainId":"1174974634025496578",
          "orders":3
        },
        {
          "id":"1174974634176491521",
          "keyName":"0005",
          "keyValue":"仅本人创建",
          "mainId":"1174974634025496578",
          "orders":5
        }
      ],
      "name":"数据权限",
      "parentId":"1",
      "remark":"数据权限类型",
      "status":"9999"
    },
    "success":true
  });
};

const list = (req: Request, res: Response) => {
  res.json({
    "code":0,
    "data":[
      {
        "children":[
          {
            "code":"data_permission",
            "gmtCreate":"2019-09-20 17:12:37",
            "gmtModify":"2019-09-20 19:41:56",
            "id":"1174974634025496578",
            "name":"数据权限",
            "parentId":"1",
            "remark":"数据权限类型",
            "status":"9999"
          },
          {
            "code":"purchasing_type",
            "createBy":"9199482d76b443ef9f13fefddcf0046c",
            "gmtCreate":"2019-10-25 21:03:39",
            "gmtModify":"2019-10-25 21:17:06",
            "id":"1187716348942970881",
            "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
            "name":"采购类型",
            "parentId":"1",
            "status":"1"
          },
          {
            "code":"goods_type",
            "createBy":"9199482d76b443ef9f13fefddcf0046c",
            "gmtCreate":"2019-10-26 09:45:45",
            "gmtModify":"2019-10-31 13:12:06",
            "id":"1187908136467095553",
            "modifyBy":"9199482d76b443ef9f13fefddcf0046c",
            "name":"货品类型",
            "parentId":"1",
            "status":"1"
          }
        ],
        "code":"biz",
        "gmtCreate":"1899-12-31 08:00:00",
        "gmtModify":"1899-12-31 08:00:00",
        "id":"1",
        "modifyBy":"",
        "name":"业务代码",
        "parentId":"0",
        "remark":"业务代码",
        "status":"9999"
      },
      {
        "children":[],
        "code":"sys",
        "gmtCreate":"1899-12-31 08:00:00",
        "gmtModify":"1899-12-31 08:00:00",
        "id":"3",
        "name":"系统代码",
        "parentId":"0",
        "remark":"fdvdfv",
        "status":"9999"
      }
    ],
    "success":true
  });
};

export default {
  'GET /sys/dict/list': list,
  'GET /sys/dict/get': get,
  'POST /sys/dict/checkUnique': list,
  'POST /sys/dict/edit': list,
  'POST /sys/dict/sort': list,
  'POST /sys/dict/del': list,
};
