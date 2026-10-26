/**
 * @name 简单版路由配置
 * @description 此配置用于 npm run simple 命令执行后使用
 */
export default [
  {
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
  // EVA-PRO 业务模块：菜单由 /api/auth/fetchMenus 动态提供，
  // 这里只注册路由→组件映射，让 React Router 知道这些 URL 该渲染谁。
  {
    name: 'sys',
    icon: 'setting',
    path: '/sys',
    routes: [
      { path: '/sys', redirect: '/sys/account' },
      { name: 'sys.account', path: '/sys/account', component: './sys/account' },
      { name: 'sys.user', path: '/sys/user', component: './sys/account' },
      {
        name: 'sys.organization',
        path: '/sys/organization',
        component: './sys/organization',
      },
      { name: 'sys.role', path: '/sys/role', component: './sys/role' },
      { name: 'sys.module', path: '/sys/module', component: './sys/module' },
      {
        name: 'sys.dictionary',
        path: '/sys/dictionary',
        component: './sys/dictionary',
      },
    ],
  },
  {
    name: 'log',
    icon: 'profile',
    path: '/log',
    routes: [
      { path: '/log', redirect: '/log/online' },
      { name: 'log.online', path: '/log/online', component: './log/online' },
      { name: 'log.biz', path: '/log/biz', component: './log/biz' },
      { name: 'log.error', path: '/log/error', component: './log/error' },
    ],
  },
  {
    name: 'TanStack Table',
    path: '/examples/tanstack',
    component: './examples/tanstack',
    hideInMenu: true,
  },
  {
    path: '/',
    component: './index',
    layout: false,
    hideInMenu: true,
  },
  {
    path: '/exception/403',
    component: './exception/403',
    layout: false,
    hideInMenu: true,
  },
  {
    component: './exception/404',
    layout: false,
    path: './*',
  },
];
