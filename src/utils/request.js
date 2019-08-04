/* eslint-disable camelcase */
/**
 * request 网络请求工具
 * 更详细的api文档: https://bigfish.alipay.com/doc/api#request
 */
import { extend } from 'umi-request';
import { message } from 'antd';
import router from 'umi/router';

message.config({
  maxCount: 1,
});

const server = {
  url: 'http://localhost:8080/hctms',
};
/**
 * 异常处理程序
 */
const errorHandler = error => {
  const { response = {} } = error;
  const { status } = response;

  if (status === 401) {
    // @HACK
    /* eslint-disable no-underscore-dangle */
    window.g_app._store.dispatch({
      type: 'login/logout',
    });
    return;
  }
  if (status === 400) {
    return;
  }
  if (status === 403) {
    router.push('/exception/403');
  } else if (status <= 504 && status >= 500) {
    router.push('/exception/500');
  } else if (status >= 404 && status < 422) {
    router.push('/exception/404');
  } else {
    router.push('/user/login');
  }
};
/**
 * 配置request请求时的默认参数
 */

const request = extend({
  prefix: server.url,
  useCache: false,
  // 默认错误处理
  errorHandler,
  // 默认请求是否带上cookie
  credentials: 'include',
});

// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
  // eslint-disable-next-line no-param-reassign
  options.headers = {
    ...options.headers,
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
  };
  return {
    url,
    options: {
      ...options,
      interceptors: true,
    },
  };
});

/**
 * 4. 基于response interceptors
 */
request.interceptors.response.use(async response => {
  const result = await response.clone().json();
  if (result && result.success) {
    if (result.message) {
      message.success(result.message);
    }
  } else {
    message.error(result.message || '操作失败');
  }

  return response;
});

export default request;
