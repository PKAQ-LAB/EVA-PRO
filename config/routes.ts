/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,title 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @doc https://umijs.org/docs/guides/routes
 */

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
        component: './User/Login',
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
      {
        path: '/admin',
        redirect: '/admin/sub-page',
      },
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        component: './Admin',
      },
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
     // { name: 'workflow', path: '/dev/workflow', component: './dev/workflow' },
      { name: 'formschema', path: '/dev/formschema', component: './dev/formschema' }
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
        { name: 'shop', path: '/pdos/base/shop', component: './pdos/base/shop' },
      ]
    },
    { name: 'sale', path: '/pdos/sale/slip', component: './pdos/sale/slip' }
  ],
  },
  {
    path: '*',
    layout: false,
    component: './404'
  },
];

