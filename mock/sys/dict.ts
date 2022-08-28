import { Request, Response } from 'express';
export default {
  'GET /api/sys/dictionary/get/:id  ': (req: Request, res: Response) => {
    res.send({"code":"0000","success":true,"message":null,"errorMessage":null,"data":{"id":"1247707145754607618","createBy":"9199482d76b443ef9f13fefddcf0046c","gmtCreate":null,"modifyBy":"9199482d76b443ef9f13fefddcf0046c","gmtModify":null,"remark":null,"code":"unit","name":"单位","parentId":"1","status":"1","lines":[{"id":"147be54e535f46917fa4d90c3ffba614","mainId":"1247707145754607618","keyName":"0002","keyValue":"g","orders":null,"status":null},{"id":"5e800ffc87bd97f11253931d03dd00a9","mainId":"1247707145754607618","keyName":"0001","keyValue":"kg","orders":null,"status":null},{"id":"60ed545f6803b47e161e67959a811506","mainId":"1247707145754607618","keyName":"0004","keyValue":"袋","orders":null,"status":null},{"id":"60ed545f6803b47e161e67959a811517","mainId":"1247707145754607618","keyName":"0005","keyValue":"件","orders":null,"status":null},{"id":"60ed545f6803b47e161e67959a811518","mainId":"1247707145754607618","keyName":"0006","keyValue":"个","orders":null,"status":null},{"id":"60ed545f6803b47e161e67959a811519","mainId":"1247707145754607618","keyName":"0007","keyValue":"箱","orders":null,"status":null},{"id":"60ed545f6803b47e161e67959a811520","mainId":"1247707145754607618","keyName":"0008","keyValue":"瓶","orders":null,"status":null},{"id":"60ed545f6803b47e161e67959a811521","mainId":"1247707145754607618","keyName":"0009","keyValue":"m3","orders":null,"status":null},{"id":"60ed545f6803b47e161e67959a811522","mainId":"1247707145754607618","keyName":"0010","keyValue":"平方","orders":null,"status":null},{"id":"708ae86549fbe78b483f7fd1ab28cd6c","mainId":"1247707145754607618","keyName":"0003","keyValue":"桶","orders":null,"status":null}],"children":null}});
  },
  'GET /api/sys/dictionary/list': (req: Request, res: Response) => {
    res.send({
      "code": "0000",
      "success": true,
      "message": null,
      "errorMessage": null,
      "data": [{
          "id": "1",
          "createBy": null,
          "gmtCreate": '',
          "modifyBy": "",
          "gmtModify": '',
          "remark": "业务代码",
          "code": "biz",
          "name": "业务代码",
          "parentId": "0",
          "status": "9999",
          "lines": null,
          "children": [{
              "id": "1174974634025496578",
              "createBy": null,
              "gmtCreate": '',
              "modifyBy": null,
              "gmtModify": '',
              "remark": "数据权限类型",
              "code": "data_permission",
              "name": "数据权限",
              "parentId": "1",
              "status": "9999",
              "lines": null,
              "children": null
            }, {
              "id": "1247707145754607618",
              "createBy": "9199482d76b443ef9f13fefddcf0046c",
              "gmtCreate": null,
              "modifyBy": "9199482d76b443ef9f13fefddcf0046c",
              "gmtModify": null,
              "remark": null,
              "code": "unit",
              "name": "单位",
              "parentId": "1",
              "status": "1",
              "lines": null,
              "children": null
            }, {
              "id": "45",
              "createBy": "9199482d76b443ef9f13fefddcf0046c",
              "gmtCreate": '',
              "modifyBy": "9199482d76b443ef9f13fefddcf0046c",
              "gmtModify": '',
              "remark": "评分类型",
              "code": "scoreType",
              "name": "评分类型",
              "parentId": "1",
              "status": "9999",
              "lines": null,
              "children": null
            }
          ]
        }, {
          "id": "3",
          "createBy": null,
          "gmtCreate": '',
          "modifyBy": null,
          "gmtModify": '',
          "remark": "系统代码",
          "code": "sys",
          "name": "系统代码",
          "parentId": "0",
          "status": "9999",
          "lines": null,
          "children": [{
              "id": "1247704849712906241",
              "createBy": "9199482d76b443ef9f13fefddcf0046c",
              "gmtCreate": '',
              "modifyBy": "9199482d76b443ef9f13fefddcf0046c",
              "gmtModify": '',
              "remark": null,
              "code": "dict_type",
              "name": "所属分类",
              "parentId": "3",
              "status": "1",
              "lines": null,
              "children": null
            }
          ]
        }
      ]
    });
  },
};
