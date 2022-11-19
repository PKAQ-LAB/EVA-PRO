import type { IApi } from 'umi';
import path from 'path';
const { WebpackOpenBrowser } = require('webpack-open-browser');

export default (api: IApi) => {
  api.addHTMLHeadScripts(() => `console.log('I am in HTML-head')`)
  api.onDevCompileDone((opts) => {
    console.log('> onDevCompileDone', opts.isFirstCompile);
  });
  api.onBuildComplete((opts) => {
    console.log('> onBuildComplete', opts.isFirstCompile);
  });
  api.chainWebpack((memo) => {
    memo.resolve.alias.set('@config', path.resolve(__dirname, '..', 'config'));
    memo
        .plugin('webpack-open-browser')
        .use(WebpackOpenBrowser, [{ url: 'http://localhost:8000' }]);
  });
};
