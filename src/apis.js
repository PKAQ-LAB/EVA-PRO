export default {
  /**  系统管理 * */
  // 部门管理
  ORG_GET: '/api/sys/organization/get',
  ORG_LIST: '/api/sys/organization/list',
  ORG_SORT: '/api/sys/organization/sort',
  ORG_EDIT: '/api/sys/organization/edit',
  ORG_STATUS: '/api/sys/organization/switchStatus',
  ORG_DEL: '/api/sys/organization/del',
  ORG_CHECKUNIQUE: '/api/sys/organization/checkUnique',
  // 模块管理
  MODULE_GET: '/api/sys/module/get',
  MODULE_LIST: '/api/sys/module/listNoPage',
  MODULE_EDIT: '/api/sys/module/edit',
  MODULE_SORT: '/api/sys/module/sort',
  MODULE_DEL: '/api/sys/module/del',
  MODULE_STATUS: '/api/sys/module/switchStatus',
  MODULE_CHECKUNIQUE: '/api/sys/module/checkUnique',
  // 字典管理
  DICT_GET: '/api/sys/dictionary/get',
  DICT_LIST: '/api/sys/dictionary/list',
  DICT_EDIT: '/api/sys/dictionary/edi',
  DICT_DEL: '/api/sys/dictionary/del',
  // 角色管理
  ROLE_GET: '/api/sys/role/get',
  ROLE_LIST: '/api/sys/role/list',
  ROLE_DEL: '/api/sys/role/del',
  ROLE_SAVE: '/api/sys/role/save',
  ROLE_LOCK: '/api/sys/role/lock',
  ROLE_SAVEUSER: '/api/sys/role/saveUser',
  ROLE_SAVEMODULE: '/api/sys/role/saveModule',
  ROLE_CHECKUNIQUE: '/api/sys/role/checkUnique',
  ROLE_LISTMOUDLE: '/api/sys/role/listModule',
  ROLE_LISTUSER: '/api/sys/role/listUser',
  // 用户管理
  ACCOUNT_GET: '/api/sys/account/get',
  ACCOUNT_LIST: '/api/sys/account/list',
  ACCOUNT_CHECKUNIQUE: '/api/sys/account/checkUnique',
  ACCOUNT_EDIT: '/api/sys/account/edit',
  ACCOUNT_GRANT: '/api/sys/account/grant',
  ACCOUNT_DEL: '/api/sys/account/del',
  ACCOUNT_LOCK: '/api/sys/account/lock',

  /**  系统日志 * */
  // 在线用户
  ONLINE_LIST: '/api/monitor/log/online/list',
  // 错误日志
  ERROR_GET: '/api/monitor/log/error/get',
  ERROR_LIST: '/api/monitor/log/error/list',
  // 业务日志
  BIZLOG_GET: '/api/monitor/log/biz/get',
  BIZLOG_LIST: '/api/monitor/log/biz/list',
}
