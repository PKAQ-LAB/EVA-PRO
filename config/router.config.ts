export default [
  {
    path: '/',
    redirect: '/welcome',
  }, {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  }, {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  // 系统管理
  {
    path: '/sys',
    name: 'sys',
    icon: 'setting',
    routes: [
      { path: '/sys/organization', name: 'organization', component: './sys/organization' },
      { path: '/sys/account', name: 'account', component: './sys/account' },
      { path: '/sys/module', name: 'module', component: './sys/module' },
      { path: '/sys/role', name: 'role', component: './sys/role' },
      { path: '/sys/dictionary', name: 'dictionary', component: './sys/dictionary' },
    ],
  },
  // 个人中心
  {
    path: '/config',
    name: 'user',
    routes: [
      { name: 'setting', path: '/config/settings', component: './user/settings' },
    ],
  },
  // 系统日志
  {
    path: '/monitor',
    name: 'log',
    routes: [
      { name: 'biz', path: '/monitor/log/biz', component: './log/biz' },
      { name: 'error', path: '/monitor/log/error', component: './log/error' },
      { name: 'online', path: '/monitor/log/online', component: './log/online' },
    ],
  },
  // 代码生成器
  {
    path: '/dev',
    name: 'dev',
    routes: [
      { name: 'generator', path: '/dev/generator', component: './dev/generator' },
    //  { name: 'workflow', path: '/dev/workflow', component: './dev/workflow' },
      //{ name: 'formschema', path: '/dev/formschema', component: './dev/formschema' }
    ],
  },
    // 进销存
    {
    path: '/pdos',
    name: 'pdos',
    routes: [
      { name: 'base',
        path: '/pdos/base',
        routes: [
          { name: 'category', path: '/pdos/base/category', component: './pdos/base/category' },
          { name: 'supplier', path: '/pdos/base/supplier', component: './pdos/base/supplier' },
          { name: 'goods', path: '/pdos/base/goods', component: './pdos/base/goods' },
        ]
      },
      { name: 'sale', path: '/pdos/sale/slip', component: './pdos/sale/slip' }
    ],
  },
  { component: '404' },
];
