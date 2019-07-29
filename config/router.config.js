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
    routes: [
      // dashboard
      { path: '/', redirect: '/sys/organization' },
      // 系统管理
      {
        path: '/sys',
        name: 'sys',
        icon: 'setting',
        routes: [
          {
            path: '/sys/organization',
            tabname: '组织管理',
            name: 'organization',
            component: './Sys/organization/Index.js',
          },
          {
            path: '/sys/account',
            name: 'account',
            tabname: '用户管理',
            component: './Sys/account/Index.js',
          },
          {
            path: '/sys/module',
            name: 'module',
            tabname: '模块管理',
            component: './Sys/module/Index.js',
          },
          {
            path: '/sys/role',
            name: 'role',
            tabname: '权限管理',
            component: './Sys/role/Index.js',
          },
          {
            path: '/sys/dictionary',
            name: 'dictionary',
            tabname: '字典管理',
            component: './Sys/dictionary/Index.js',
          },
        ],
      },
      //进销存
      {
        path: '/pdos',
        name: 'pdos',
        icon: 'shop',
        routes: [
          // 基
          {
            path: '/pdos/base',
            name: 'base',
            routes: [
              {
                path: '/pdos/base/category',
                name: 'category',
                component: './Pdos/base/category/Index.js',
              },
              { path: '/pdos/base/goods', name: 'goods', component: './Pdos/base/goods/Index.js' },
              // { path: '/pdos/base/supplier', name: 'supplier', component: './Pdos/base/supplier' },
              // { path: '/pdos/base/warehouse', name: 'warehouse', component: './Pdos/base/warehouse' },
            ],
          },
          // 进
          {
            path: '/pdos/purchasing',
            name: 'purchasing',
            routes: [
              {
                path: '/pdos/purchasing/orders',
                name: 'orders',
                component: './Pdos/purchasing/orders/Index.js',
              },
            ],
          },
          // // 销
          // { path: '/pdos/sales', name: 'sales', routes: [
          //     { path: '/pdos/sales/orders', name: 'orders', component: './Pdos/sales/orders' },
          //   ] },
          // // 存
          // { path: '/pdos/inventory', name: 'inventory', routes: [
          //     { path: '/pdos/inventory/accbook', name: 'accbook', component: './Pdos/inventory/accbook' },
          //   ] },
          // { path: '/pdos/analysis', name: 'analysis', routes: [] },
        ],
      },
      // 异常页
      {
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        routes: [
          // exception
          { path: '/exception/403', name: 'not-permission', component: './Exception/403' },
          { path: '/exception/404', name: 'not-find', component: './Exception/404' },
          { path: '/exception/500', name: 'server-error', component: './Exception/500' },
          {
            path: '/exception/trigger',
            name: 'trigger',
            hideInMenu: true,
            component: './Exception/TriggerException',
          },
        ],
      },
      // 个人中心
      {
        name: 'account',
        icon: 'user',
        path: '/account',
        routes: [
          {
            path: '/account/center',
            istab: false,
            name: 'center',
            component: './Account/Center/Center',
            routes: [
              { path: '/account/center', redirect: '/account/center/articles' },
              {
                path: '/account/center/articles',
                istab: false,
                component: './Account/Center/Articles',
              },
              {
                path: '/account/center/applications',
                istab: false,
                component: './Account/Center/Applications',
              },
              {
                path: '/account/center/projects',
                istab: false,
                component: './Account/Center/Projects',
              },
            ],
          },
          {
            path: '/account/settings',
            istab: false,
            name: 'settings',
            component: './Account/Settings/Info',
            routes: [
              { path: '/account/settings', redirect: '/account/settings/base' },
              {
                path: '/account/settings/base',
                istab: false,
                component: './Account/Settings/BaseView',
              },
              {
                path: '/account/settings/security',
                istab: false,
                component: './Account/Settings/SecurityView',
              },
              { path: '/account/settings/binding', component: './Account/Settings/BindingView' },
              {
                path: '/account/settings/notification',
                component: './Account/Settings/NotificationView',
              },
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
