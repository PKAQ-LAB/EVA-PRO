export default [
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    routes: [
      { path: '/welcome', name: 'welcome', icon: 'smile', component: './Welcome' },
      // dashboard
      { path: '/', redirect: '/sys/organization' },
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
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          { name: 'login', path: '/user/login', component: './user/login' },
          { name: 'setting', path: '/user/setting', component: './user/setting' },
          { name: 'center', path: '/user/center', component: './user/center' },
        ],
      },
      { component: '404' },
    ],
  },
];
