/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { message } from 'antd';

message.config({
  maxCount: 1,
});

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;

  if (!response) {
    message.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return response;
};

/**
 * 配置request请求时的默认参数
 */

const request = extend({
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
