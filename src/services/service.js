import { stringify } from 'qs';
import { request } from '@umijs/max';
import { getNoUndefinedString } from '@/utils/utils';

// get请求
async function get(url, params) {
  return request(`${url}/${getNoUndefinedString(params)}`);
}

// 加载列表
async function list(url, params) {
  return request(`${url}?${stringify(params)}`);
}

// post请求
async function post(url, params) {
  return request(url, {
    method: 'POST',
    data: params,
  });
}

export default {
  get,
  list,
  post
}
