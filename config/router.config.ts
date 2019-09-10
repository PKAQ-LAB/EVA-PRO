export default [
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    routes: [
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
      // 登陆页
      { name: 'login', path: '/user/login', component: './user/login' },
      // 个人中心
      {
        path: '/user',
        name: 'user',
        routes: [
          { name: 'setting', path: '/user/settings', component: './user/settings' },
          { name: 'center', path: '/user/center', component: './user/center/' },
        ],
      },
      { component: '404' },
    ],
  },
];
