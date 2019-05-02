export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', name: 'login', component: './User/Login' },
      { path: '/user/register', name: 'register', component: './User/Register' },
      {
        path: '/user/register-result',
        name: 'register.result',
        component: './User/RegisterResult',
      },
      {
        component: '404',
      },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      // dashboard
      { path: '/', redirect: '/sys/organization' },
      // 系统管理
      {
        path: '/sys',name: 'sys',icon: 'setting',
        routes: [
          { path: '/sys/organization', name: 'organization', component: './Sys/organization/Index.js' },
          { path: '/sys/account', name: 'account', component: './Sys/account/Index.js' },
          { path: '/sys/module', name: 'module', component: './Sys/module/Index.js' },
          { path: '/sys/role', name: 'role', component: './Sys/role/Index.js' },
          { path: '/sys/dictionary', name: 'dictionary', component: './Sys/dictionary/Index.js' },
        ],
      },
      // 异常页
      {
        name: 'exception',icon: 'warning',path: '/exception',
        routes: [
          // exception
          {path: '/exception/403',name: 'not-permission',component: './Exception/403',},
          {path: '/exception/404',name: 'not-find',component: './Exception/404',},
          {path: '/exception/500',name: 'server-error',component: './Exception/500',},
          {path: '/exception/trigger',name: 'trigger',hideInMenu: true,component: './Exception/TriggerException',},
        ],
      },
      // 个人中心
      {
        name: 'account',icon: 'user',path: '/account',
        routes: [
          {path: '/account/center',name: 'center',component: './Account/Center/Center',
            routes: [
              {path: '/account/center',redirect: '/account/center/articles',},
              {path: '/account/center/articles',component: './Account/Center/Articles',},
              {path: '/account/center/applications',component: './Account/Center/Applications',},
              {path: '/account/center/projects',component: './Account/Center/Projects',},
            ],
          },
          {
            path: '/account/settings',name: 'settings',component: './Account/Settings/Info',
            routes: [
              {path: '/account/settings',redirect: '/account/settings/base',},
              {path: '/account/settings/base',component: './Account/Settings/BaseView',},
              {path: '/account/settings/security',component: './Account/Settings/SecurityView',},
              {path: '/account/settings/binding',component: './Account/Settings/BindingView',},
              {path: '/account/settings/notification',component: './Account/Settings/NotificationView',},
            ],
          },
        ],
      },    
      {
        component: '404',
      },
    ],
  },
];
