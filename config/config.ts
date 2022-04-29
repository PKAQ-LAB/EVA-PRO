// https://umijs.org/config/
import { defineConfig, utils } from 'umi';
import path, { join } from 'path';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { winPath } = utils;
const { REACT_APP_ENV } = process.env;

const openBrowser = require('open-browser-webpack-plugin');

export default defineConfig({
  // hash: true,
  // 停用mock
  mock: false,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },
  targets: {
    chrome: 79,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  access: {},
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
    "@layout-sider-background": "#252525",
    "@layout-header-background": "#1e1e1e;",
    "@menu-bg": "#1e1e1e",
    "@menu-dark-submenu-bg":"#1e1e1e",
    "@menu-dark-item-active-bg":"#37373d"
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
 cssLoader: {
    modules: {
      getLocalIdent: (
        context: {
          resourcePath: string;
        },
        _: string,
        localName: string,
      ) => {
        if (
          context.resourcePath.includes('node_modules') ||
          context.resourcePath.includes('ant.design.pro.less') ||
          context.resourcePath.includes('global.less')
        ) {
          return localName;
        }
        const match = context.resourcePath.match(/src(.*)/);
        if (match && match[1]) {
          const antdProPath = match[1].replace('.less', '');
          const arr = winPath(antdProPath)
            .split('/')
            .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
            .map((a: string) => a.toLowerCase());
          return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
        }
        return localName;
      },
    },
  },  chainWebpack(memo, { env, webpack, createCSSRule }) {

    memo.resolve.alias.set('@config', path.resolve(__dirname, '..','config'));
    // 打包优化 uglifyjs-webpack-plugin 配置
    if (REACT_APP_ENV === 'prod') {
      memo.merge({
        plugin: {
          install: {
            plugin: require('uglifyjs-webpack-plugin'),
            args: [
              {
                sourceMap: false,
                uglifyOptions: {
                  compress: {
                    // 删除所有的 `console` 语句
                    drop_console: true,
                  },
                  output: {
                    // 最紧凑的输出
                    beautify: false,
                    // 删除所有的注释
                    comments: false,
                  },
                },
              },
            ],
          },
        },

      });
    } else {
      memo.plugin('open-browser-webpack-plugin')
          .use(openBrowser, [{ url: 'http://localhost:8000' }]);
    }
  }
});
