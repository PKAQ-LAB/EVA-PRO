import { Request, Response } from 'express';
export default {
  'GET /api/sys/role/get/:id  ': (req: Request, res: Response) => {
    res.send({"code":"0000","success":true,"message":null,"errorMessage":null,"data":{"id":"1","createBy":null,"gmtCreate":null,"modifyBy":null,"gmtModify":{"nano":0,"year":2020,"monthValue":12,"dayOfMonth":16,"hour":14,"minute":42,"second":29,"month":"DECEMBER","dayOfWeek":"WEDNESDAY","dayOfYear":351,"chronology":{"calendarType":"iso8601","id":"ISO"}},"remark":null,"name":"系统管理员","code":"ROLE_ADMIN","parentId":null,"parentName":null,"path":null,"pathName":null,"isleaf":null,"orders":null,"locked":"0000","dataPermissionType":"0000","dataPermissionDeptid":null,"modules":null,"users":null,"resources":null}});
  },
  'GET /api/sys/role/list': (req: Request, res: Response) => {
    res.send({
      "code": "0000",
      "success": true,
      "message": null,
      "errorMessage": null,
      "data": [{
          "id": "1",
          "createBy": null,
          "gmtCreate": null,
          "modifyBy": null,
          "gmtModify": {
            "nano": 0,
            "year": 2020,
            "monthValue": 12,
            "dayOfMonth": 16,
            "hour": 14,
            "minute": 42,
            "second": 29,
            "month": "DECEMBER",
            "dayOfWeek": "WEDNESDAY",
            "dayOfYear": 351,
            "chronology": {
              "calendarType": "iso8601",
              "id": "ISO"
            }
          },
          "remark": null,
          "name": "系统管理员",
          "code": "ROLE_ADMIN",
          "parentId": null,
          "parentName": null,
          "path": null,
          "pathName": null,
          "isleaf": null,
          "orders": null,
          "locked": "0000",
          "dataPermissionType": "0000",
          "dataPermissionDeptid": null,
          "modules": null,
          "users": null,
          "resources": null
        }, {
          "id": "1191916813788344321",
          "createBy": "9199482d76b443ef9f13fefddcf0046c",
          "gmtCreate": '',
          "modifyBy": null,
          "gmtModify": '',
          "remark": "系统操作员 仅可操作本人所属部门及下级部门数据",
          "name": "系统操作员",
          "code": "ROLE_OPERATOR",
          "parentId": null,
          "parentName": null,
          "path": null,
          "pathName": null,
          "isleaf": null,
          "orders": null,
          "locked": "0000",
          "dataPermissionType": "0002",
          "dataPermissionDeptid": null,
          "modules": null,
          "users": null,
          "resources": null
        }
      ]
    });
  },
};
