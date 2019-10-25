export default [
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { name: 'login', path: '/user/login', component: './user/login' },
    ],
  },
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/',
        component: '../layouts/BasicLayout',
        routes: [
          { path: '/', redirect: '/welcome' },
          { path: '/welcome', name: 'welcome', icon: 'smile', component: './Welcome' },
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
              { name: 'center', path: '/config/center', component: './user/center/' },
            ],
          },
          // 系统日志
          {
            path: '/monitor',
            name: 'log',
            routes: [
              { name: 'biz', path: '/monitor/log/biz', component: './log/biz' },
              { name: 'error', path: '/monitor/log/error', component: './log/error' },
            ],
          },
          // 代码生成器
          {
            path: '/dev',
            name: 'dev',
            routes: [{ name: 'generator', path: '/dev/generator', component: './dev/generator' }],
          },
          // pdos
          {
            path: '/pdos/purchasing',
            name: 'purchasing',
            component: './pdos/purchasing',
          },
        ],
      },
      { component: '404' },
    ],
  },
];
