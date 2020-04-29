// https://umijs.org/config/
import { defineConfig, utils } from 'umi';
import path from 'path';
import pageRoutes from './router.config';
import proxy from './proxy';

const { winPath } = utils;

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  alias: {
    'config': "../config/"
  },
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  // dynamicImport: {
  //   loading: '@/components/PageLoading/index',
  // },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: pageRoutes,
  theme: {
    "@layout-sider-background": "#252525",
    "@layout-header-background": "#1e1e1e;",
    "@menu-bg": "#1e1e1e",
    "@menu-dark-submenu-bg":"#1e1e1e",
    "@menu-dark-item-active-bg":"#37373d",
  },
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
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
  },
  chainWebpack(memo, { env, webpack, createCSSRule }) {
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
    }

  },
  manifest: {
    basePath: '/',
  },
});
